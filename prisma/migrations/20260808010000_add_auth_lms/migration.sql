-- Auth.js accounts and database sessions.
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" DATETIME,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'learner',
    "isActive" BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL
);

CREATE TABLE "Course" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "shortTitle" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "theme" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "offer" TEXT NOT NULL,
    "priceCents" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'cad',
    "durationMinutes" INTEGER NOT NULL,
    "durationLabel" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "audience" TEXT NOT NULL,
    "outcomes" JSONB NOT NULL,
    "prerequisites" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "isPurchasable" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "contentVersion" INTEGER NOT NULL DEFAULT 1,
    "publishedAt" DATETIME,
    "archivedAt" DATETIME
);

CREATE TABLE "CourseModule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "position" INTEGER NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "archivedAt" DATETIME,
    CONSTRAINT "CourseModule_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "Lesson" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "moduleId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "content" JSONB NOT NULL,
    "contentVersion" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "archivedAt" DATETIME,
    CONSTRAINT "Lesson_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "CourseModule" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "CourseResource" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "courseId" TEXT NOT NULL,
    "lessonId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "kind" TEXT NOT NULL DEFAULT 'file',
    "fileName" TEXT,
    "storageKey" TEXT,
    "mimeType" TEXT,
    "sizeBytes" INTEGER,
    "externalUrl" TEXT,
    "isProtected" BOOLEAN NOT NULL DEFAULT true,
    "archivedAt" DATETIME,
    CONSTRAINT "CourseResource_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CourseResource_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "Enrollment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "orderId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "source" TEXT NOT NULL DEFAULT 'free',
    "progressPercent" INTEGER NOT NULL DEFAULT 0,
    "lastLessonId" TEXT,
    "enrolledAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "revokedAt" DATETIME,
    CONSTRAINT "Enrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Enrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Enrollment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "LessonProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "lastPosition" INTEGER NOT NULL DEFAULT 0,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    CONSTRAINT "LessonProgress_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LessonProgress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "Quiz" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lessonId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "passingScore" INTEGER NOT NULL DEFAULT 80,
    "maxAttempts" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'draft',
    CONSTRAINT "Quiz_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "QuizQuestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "quizId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "explanation" TEXT,
    "position" INTEGER NOT NULL,
    CONSTRAINT "QuizQuestion_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "QuizChoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "questionId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL,
    CONSTRAINT "QuizChoice_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuizQuestion" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "QuizAttempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "answers" JSONB NOT NULL,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QuizAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "QuizAttempt_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "QuizAttempt_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "QuizAttempt_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "issuedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" DATETIME,
    "pdfHash" TEXT,
    CONSTRAINT "Certificate_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Certificate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Certificate_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "AdminAuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "before" JSONB,
    "after" JSONB,
    "ipHash" TEXT,
    CONSTRAINT "AdminAuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "AuthRateLimit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "scope" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "windowStarted" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastAttemptAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "blockedUntil" DATETIME
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_role_isActive_idx" ON "User"("role", "isActive");
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");
CREATE INDEX "Account_userId_idx" ON "Account"("userId");
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
CREATE INDEX "Session_expires_idx" ON "Session"("expires");
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");
CREATE INDEX "VerificationToken_expires_idx" ON "VerificationToken"("expires");
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");
CREATE UNIQUE INDEX "Course_slug_key" ON "Course"("slug");
CREATE INDEX "Course_status_featured_idx" ON "Course"("status", "featured");
CREATE INDEX "Course_theme_idx" ON "Course"("theme");
CREATE INDEX "Course_offer_idx" ON "Course"("offer");
CREATE INDEX "CourseModule_courseId_archivedAt_idx" ON "CourseModule"("courseId", "archivedAt");
CREATE UNIQUE INDEX "CourseModule_courseId_position_key" ON "CourseModule"("courseId", "position");
CREATE INDEX "Lesson_moduleId_status_idx" ON "Lesson"("moduleId", "status");
CREATE UNIQUE INDEX "Lesson_moduleId_slug_key" ON "Lesson"("moduleId", "slug");
CREATE UNIQUE INDEX "Lesson_moduleId_position_key" ON "Lesson"("moduleId", "position");
CREATE UNIQUE INDEX "CourseResource_storageKey_key" ON "CourseResource"("storageKey");
CREATE INDEX "CourseResource_courseId_archivedAt_idx" ON "CourseResource"("courseId", "archivedAt");
CREATE INDEX "CourseResource_lessonId_idx" ON "CourseResource"("lessonId");
CREATE UNIQUE INDEX "Enrollment_orderId_key" ON "Enrollment"("orderId");
CREATE INDEX "Enrollment_courseId_status_idx" ON "Enrollment"("courseId", "status");
CREATE INDEX "Enrollment_userId_status_idx" ON "Enrollment"("userId", "status");
CREATE UNIQUE INDEX "Enrollment_userId_courseId_key" ON "Enrollment"("userId", "courseId");
CREATE INDEX "LessonProgress_lessonId_idx" ON "LessonProgress"("lessonId");
CREATE UNIQUE INDEX "LessonProgress_enrollmentId_lessonId_key" ON "LessonProgress"("enrollmentId", "lessonId");
CREATE UNIQUE INDEX "Quiz_lessonId_key" ON "Quiz"("lessonId");
CREATE INDEX "Quiz_status_idx" ON "Quiz"("status");
CREATE UNIQUE INDEX "QuizQuestion_quizId_position_key" ON "QuizQuestion"("quizId", "position");
CREATE UNIQUE INDEX "QuizChoice_questionId_position_key" ON "QuizChoice"("questionId", "position");
CREATE INDEX "QuizAttempt_enrollmentId_quizId_idx" ON "QuizAttempt"("enrollmentId", "quizId");
CREATE INDEX "QuizAttempt_userId_createdAt_idx" ON "QuizAttempt"("userId", "createdAt");
CREATE UNIQUE INDEX "Certificate_enrollmentId_key" ON "Certificate"("enrollmentId");
CREATE UNIQUE INDEX "Certificate_token_key" ON "Certificate"("token");
CREATE INDEX "Certificate_userId_issuedAt_idx" ON "Certificate"("userId", "issuedAt");
CREATE INDEX "Certificate_courseId_issuedAt_idx" ON "Certificate"("courseId", "issuedAt");
CREATE INDEX "AdminAuditLog_actorId_createdAt_idx" ON "AdminAuditLog"("actorId", "createdAt");
CREATE INDEX "AdminAuditLog_entityType_entityId_idx" ON "AdminAuditLog"("entityType", "entityId");
CREATE INDEX "AuthRateLimit_blockedUntil_idx" ON "AuthRateLimit"("blockedUntil");
CREATE UNIQUE INDEX "AuthRateLimit_scope_keyHash_key" ON "AuthRateLimit"("scope", "keyHash");
