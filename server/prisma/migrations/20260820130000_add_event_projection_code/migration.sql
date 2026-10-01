-- Add an opaque, non-sequential key for the admin projection screen.
ALTER TABLE "Event" ADD COLUMN "projectionCode" TEXT;

-- Backfill existing events before making the column required.
UPDATE "Event"
SET "projectionCode" = md5(random()::text || clock_timestamp()::text || "id"::text)
WHERE "projectionCode" IS NULL;

ALTER TABLE "Event" ALTER COLUMN "projectionCode" SET NOT NULL;

CREATE UNIQUE INDEX "Event_projectionCode_key" ON "Event"("projectionCode");
