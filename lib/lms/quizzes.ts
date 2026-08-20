import type { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { issueCertificateIfEligible } from "@/lib/lms/certificates";
import { requireActiveEnrollment } from "@/lib/lms/enrollments";
import { LmsError } from "@/lib/lms/errors";

export type QuizLocator = {
  quizId?: string;
  lessonId?: string;
};

export type QuizAnswer = {
  questionId: string;
  choiceId: string;
};

function quizWhere(locator: QuizLocator): Prisma.QuizWhereInput {
  return {
    ...(locator.quizId ? { id: locator.quizId } : {}),
    ...(locator.lessonId ? { lessonId: locator.lessonId } : {}),
    status: "published",
    lesson: {
      status: "published",
      archivedAt: null,
      module: {
        archivedAt: null
      }
    }
  };
}

async function findAvailableQuiz(locator: QuizLocator) {
  const quiz = await db.quiz.findFirst({
    where: quizWhere(locator),
    include: {
      lesson: {
        select: {
          id: true,
          title: true,
          module: { select: { courseId: true } }
        }
      },
      questions: {
        orderBy: { position: "asc" },
        include: { choices: { orderBy: { position: "asc" } } }
      }
    }
  });

  if (!quiz) {
    throw new LmsError(
      404,
      "Le questionnaire est introuvable.",
      "quiz_not_found"
    );
  }

  const isValid =
    quiz.questions.length > 0 &&
    quiz.passingScore >= 0 &&
    quiz.passingScore <= 100 &&
    quiz.questions.every(
      (question) =>
        question.choices.length >= 2 &&
        question.choices.filter((choice) => choice.isCorrect).length === 1
    );

  if (!isValid) {
    throw new LmsError(
      409,
      "Ce questionnaire n’est pas prêt.",
      "quiz_not_ready"
    );
  }

  return quiz;
}

export async function getQuizForUser(userId: string, locator: QuizLocator) {
  const quiz = await findAvailableQuiz(locator);
  const courseId = quiz.lesson.module.courseId;
  const enrollment = await requireActiveEnrollment(userId, courseId);
  const attempts = await db.quizAttempt.findMany({
    where: { enrollmentId: enrollment.id, quizId: quiz.id },
    orderBy: { submittedAt: "desc" },
    select: {
      id: true,
      score: true,
      passed: true,
      submittedAt: true
    }
  });

  return {
    id: quiz.id,
    lessonId: quiz.lessonId,
    lessonTitle: quiz.lesson.title,
    title: quiz.title,
    description: quiz.description,
    passingScore: quiz.passingScore,
    maxAttempts: quiz.maxAttempts,
    attemptCount: attempts.length,
    remainingAttempts:
      quiz.maxAttempts === null
        ? null
        : Math.max(0, quiz.maxAttempts - attempts.length),
    bestScore: attempts.length
      ? Math.max(...attempts.map((attempt) => attempt.score))
      : null,
    passed: attempts.some((attempt) => attempt.passed),
    attempts,
    questions: quiz.questions.map((question) => ({
      id: question.id,
      prompt: question.prompt,
      position: question.position,
      choices: question.choices.map((choice) => ({
        id: choice.id,
        label: choice.label,
        position: choice.position
      }))
    }))
  };
}

export async function submitQuizAttempt(
  userId: string,
  quizId: string,
  answers: QuizAnswer[]
) {
  const quiz = await findAvailableQuiz({ quizId });
  const courseId = quiz.lesson.module.courseId;
  const enrollment = await requireActiveEnrollment(userId, courseId);
  const answerByQuestion = new Map(
    answers.map((answer) => [answer.questionId, answer.choiceId])
  );

  if (
    answerByQuestion.size !== quiz.questions.length ||
    answers.length !== quiz.questions.length
  ) {
    throw new LmsError(
      400,
      "Toutes les questions doivent recevoir exactement une réponse.",
      "incomplete_quiz_answers"
    );
  }

  const evaluated = quiz.questions.map((question) => {
    const selectedChoiceId = answerByQuestion.get(question.id);
    const selectedChoice = question.choices.find(
      (choice) => choice.id === selectedChoiceId
    );
    if (!selectedChoice) {
      throw new LmsError(
        400,
        "Une réponse ne correspond pas au questionnaire.",
        "invalid_quiz_answer"
      );
    }
    const correctChoice = question.choices.find((choice) => choice.isCorrect)!;
    return {
      questionId: question.id,
      selectedChoiceId: selectedChoice.id,
      correctChoiceId: correctChoice.id,
      correct: selectedChoice.id === correctChoice.id,
      explanation: question.explanation
    };
  });

  const correctCount = evaluated.filter((answer) => answer.correct).length;
  const score = Math.round((correctCount * 100) / quiz.questions.length);
  const passed = score >= quiz.passingScore;

  const { attempt, mayRevealCorrection } = await db.$transaction(
    async (transaction) => {
      const currentEnrollment = await requireActiveEnrollment(
        userId,
        courseId,
        transaction
      );
      const attemptCount = await transaction.quizAttempt.count({
        where: { enrollmentId: currentEnrollment.id, quizId: quiz.id }
      });

      if (quiz.maxAttempts !== null && attemptCount >= quiz.maxAttempts) {
        throw new LmsError(
          409,
          "Le nombre maximal de tentatives est atteint.",
          "quiz_attempt_limit_reached"
        );
      }

      const attempt = await transaction.quizAttempt.create({
        data: {
          userId,
          courseId,
          enrollmentId: currentEnrollment.id,
          quizId: quiz.id,
          score,
          passed,
          answers: evaluated.map((answer) => ({
            questionId: answer.questionId,
            choiceId: answer.selectedChoiceId,
            correct: answer.correct
          }))
        },
        select: {
          id: true,
          score: true,
          passed: true,
          submittedAt: true
        }
      });

      return {
        attempt,
        mayRevealCorrection:
          passed ||
          (quiz.maxAttempts !== null && attemptCount + 1 >= quiz.maxAttempts)
      };
    }
  );

  if (passed) {
    await issueCertificateIfEligible(userId, enrollment.id);
  }

  return {
    ...attempt,
    passingScore: quiz.passingScore,
    feedback: evaluated.map((answer) => ({
      questionId: answer.questionId,
      selectedChoiceId: answer.selectedChoiceId,
      correct: answer.correct,
      ...(mayRevealCorrection
        ? {
            correctChoiceId: answer.correctChoiceId,
            explanation: answer.explanation
          }
        : {})
    }))
  };
}
