-- CreateEnum
CREATE TYPE "TipoPerfil" AS ENUM ('PACIENTE', 'PROFISSIONAL', 'ADMIN');

-- CreateEnum
CREATE TYPE "StatusConta" AS ENUM ('ATIVO', 'PENDENTE', 'BLOQUEADO');

-- CreateEnum
CREATE TYPE "StatusValidacao" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "StatusCondicao" AS ENUM ('ATIVA', 'CONTROLADA', 'RESOLVIDA');

-- CreateEnum
CREATE TYPE "GravidadeAlergia" AS ENUM ('LEVE', 'MODERADA', 'GRAVE');

-- CreateEnum
CREATE TYPE "TipoMedicao" AS ENUM ('PRESSAO', 'GLICEMIA', 'PESO', 'TEMPERATURA', 'FC', 'SPO2');

-- CreateEnum
CREATE TYPE "StatusToken" AS ENUM ('ATIVO', 'EXPIRADO', 'REVOGADO');

-- CreateEnum
CREATE TYPE "CategoriaDado" AS ENUM ('VITAIS', 'CONDICOES', 'ALERGIAS', 'MEDICAMENTOS', 'SINTOMAS', 'CONTATOS');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" UUID NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "telefone" VARCHAR(20),
    "tipo_perfil" "TipoPerfil" NOT NULL,
    "status_conta" "StatusConta" NOT NULL DEFAULT 'ATIVO',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "usuario_id" UUID NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profissionais_detalhes" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "registro_profissional" VARCHAR(50) NOT NULL,
    "categoria_conselho" VARCHAR(20) NOT NULL,
    "uf_conselho" CHAR(2) NOT NULL,
    "especialidade" VARCHAR(100),
    "status_validacao" "StatusValidacao" NOT NULL DEFAULT 'PENDING',
    "avaliado_por" UUID,
    "avaliado_em" TIMESTAMP(3),
    "motivo_rejeicao" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profissionais_detalhes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membros_familia" (
    "id" UUID NOT NULL,
    "usuario_responsavel_id" UUID NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "data_nascimento" DATE NOT NULL,
    "sexo" VARCHAR(20) NOT NULL,
    "parentesco" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "membros_familia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "condicoes_saude" (
    "id" UUID NOT NULL,
    "membro_id" UUID NOT NULL,
    "nome_condicao" VARCHAR(255) NOT NULL,
    "data_diagnostico" DATE,
    "status" "StatusCondicao" NOT NULL DEFAULT 'ATIVA',
    "observacoes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "condicoes_saude_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alergias" (
    "id" UUID NOT NULL,
    "membro_id" UUID NOT NULL,
    "substancia" VARCHAR(255) NOT NULL,
    "gravidade" "GravidadeAlergia" NOT NULL DEFAULT 'LEVE',
    "reacao" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alergias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medicamentos_uso" (
    "id" UUID NOT NULL,
    "membro_id" UUID NOT NULL,
    "nome_medicamento" VARCHAR(255) NOT NULL,
    "dosagem" VARCHAR(100),
    "frequencia" VARCHAR(100),
    "data_inicio" DATE,
    "data_fim" DATE,
    "uso_continuo" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medicamentos_uso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contatos_emergencia" (
    "id" UUID NOT NULL,
    "membro_id" UUID NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "parentesco" VARCHAR(50) NOT NULL,
    "telefone" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contatos_emergencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sinais_vitais" (
    "id" UUID NOT NULL,
    "membro_id" UUID NOT NULL,
    "registrado_por_usuario_id" UUID NOT NULL,
    "tipo_medicao" "TipoMedicao" NOT NULL,
    "valor_primario" DECIMAL(10,2) NOT NULL,
    "valor_secundario" DECIMAL(10,2),
    "unidade" VARCHAR(20) NOT NULL,
    "data_hora_medicao" TIMESTAMP(3) NOT NULL,
    "observacoes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sinais_vitais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registros_sintomas" (
    "id" UUID NOT NULL,
    "membro_id" UUID NOT NULL,
    "registrado_por_usuario_id" UUID NOT NULL,
    "descricao" TEXT NOT NULL,
    "intensidade" SMALLINT NOT NULL,
    "data_hora_ocorrencia" TIMESTAMP(3) NOT NULL,
    "observacoes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registros_sintomas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokens_acesso" (
    "id" UUID NOT NULL,
    "membro_id" UUID NOT NULL,
    "profissional_id" UUID NOT NULL,
    "concedido_por_usuario_id" UUID NOT NULL,
    "codigo_token" TEXT NOT NULL,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_expiracao" TIMESTAMP(3) NOT NULL,
    "data_revogacao" TIMESTAMP(3),
    "status" "StatusToken" NOT NULL DEFAULT 'ATIVO',

    CONSTRAINT "tokens_acesso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "escopo_token" (
    "id" UUID NOT NULL,
    "token_id" UUID NOT NULL,
    "categoria_dado" "CategoriaDado" NOT NULL,

    CONSTRAINT "escopo_token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs_acesso_dados" (
    "id" UUID NOT NULL,
    "token_id" UUID NOT NULL,
    "profissional_id" UUID NOT NULL,
    "recurso_acessado" TEXT NOT NULL,
    "data_hora_acesso" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_origem" VARCHAR(45),

    CONSTRAINT "logs_acesso_dados_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "profissionais_detalhes_usuario_id_key" ON "profissionais_detalhes"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "tokens_acesso_codigo_token_key" ON "tokens_acesso"("codigo_token");

-- CreateIndex
CREATE UNIQUE INDEX "escopo_token_token_id_categoria_dado_key" ON "escopo_token"("token_id", "categoria_dado");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profissionais_detalhes" ADD CONSTRAINT "profissionais_detalhes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profissionais_detalhes" ADD CONSTRAINT "profissionais_detalhes_avaliado_por_fkey" FOREIGN KEY ("avaliado_por") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membros_familia" ADD CONSTRAINT "membros_familia_usuario_responsavel_id_fkey" FOREIGN KEY ("usuario_responsavel_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "condicoes_saude" ADD CONSTRAINT "condicoes_saude_membro_id_fkey" FOREIGN KEY ("membro_id") REFERENCES "membros_familia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alergias" ADD CONSTRAINT "alergias_membro_id_fkey" FOREIGN KEY ("membro_id") REFERENCES "membros_familia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medicamentos_uso" ADD CONSTRAINT "medicamentos_uso_membro_id_fkey" FOREIGN KEY ("membro_id") REFERENCES "membros_familia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contatos_emergencia" ADD CONSTRAINT "contatos_emergencia_membro_id_fkey" FOREIGN KEY ("membro_id") REFERENCES "membros_familia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sinais_vitais" ADD CONSTRAINT "sinais_vitais_membro_id_fkey" FOREIGN KEY ("membro_id") REFERENCES "membros_familia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sinais_vitais" ADD CONSTRAINT "sinais_vitais_registrado_por_usuario_id_fkey" FOREIGN KEY ("registrado_por_usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_sintomas" ADD CONSTRAINT "registros_sintomas_membro_id_fkey" FOREIGN KEY ("membro_id") REFERENCES "membros_familia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_sintomas" ADD CONSTRAINT "registros_sintomas_registrado_por_usuario_id_fkey" FOREIGN KEY ("registrado_por_usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokens_acesso" ADD CONSTRAINT "tokens_acesso_membro_id_fkey" FOREIGN KEY ("membro_id") REFERENCES "membros_familia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokens_acesso" ADD CONSTRAINT "tokens_acesso_profissional_id_fkey" FOREIGN KEY ("profissional_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokens_acesso" ADD CONSTRAINT "tokens_acesso_concedido_por_usuario_id_fkey" FOREIGN KEY ("concedido_por_usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escopo_token" ADD CONSTRAINT "escopo_token_token_id_fkey" FOREIGN KEY ("token_id") REFERENCES "tokens_acesso"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs_acesso_dados" ADD CONSTRAINT "logs_acesso_dados_token_id_fkey" FOREIGN KEY ("token_id") REFERENCES "tokens_acesso"("id") ON DELETE CASCADE ON UPDATE CASCADE;
