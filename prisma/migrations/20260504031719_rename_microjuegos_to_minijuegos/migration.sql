/*
  Warnings:

  - You are about to drop the column `microjuego_id` on the `Compras` table. All the data in the column will be lost.
  - You are about to drop the `Microjuegos` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `minijuego_id` to the `Compras` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Compras" DROP CONSTRAINT "Compras_microjuego_id_fkey";

-- DropForeignKey
ALTER TABLE "Microjuegos" DROP CONSTRAINT "Microjuegos_leyenda_id_fkey";

-- AlterTable
ALTER TABLE "Compras" DROP COLUMN "microjuego_id",
ADD COLUMN     "minijuego_id" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Microjuegos";

-- CreateTable
CREATE TABLE "Minijuegos" (
    "id" SERIAL NOT NULL,
    "leyenda_id" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "demo_apk_path" TEXT,
    "full_apk_path" TEXT,
    "descargas_demo" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Minijuegos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Minijuegos_leyenda_id_key" ON "Minijuegos"("leyenda_id");

-- AddForeignKey
ALTER TABLE "Minijuegos" ADD CONSTRAINT "Minijuegos_leyenda_id_fkey" FOREIGN KEY ("leyenda_id") REFERENCES "Leyendas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Compras" ADD CONSTRAINT "Compras_minijuego_id_fkey" FOREIGN KEY ("minijuego_id") REFERENCES "Minijuegos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
