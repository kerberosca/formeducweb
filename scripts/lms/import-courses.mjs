import { copyFile, mkdir, stat } from "node:fs/promises";
import { resolve } from "node:path";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";

import { courses } from "../../lib/training.ts";

const databaseUrl = process.env.DATABASE_URL || "file:./prisma/dev.db";
const adapter = new PrismaBetterSqlite3({ url: databaseUrl });
const prisma = new PrismaClient({ adapter });

async function ensurePracticeFile() {
  const resourceRoot = resolve(
    process.env.LMS_RESOURCE_ROOT ||
      (process.env.NODE_ENV === "production"
        ? "/data/lms-resources"
        : "data/lms-resources")
  );
  const target = resolve(resourceRoot, "excel-essentiel-pratique.xlsx");

  await mkdir(resourceRoot, { recursive: true });
  try {
    await stat(target);
  } catch {
    await copyFile(
      resolve("lms-seed-resources", "excel-essentiel-pratique.xlsx"),
      target
    );
  }

  return target;
}

const levelMap = {
  beginner: "beginner",
  intermediate: "intermediate",
  all: "beginner"
};

const quizDefinitions = {
  "internet-sans-stress": [
    {
      prompt:
        "Quelle source privilégier pour confirmer une démarche gouvernementale?",
      choices: [
        ["Le site officiel de l’organisme", true],
        ["Le premier message reçu sur un réseau social", false],
        ["Une publicité sans auteur", false]
      ]
    },
    {
      prompt: "Quel geste réduit l’effet d’un mot de passe compromis?",
      choices: [
        ["Utiliser un mot de passe unique par service", true],
        ["Réutiliser le même mot de passe avec un chiffre différent", false],
        ["Partager ses codes de connexion avec un collègue", false]
      ]
    },
    {
      prompt: "Que faire devant un fichier inattendu?",
      choices: [
        ["Vérifier la source avant de l’ouvrir", true],
        ["L’ouvrir immédiatement pour connaître son contenu", false],
        ["Le transférer à toute l’équipe", false]
      ]
    }
  ],
  "ia-au-travail": [
    {
      prompt: "Quelles données faut-il garder hors d’un assistant IA public?",
      choices: [
        ["Les renseignements confidentiels ou personnels", true],
        ["Un exemple entièrement fictif", false],
        ["Une consigne de mise en forme", false]
      ]
    },
    {
      prompt: "Qui reste responsable d’un résultat utilisé au travail?",
      choices: [
        ["La personne ou l’organisation qui l’utilise", true],
        ["L’outil d’IA uniquement", false],
        ["Personne si le texte semble convaincant", false]
      ]
    },
    {
      prompt: "Que doit contenir une demande utile?",
      choices: [
        ["Contexte, tâche et contraintes", true],
        ["Seulement un mot-clé", false],
        ["Des données clients complètes", false]
      ]
    }
  ],
  "excel-essentiel": [
    {
      prompt: "Quelle structure convient à une liste Excel fiable?",
      choices: [
        ["Une ligne par élément et une donnée par cellule", true],
        ["Plusieurs clients dans une même cellule", false],
        ["Des totaux insérés entre chaque ligne", false]
      ]
    },
    {
      prompt: "Quelle référence reste fixe lorsqu’une formule est recopiée?",
      choices: [
        ["$E$2", true],
        ["E2", false],
        ["E:E sans limite", false]
      ]
    },
    {
      prompt: "Quelle fonction compte les cellules correspondant à un critère?",
      choices: [
        ["NB.SI", true],
        ["SOMME", false],
        ["RECHERCHEX", false]
      ]
    }
  ],
  "cybersecurite-reflexes-equipe": [
    {
      prompt:
        "Quel réflexe adopter devant une demande financière urgente et inhabituelle?",
      choices: [
        ["Vérifier par un canal déjà connu", true],
        ["Répondre directement au message", false],
        ["Payer avant de poser une question", false]
      ]
    },
    {
      prompt: "Peut-on transmettre un code de connexion reçu par texto?",
      choices: [
        ["Non, ce code doit rester secret", true],
        ["Oui, si le message semble pressant", false],
        ["Oui, à toute personne qui connaît notre nom", false]
      ]
    },
    {
      prompt: "Pourquoi signaler rapidement un incident possible?",
      choices: [
        ["Pour permettre une réaction et limiter les conséquences", true],
        ["Pour éviter toute trace de l’événement", false],
        ["Pour mener soi-même une enquête", false]
      ]
    }
  ]
};

function buildLessonContent(lesson) {
  const blocks = [{ type: "paragraph", text: lesson.summary }];

  for (const section of lesson.sections || []) {
    blocks.push({ type: "title", level: 2, text: section.heading });
    for (const paragraph of section.paragraphs) {
      blocks.push({ type: "paragraph", text: paragraph });
    }
    if (section.checklist?.length) {
      blocks.push({
        type: "list",
        style: "bullet",
        items: [...section.checklist]
      });
    }
  }

  if (lesson.exercise) {
    blocks.push({
      type: "exercise",
      title: "Mise en pratique",
      instructions: lesson.exercise,
      successCriteria: [
        "L’exercice est réalisé avec les données ou outils proposés.",
        "Le résultat est vérifié avant de poursuivre."
      ]
    });
  }

  return { version: 1, blocks };
}

function courseStatus(course) {
  return course.availability === "preparation" ? "preparation" : "published";
}

function courseFormat(course) {
  return course.offer === "custom" ? "custom" : "self-paced";
}

function coursePrice(course) {
  if (course.slug === "excel-essentiel") return 4900;
  if (course.slug === "word-documents-professionnels") return 3900;
  return course.offer === "free" ? 0 : null;
}

