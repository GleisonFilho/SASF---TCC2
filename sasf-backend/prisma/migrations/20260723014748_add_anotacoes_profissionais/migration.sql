-- CreateTable
CREATE TABLE "anotacoes_profissionais" (
    "id" UUID NOT NULL,
    "membro_id" UUID NOT NULL,
    "profissional_id" UUID NOT NULL,
    "texto" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "anotacoes_profissionais_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "anotacoes_profissionais" ADD CONSTRAINT "anotacoes_profissionais_membro_id_fkey" FOREIGN KEY ("membro_id") REFERENCES "membros_familia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anotacoes_profissionais" ADD CONSTRAINT "anotacoes_profissionais_profissional_id_fkey" FOREIGN KEY ("profissional_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
