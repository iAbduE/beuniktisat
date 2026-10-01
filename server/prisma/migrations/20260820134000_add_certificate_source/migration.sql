-- Mark certificates created before the projected QR flow as legacy.
ALTER TABLE "Certificate"
ADD COLUMN "source" TEXT NOT NULL DEFAULT 'LEGACY';

-- A certificate becomes an EVENT_QR certificate only when its member/event
-- pair has a verified projected-QR attendance record.
UPDATE "Certificate" AS c
SET "source" = 'EVENT_QR'
WHERE EXISTS (
  SELECT 1
  FROM "Attendance" AS a
  WHERE a."memberId" = c."memberId"
    AND a."eventId" = c."eventId"
    AND a."source" = 'EVENT_QR'
);

ALTER TABLE "Certificate"
ALTER COLUMN "source" SET DEFAULT 'EVENT_QR';
