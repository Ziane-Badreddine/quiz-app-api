/*
  Warnings:

  - You are about to drop the column `explanation` on the `Answer` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Answer" DROP COLUMN "explanation";

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "explanation" TEXT;
