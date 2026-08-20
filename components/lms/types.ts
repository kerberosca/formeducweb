export type PublicCourseSummary = {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  theme: string;
  level: string;
  offer: string;
  priceCents: number | null;
  currency: string;
  priceLabel: string;
  durationMinutes: number;
  durationLabel: string;
  format: string;
  audience: string;
  outcomes: string[];
  prerequisites: string[];
  status: string;
  isPurchasable: boolean;
  featured: boolean;
  lessonCount: number;
};

export type LessonBlock =
  | { type: "title"; level: 2 | 3 | 4; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; style: "bullet" | "numbered"; items: string[] }
  | {
      type: "callout";
      tone: "info" | "warning" | "success";
      title?: string;
      text: string;
    }
  | { type: "steps"; items: { title: string; text?: string }[] }
  | { type: "image"; src: string; alt: string; caption?: string }
  | { type: "link"; href: string; label: string; description?: string }
  | {
      type: "exercise";
      title: string;
      instructions: string;
      successCriteria: string[];
    };

export type LearningQuiz = {
  id: string;
  title: string;
  description: string | null;
  passingScore: number;
  maxAttempts: number | null;
  attemptCount: number;
  questions: {
    id: string;
    prompt: string;
    choices: { id: string; label: string }[];
  }[];
};

export type LearningLesson = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  durationMinutes: number;
  position: number;
  isRequired: boolean;
  content: { version: 1; blocks: LessonBlock[] };
  quiz: LearningQuiz | null;
  resources: {
    id: string;
    title: string;
    description: string | null;
    kind: string;
    fileName: string | null;
  }[];
};

export type LearningModule = {
  id: string;
  title: string;
  description: string | null;
  position: number;
  lessons: LearningLesson[];
};

export type PublicCourseDetail = PublicCourseSummary & {
  modules: LearningModule[];
};
