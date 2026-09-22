CREATE TABLE "ExaminationRegistration" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "examinationId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "enrollmentNo" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "confirmedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ExaminationRegistration_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ExaminationRegistration_examinationId_studentId_key" ON "ExaminationRegistration"("examinationId", "studentId");
CREATE INDEX "ExaminationRegistration_organizationId_examinationId_idx" ON "ExaminationRegistration"("organizationId", "examinationId");

ALTER TABLE "ExaminationRegistration" ADD CONSTRAINT "ExaminationRegistration_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ExaminationRegistration" ADD CONSTRAINT "ExaminationRegistration_examinationId_fkey" FOREIGN KEY ("examinationId") REFERENCES "examinations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ExaminationRegistration" ADD CONSTRAINT "ExaminationRegistration_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ExaminationRegistration" ADD CONSTRAINT "ExaminationRegistration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
