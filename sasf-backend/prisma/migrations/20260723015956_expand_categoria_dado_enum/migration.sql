-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "CategoriaDado" ADD VALUE 'NUTRICAO';
ALTER TYPE "CategoriaDado" ADD VALUE 'EXERCICIOS';
ALTER TYPE "CategoriaDado" ADD VALUE 'PSICOLOGIA';
ALTER TYPE "CategoriaDado" ADD VALUE 'HEALTH_SCORE';
