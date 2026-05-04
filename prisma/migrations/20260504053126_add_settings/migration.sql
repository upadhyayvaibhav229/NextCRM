-- CreateTable
CREATE TABLE "FooterSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,

    CONSTRAINT "FooterSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FooterSettings_key_key" ON "FooterSettings"("key");
