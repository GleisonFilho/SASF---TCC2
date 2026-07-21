-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "cidade" VARCHAR(100),
ADD COLUMN     "data_nascimento" DATE,
ADD COLUMN     "endereco" VARCHAR(255),
ADD COLUMN     "estado" CHAR(2),
ADD COLUMN     "foto_url" TEXT,
ADD COLUMN     "sexo" VARCHAR(20);
