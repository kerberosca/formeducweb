export const COURSE_LEVELS = [
  "beginner",
  "intermediate",
  "advanced",
  "enterprise",
  "custom"
] as const;

export type CourseLevel = (typeof COURSE_LEVELS)[number];

export const COURSE_LEVEL_LABELS: Record<CourseLevel, string> = {
  beginner: "Débutant",
  intermediate: "Intermédiaire",
  advanced: "Avancé",
  enterprise: "Entreprise",
  custom: "Sur mesure"
};

export const COURSE_FORMATS = [
  "self-paced",
  "live-remote",
  "in-person",
  "hybrid",
  "cohort",
  "custom"
] as const;

export type CourseFormat = (typeof COURSE_FORMATS)[number];

export const COURSE_FORMAT_LABELS: Record<CourseFormat, string> = {
  "self-paced": "Autonome",
  "live-remote": "Direct à distance",
  "in-person": "Présentiel",
  hybrid: "Hybride",
  cohort: "Cohorte",
  custom: "Personnalisé"
};

export const LESSON_PROGRESS_STATUSES = ["in_progress", "completed"] as const;

export const MAX_RESOURCE_BYTES = 25 * 1024 * 1024;

export const ALLOWED_RESOURCE_MIME_TYPES = {
  ".pdf": ["application/pdf"],
  ".docx": [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ],
  ".xlsx": [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ],
  ".pptx": [
    "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  ],
  ".csv": ["text/csv", "application/csv"],
  ".txt": ["text/plain"],
  ".png": ["image/png"],
  ".jpg": ["image/jpeg"],
  ".jpeg": ["image/jpeg"]
} as const;
