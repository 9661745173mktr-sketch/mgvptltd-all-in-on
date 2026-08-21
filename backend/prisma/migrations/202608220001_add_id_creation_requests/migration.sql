-- Persistent ID creation / approval workflow
CREATE TABLE IF NOT EXISTS "IdCreationRequest" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "creatorId" TEXT NOT NULL,
  "requestedRole" TEXT NOT NULL,
  "applicantName" TEXT NOT NULL,
  "applicantMobile" TEXT NOT NULL,
  "applicantEmail" TEXT,
  "username" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "amount" REAL NOT NULL,
  "utr" TEXT,
  "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "IdCreationRequest_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "IdCreationRequest_creatorId_idx" ON "IdCreationRequest"("creatorId");
CREATE INDEX IF NOT EXISTS "IdCreationRequest_requestedRole_idx" ON "IdCreationRequest"("requestedRole");
CREATE INDEX IF NOT EXISTS "IdCreationRequest_status_idx" ON "IdCreationRequest"("status");
