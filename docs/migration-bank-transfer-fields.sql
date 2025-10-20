-- Supabase SQL Migration: Add Bank Transfer Management Fields
-- Run this in Supabase Dashboard > SQL Editor

-- 1. Add BankTransferStatus enum
DO $$ BEGIN
  CREATE TYPE "BankTransferStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Add new columns to bank_transfers table
ALTER TABLE bank_transfers
  ADD COLUMN IF NOT EXISTS status "BankTransferStatus" NOT NULL DEFAULT 'PENDING',
  ADD COLUMN IF NOT EXISTS "approvedBy" TEXT,
  ADD COLUMN IF NOT EXISTS "rejectedBy" TEXT,
  ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT;

-- 3. Rename rejectReason to rejectionReason if it exists (for consistency)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bank_transfers' AND column_name = 'rejectReason'
  ) THEN
    ALTER TABLE bank_transfers RENAME COLUMN "rejectReason" TO "rejectionReason";
  END IF;
END $$;

-- 4. Add amount column to receipts table
ALTER TABLE receipts
  ADD COLUMN IF NOT EXISTS amount INTEGER NOT NULL DEFAULT 0;

-- 5. Update existing receipts with purchase amounts
UPDATE receipts r
SET amount = p.amount
FROM purchases p
WHERE r."purchaseId" = p.id AND r.amount = 0;

-- 6. Verify changes
SELECT
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'bank_transfers'
ORDER BY ordinal_position;

SELECT
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'receipts'
ORDER BY ordinal_position;

-- Done! Now generate Prisma Client:
-- Run: npx prisma generate
