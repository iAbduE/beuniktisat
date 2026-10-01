/*
  Warnings:

  - A unique constraint covering the columns `[memberId,eventId]` on the table `Certificate` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Certificate_memberId_eventId_key" ON "Certificate"("memberId", "eventId");
