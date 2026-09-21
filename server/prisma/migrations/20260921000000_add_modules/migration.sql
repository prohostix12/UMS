-- CreateTable
CREATE TABLE "modules" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "academicSessionId" TEXT,
    "moduleCode" TEXT NOT NULL,
    "moduleName" TEXT NOT NULL,
    "moduleType" TEXT NOT NULL,
    "semesterOrYear" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "modules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "modules_programId_moduleCode_key" ON "modules"("programId", "moduleCode");
CREATE INDEX "modules_organizationId_idx" ON "modules"("organizationId");
CREATE INDEX "modules_programId_idx" ON "modules"("programId");

-- AddForeignKey
ALTER TABLE "modules" ADD CONSTRAINT "modules_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "modules" ADD CONSTRAINT "modules_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "modules" ADD CONSTRAINT "modules_academicSessionId_fkey" FOREIGN KEY ("academicSessionId") REFERENCES "AdmissionSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