async function seedQuiz(transaction, lesson, course) {
  const definitions = quizDefinitions[course.slug];
  if (!definitions?.length) return;

  const existingQuiz = await transaction.quiz.findUnique({
    where: { lessonId: lesson.id },
    include: { _count: { select: { attempts: true } } }
  });

  if (existingQuiz?._count.attempts) return;

  if (existingQuiz) {
    await transaction.quizQuestion.deleteMany({
      where: { quizId: existingQuiz.id }
    });
  }

  const quiz = existingQuiz
    ? await transaction.quiz.update({
        where: { id: existingQuiz.id },
        data: {
          title: `Validation — ${course.shortTitle}`,
          description: "Trois questions pour vérifier les principaux réflexes.",
          passingScore: 80,
          maxAttempts: 3,
          status: "published"
        }
      })
    : await transaction.quiz.create({
        data: {
          lessonId: lesson.id,
          title: `Validation — ${course.shortTitle}`,
          description: "Trois questions pour vérifier les principaux réflexes.",
          passingScore: 80,
          maxAttempts: 3,
          status: "published"
        }
      });

  for (const [questionIndex, definition] of definitions.entries()) {
    await transaction.quizQuestion.create({
      data: {
        quizId: quiz.id,
        prompt: definition.prompt,
        explanation: "Revoyez la leçon si ce réflexe n’est pas encore clair.",
        position: questionIndex + 1,
        choices: {
          create: definition.choices.map(([label, isCorrect], choiceIndex) => ({
            label,
            isCorrect,
            position: choiceIndex + 1
          }))
        }
      }
    });
  }
}

const practicePath = await ensurePracticeFile();
const result = await prisma.$transaction(
  async (transaction) => {
    const imported = [];

    for (const course of courses) {
      const existing = await transaction.course.findUnique({
        where: { slug: course.slug },
        include: { _count: { select: { enrollments: true } } }
      });
      const status = courseStatus(course);
      const commonData = {
        title: course.title,
        shortTitle: course.shortTitle,
        description: course.description,
        theme: course.theme,
        level: levelMap[course.level],
        offer: course.offer,
        priceCents: coursePrice(course),
        currency: "cad",
        durationMinutes: course.durationMinutes,
        durationLabel: course.durationLabel,
        format: courseFormat(course),
        audience: course.audience,
        outcomes: [...course.outcomes],
        prerequisites: [...course.prerequisites],
        status,
        isPurchasable: course.slug === "excel-essentiel",
        featured: Boolean(course.featured),
        publishedAt:
          status === "published" ? existing?.publishedAt || new Date() : null,
        archivedAt: null
      };
      const savedCourse = await transaction.course.upsert({
        where: { slug: course.slug },
        create: { slug: course.slug, ...commonData },
        update: commonData
      });
      const courseModule = await transaction.courseModule.upsert({
        where: {
          courseId_position: { courseId: savedCourse.id, position: 1 }
        },
        create: {
          courseId: savedCourse.id,
          title: "Parcours principal",
          description: "Leçons à suivre dans l’ordre proposé.",
          position: 1,
          isRequired: true
        },
        update: {
          title: "Parcours principal",
          description: "Leçons à suivre dans l’ordre proposé.",
          archivedAt: null
        }
      });

      const savedLessons = [];
      for (const [lessonIndex, lesson] of course.lessons.entries()) {
        const lessonData = {
          title: lesson.title,
          summary: lesson.summary,
          durationMinutes: lesson.durationMinutes,
          position: lessonIndex + 1,
          content: buildLessonContent(lesson),
          contentVersion: 1,
          status: status === "published" ? "published" : "draft",
          isRequired: true,
          archivedAt: null
        };
        const savedLesson = await transaction.lesson.upsert({
          where: {
            moduleId_slug: { moduleId: courseModule.id, slug: lesson.id }
          },
          create: {
            moduleId: courseModule.id,
            slug: lesson.id,
            ...lessonData
          },
          update:
            existing?._count.enrollments > 0
              ? {
                  title: lesson.title,
                  summary: lesson.summary,
                  durationMinutes: lesson.durationMinutes,
                  position: lessonIndex + 1,
                  archivedAt: null
                }
              : lessonData
        });
        savedLessons.push(savedLesson);
      }

      const lastLesson = savedLessons.at(-1);
      if (lastLesson && status === "published") {
        await seedQuiz(transaction, lastLesson, course);
      }

      imported.push({
        slug: savedCourse.slug,
        lessons: savedLessons.length,
        status: savedCourse.status,
        isPurchasable: savedCourse.isPurchasable
      });
    }

    const practiceFile = await stat(practicePath);
    const excelCourse = await transaction.course.findUniqueOrThrow({
      where: { slug: "excel-essentiel" }
    });
    await transaction.courseResource.upsert({
      where: { storageKey: "excel-essentiel-pratique.xlsx" },
      create: {
        courseId: excelCourse.id,
        title: "Classeur de pratique — Excel essentiel",
        description:
          "Données, formules, tableau de bord et exercices guidés utilisés dans le parcours.",
        kind: "file",
        fileName: "excel-essentiel-pratique.xlsx",
        storageKey: "excel-essentiel-pratique.xlsx",
        mimeType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        sizeBytes: practiceFile.size,
        isProtected: true
      },
      update: {
        courseId: excelCourse.id,
        title: "Classeur de pratique — Excel essentiel",
        sizeBytes: practiceFile.size,
        archivedAt: null
      }
    });

    return imported;
  },
  { timeout: 30_000 }
);

console.log(JSON.stringify({ imported: result }, null, 2));
await prisma.$disconnect();
