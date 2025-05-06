/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `gym_classes` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `gyms` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "actual_exercises" ADD COLUMN     "actual_calories" INTEGER;

-- AlterTable
ALTER TABLE "exercises" ADD COLUMN     "image_url" TEXT;

-- AlterTable
ALTER TABLE "gym_classes" DROP COLUMN "imageUrl",
ADD COLUMN     "image_url" TEXT;

-- AlterTable
ALTER TABLE "gyms" DROP COLUMN "imageUrl",
ADD COLUMN     "image_url" TEXT;

-- AlterTable
ALTER TABLE "planned_exercises" ADD COLUMN     "planned_calories" INTEGER;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "image_url" TEXT;
