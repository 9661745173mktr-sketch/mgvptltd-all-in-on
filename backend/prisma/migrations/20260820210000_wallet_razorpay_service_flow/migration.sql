-- Wallet/Razorpay/service-slip update
ALTER TABLE "User" ADD COLUMN "parentId_new" TEXT;
UPDATE "User" SET "parentId_new" = CAST("parentId" AS TEXT) WHERE "parentId" IS NOT NULL;
-- SQLite keeps the old parentId column for backward compatibility; application now writes parentId as text.
ALTER TABLE "ServiceRequest" ADD COLUMN "adminRemark" TEXT;
ALTER TABLE "ServiceRequest" ADD COLUMN "adminSlipData" TEXT;
ALTER TABLE "ServiceRequest" ADD COLUMN "adminSlipName" TEXT;
ALTER TABLE "ServiceRequest" ADD COLUMN "adminSlipMime" TEXT;
ALTER TABLE "ServiceRequest" ADD COLUMN "refundProcessed" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ServiceRequest" ADD COLUMN "adminId" TEXT;

CREATE TABLE IF NOT EXISTS "WalletTransaction" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "amount" REAL NOT NULL,
  "reference" TEXT,
  "description" TEXT,
  "razorpayOrderId" TEXT,
  "razorpayPaymentId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'SUCCESS',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WalletTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "WalletTransaction_userId_idx" ON "WalletTransaction"("userId");
CREATE INDEX IF NOT EXISTS "WalletTransaction_razorpayPaymentId_idx" ON "WalletTransaction"("razorpayPaymentId");

CREATE TABLE IF NOT EXISTS "RazorpayPayment" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "orderId" TEXT NOT NULL UNIQUE,
  "paymentId" TEXT UNIQUE,
  "amount" REAL NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'CREATED',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "RazorpayPayment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
