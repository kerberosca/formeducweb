ALTER TABLE "Assessment" ADD COLUMN "assessmentType" TEXT NOT NULL DEFAULT 'loi25';

CREATE INDEX "Assessment_assessmentType_idx" ON "Assessment"("assessmentType");
