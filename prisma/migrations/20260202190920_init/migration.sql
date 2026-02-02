-- DropForeignKey
ALTER TABLE "ExplanationVariant" DROP CONSTRAINT "ExplanationVariant_explanationId_fkey";

-- AlterTable
ALTER TABLE "ExplanationVariant" ALTER COLUMN "metaphorTags" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "ExplanationVariant" ADD CONSTRAINT "ExplanationVariant_explanationId_fkey" FOREIGN KEY ("explanationId") REFERENCES "Explanation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
