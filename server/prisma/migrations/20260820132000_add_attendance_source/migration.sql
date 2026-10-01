-- Distinguish admin card scans from the verified projected event QR flow.
ALTER TABLE "Attendance"
ADD COLUMN "source" TEXT NOT NULL DEFAULT 'ADMIN_SCAN';
