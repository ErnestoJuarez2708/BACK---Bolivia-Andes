-- CreateTable
CREATE TABLE "Usuarios" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "nombre" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Leyendas" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "autor_referencia" TEXT,
    "imagen_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Leyendas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Microjuegos" (
    "id" SERIAL NOT NULL,
    "leyenda_id" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "demo_apk_path" TEXT,
    "full_apk_path" TEXT,
    "precio" DOUBLE PRECISION NOT NULL DEFAULT 2.0,
    "descargas_demo" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Microjuegos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Compras" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER,
    "microjuego_id" INTEGER NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "stripe_payment_id" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "download_token" TEXT,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Compras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comentarios" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER,
    "leyenda_id" INTEGER NOT NULL,
    "texto" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comentarios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuarios_email_key" ON "Usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Microjuegos_leyenda_id_key" ON "Microjuegos"("leyenda_id");

-- AddForeignKey
ALTER TABLE "Microjuegos" ADD CONSTRAINT "Microjuegos_leyenda_id_fkey" FOREIGN KEY ("leyenda_id") REFERENCES "Leyendas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Compras" ADD CONSTRAINT "Compras_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Compras" ADD CONSTRAINT "Compras_microjuego_id_fkey" FOREIGN KEY ("microjuego_id") REFERENCES "Microjuegos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comentarios" ADD CONSTRAINT "Comentarios_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comentarios" ADD CONSTRAINT "Comentarios_leyenda_id_fkey" FOREIGN KEY ("leyenda_id") REFERENCES "Leyendas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
