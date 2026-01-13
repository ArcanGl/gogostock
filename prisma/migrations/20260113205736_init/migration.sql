-- CreateTable
CREATE TABLE "public"."Product" (
    "id" TEXT NOT NULL,
    "images" TEXT[],
    "productType" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "productCode" TEXT NOT NULL,
    "barcode" TEXT,
    "stockQuantity" INTEGER NOT NULL,
    "arrivalDate" TEXT NOT NULL,
    "chinaBuyPrice" DOUBLE PRECISION NOT NULL,
    "chinaBuyCurrency" TEXT NOT NULL,
    "trPrice" DOUBLE PRECISION,
    "salePrice" DOUBLE PRECISION,
    "freightPrice" DOUBLE PRECISION,
    "createdAt" BIGINT NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);
