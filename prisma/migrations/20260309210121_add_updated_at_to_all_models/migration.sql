/*
  Warnings:

  - Added the required column `updatedAt` to the `Comentarios` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Compras` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Leyendas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Microjuegos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Usuarios` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Comentarios" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Compras" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Leyendas" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Microjuegos" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Usuarios" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
