-- CreateTable
CREATE TABLE "food_items" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "caloriesPerUnit" DECIMAL(10,2) NOT NULL,
    "servingUnit" TEXT NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "food_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diet_entries" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "foodId" INTEGER NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "calories" DECIMAL(10,2),
    "consumptionDate" DATE NOT NULL,
    "mealType" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "diet_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "food_items_name_key" ON "food_items"("name");

-- AddForeignKey
ALTER TABLE "diet_entries" ADD CONSTRAINT "diet_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diet_entries" ADD CONSTRAINT "diet_entries_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "food_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
