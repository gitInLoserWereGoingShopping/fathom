-- CreateTable
CREATE TABLE "Explanation" (
    "id" TEXT NOT NULL,
    "canonicalKey" TEXT NOT NULL,
    "canonicalTopic" TEXT NOT NULL,
    "groupKey" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "structureVersion" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "visibility" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Explanation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExplanationVariant" (
    "id" TEXT NOT NULL,
    "explanationId" TEXT NOT NULL,
    "groupKey" TEXT NOT NULL,
    "variantLabel" TEXT,
    "content" JSONB NOT NULL,
    "metadata" JSONB,
    "helpfulScore" INTEGER NOT NULL DEFAULT 0,
    "metaphorTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExplanationVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlowRun" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rawQuery" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "cacheHit" BOOLEAN NOT NULL,
    "canonicalTopic" TEXT,
    "groupKey" TEXT,
    "errorMessage" TEXT,
    "trace" JSONB NOT NULL,

    CONSTRAINT "FlowRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Signal" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "signalType" TEXT NOT NULL,
    "explanationId" TEXT,
    "variantId" TEXT,

    CONSTRAINT "Signal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Explanation_groupKey_level_idx" ON "Explanation"("groupKey", "level");

-- CreateIndex
CREATE INDEX "Explanation_canonicalKey_idx" ON "Explanation"("canonicalKey");

-- CreateIndex
CREATE INDEX "ExplanationVariant_groupKey_idx" ON "ExplanationVariant"("groupKey");

-- CreateIndex
CREATE INDEX "ExplanationVariant_explanationId_idx" ON "ExplanationVariant"("explanationId");

-- CreateIndex
CREATE INDEX "FlowRun_createdAt_idx" ON "FlowRun"("createdAt");

-- CreateIndex
CREATE INDEX "FlowRun_groupKey_idx" ON "FlowRun"("groupKey");

-- CreateIndex
CREATE INDEX "Signal_explanationId_idx" ON "Signal"("explanationId");

-- CreateIndex
CREATE INDEX "Signal_variantId_idx" ON "Signal"("variantId");

-- AddForeignKey
ALTER TABLE "ExplanationVariant" ADD CONSTRAINT "ExplanationVariant_explanationId_fkey" FOREIGN KEY ("explanationId") REFERENCES "Explanation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Signal" ADD CONSTRAINT "Signal_explanationId_fkey" FOREIGN KEY ("explanationId") REFERENCES "Explanation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Signal" ADD CONSTRAINT "Signal_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ExplanationVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
