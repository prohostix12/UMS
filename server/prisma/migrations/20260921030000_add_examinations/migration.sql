CREATE TABLE "examinations" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "academicSessionId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "semesterId" TEXT NOT NULL,
    "examinationName" TEXT NOT NULL,
    "examinationType" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "moduleIds" JSONB NOT NULL DEFAULT '[]',
    "schedule" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "examinations_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "examinations_organizationId_idx" ON "examinations"("organizationId");
CREATE INDEX "examinations_academicSessionId_programId_semesterId_idx" ON "examinations"("academicSessionId", "programId", "semesterId");

ALTER TABLE "examinations" ADD CONSTRAINT "examinations_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "examinations" ADD CONSTRAINT "examinations_academicSessionId_fkey" FOREIGN KEY ("academicSessionId") REFERENCES "AdmissionSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "examinations" ADD CONSTRAINT "examinations_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "examinations" ADD CONSTRAINT "examinations_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "semester"("id") ON DELETE CASCADE ON UPDATE CASCADE;
