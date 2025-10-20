-- Supabase SQL Migration: Add Bank Transfer Management Fields (Fixed)
-- Run this in Supabase Dashboard > SQL Editor

-- 1. Add BankTransferStatus enum
DO $$ BEGIN
  CREATE TYPE "BankTransferStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Add new columns to bank_transfers table (only if they don't exist)
DO $$ BEGIN
  -- Add status column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bank_transfers' AND column_name = 'status'
  ) THEN
    ALTER TABLE bank_transfers ADD COLUMN status "BankTransferStatus" NOT NULL DEFAULT 'PENDING';
  END IF;

  -- Add approvedBy column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bank_transfers' AND column_name = 'approvedBy'
  ) THEN
    ALTER TABLE bank_transfers ADD COLUMN "approvedBy" TEXT;
  END IF;

  -- Add rejectedBy column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bank_transfers' AND column_name = 'rejectedBy'
  ) THEN
    ALTER TABLE bank_transfers ADD COLUMN "rejectedBy" TEXT;
  END IF;

  -- Add rejectionReason column (check for both old and new names)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bank_transfers' AND column_name = 'rejectionReason'
  ) THEN
    -- Check if old name exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'bank_transfers' AND column_name = 'rejectReason'
    ) THEN
      ALTER TABLE bank_transfers RENAME COLUMN "rejectReason" TO "rejectionReason";
    ELSE
      ALTER TABLE bank_transfers ADD COLUMN "rejectionReason" TEXT;
    END IF;
  END IF;
END $$;

-- 3. Add amount column to receipts table
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'receipts' AND column_name = 'amount'
  ) THEN
    ALTER TABLE receipts ADD COLUMN amount INTEGER NOT NULL DEFAULT 0;
  END IF;
END $$;

-- 4. Update existing receipts with purchase amounts
UPDATE receipts r
SET amount = p.amount
FROM purchases p
WHERE r."purchaseId" = p.id AND r.amount = 0;

-- 5. Verify changes
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
