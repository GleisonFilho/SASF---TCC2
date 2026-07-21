-- CreateEnum
CREATE TYPE "TipoRefeicao" AS ENUM ('CAFE_DA_MANHA', 'LANCHE_MANHA', 'ALMOCO', 'LANCHE_TARDE', 'JANTAR', 'CEIA', 'OUTRO');

-- CreateEnum
CREATE TYPE "TipoExercicio" AS ENUM ('CAMINHADA', 'CORRIDA', 'ACADEMIA', 'CICLISMO', 'NATACAO', 'FUTEBOL', 'OUTRO');

-- CreateEnum
CREATE TYPE "IntensidadeExercicio" AS ENUM ('LEVE', 'MODERADA', 'INTENSA');

-- CreateTable
CREATE TABLE "perfis_nutricionais" (
    "id" UUID NOT NULL,
    "membro_id" UUID NOT NULL,
    "altura_atual_cm" DECIMAL(5,1),
    "peso_atual_kg" DECIMAL(5,2),
    "meta_peso_kg" DECIMAL(5,2),
    "percentual_gordura" DECIMAL(4,1),
    "circunferencia_abdominal" DECIMAL(5,1),
    "meta_agua_ml" INTEGER,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "perfis_nutricionais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registros_peso" (
    "id" UUID NOT NULL,
    "membro_id" UUID NOT NULL,
    "peso_kg" DECIMAL(5,2) NOT NULL,
    "imc" DECIMAL(4,1),
    "data_hora" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registros_peso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registros_agua" (
    "id" UUID NOT NULL,
    "membro_id" UUID NOT NULL,
    "quantidade_ml" INTEGER NOT NULL,
    "data_hora" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registros_agua_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registros_refeicao" (
    "id" UUID NOT NULL,
    "membro_id" UUID NOT NULL,
    "tipo" "TipoRefeicao" NOT NULL,
    "descricao" TEXT NOT NULL,
    "calorias" INTEGER,
    "data_hora" TIMESTAMP(3) NOT NULL,
    "observacoes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registros_refeicao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planos_alimentares" (
    "id" UUID NOT NULL,
    "membro_id" UUID NOT NULL,
    "profissional_id" UUID NOT NULL,
    "titulo" VARCHAR(255) NOT NULL,
    "descricao" TEXT,
    "meta_calorica_dia" INTEGER,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "data_inicio" DATE NOT NULL,
    "data_fim" DATE,
    "observacoes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "planos_alimentares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registros_exercicio" (
    "id" UUID NOT NULL,
    "membro_id" UUID NOT NULL,
    "tipo" "TipoExercicio" NOT NULL,
    "duracao_min" INTEGER NOT NULL,
    "distancia_km" DECIMAL(6,2),
    "calorias_est" INTEGER,
    "intensidade" "IntensidadeExercicio" NOT NULL,
    "observacoes" TEXT,
    "data_hora" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registros_exercicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registros_psicologicos" (
    "id" UUID NOT NULL,
    "membro_id" UUID NOT NULL,
    "humor" SMALLINT NOT NULL,
    "ansiedade" SMALLINT NOT NULL,
    "estresse" SMALLINT NOT NULL,
    "qualidade_sono" SMALLINT NOT NULL,
    "energia" SMALLINT NOT NULL,
    "observacoes" TEXT,
    "data_hora" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registros_psicologicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dispositivos_conectados" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "provedor" VARCHAR(50) NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "ultima_sync" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dispositivos_conectados_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "perfis_nutricionais_membro_id_key" ON "perfis_nutricionais"("membro_id");

-- AddForeignKey
ALTER TABLE "perfis_nutricionais" ADD CONSTRAINT "perfis_nutricionais_membro_id_fkey" FOREIGN KEY ("membro_id") REFERENCES "membros_familia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_peso" ADD CONSTRAINT "registros_peso_membro_id_fkey" FOREIGN KEY ("membro_id") REFERENCES "membros_familia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_agua" ADD CONSTRAINT "registros_agua_membro_id_fkey" FOREIGN KEY ("membro_id") REFERENCES "membros_familia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_refeicao" ADD CONSTRAINT "registros_refeicao_membro_id_fkey" FOREIGN KEY ("membro_id") REFERENCES "membros_familia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planos_alimentares" ADD CONSTRAINT "planos_alimentares_membro_id_fkey" FOREIGN KEY ("membro_id") REFERENCES "membros_familia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_exercicio" ADD CONSTRAINT "registros_exercicio_membro_id_fkey" FOREIGN KEY ("membro_id") REFERENCES "membros_familia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_psicologicos" ADD CONSTRAINT "registros_psicologicos_membro_id_fkey" FOREIGN KEY ("membro_id") REFERENCES "membros_familia"("id") ON DELETE CASCADE ON UPDATE CASCADE;
