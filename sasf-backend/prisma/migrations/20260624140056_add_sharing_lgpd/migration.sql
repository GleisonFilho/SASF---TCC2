-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "CategoriaDado" ADD VALUE 'PERFIL';
ALTER TYPE "CategoriaDado" ADD VALUE 'MEMBROS';

-- AlterTable
ALTER TABLE "tokens_acesso" ADD COLUMN     "observacoes" TEXT;

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "acao" VARCHAR(50) NOT NULL,
    "recurso" VARCHAR(100) NOT NULL,
    "data_hora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip" VARCHAR(45),
    "detalhes" TEXT,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);
