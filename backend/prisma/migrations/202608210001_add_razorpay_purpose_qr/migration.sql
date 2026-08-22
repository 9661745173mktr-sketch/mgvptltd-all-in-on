ALTER TABLE "RazorpayPayment" ADD COLUMN "purpose" TEXT NOT NULL DEFAULT 'WALLET_RECHARGE';
ALTER TABLE "RazorpayPayment" ADD COLUMN "qrId" TEXT;
ALTER TABLE "WalletTransaction" ADD COLUMN "purpose" TEXT NOT NULL DEFAULT 'WALLET_RECHARGE';
ALTER TABLE "WalletTransaction" ADD COLUMN "razorpayQrId" TEXT;
CREATE INDEX "WalletTransaction_razorpayQrId_idx" ON "WalletTransaction"("razorpayQrId");
