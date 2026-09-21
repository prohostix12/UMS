-- CreateTable
CREATE TABLE "semester" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "academicSessionId" TEXT NOT NULL,
    "semesterName" TEXT NOT NULL,
    "semesterNumber" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "semester_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "semester_programId_semesterNumber_key" ON "semester"("programId", "semesterNumber");
CREATE INDEX "semester_organizationId_idx" ON "semester"("organizationId");
CREATE INDEX "semester_programId_idx" ON "semester"("programId");

ALTER TABLE "semester" ADD CONSTRAINT "semester_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "semester" ADD CONSTRAINT "semester_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "semester" ADD CONSTRAINT "semester_academicSessionId_fkey" FOREIGN KEY ("academicSessionId") REFERENCES "AdmissionSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "modules" ADD COLUMN "semesterId" TEXT;
ALTER TABLE "modules" ADD CONSTRAINT "modules_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "semester"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "modules_semesterId_idx" ON "modules"("semesterId");
