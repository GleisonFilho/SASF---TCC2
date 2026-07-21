import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

function daysAgo(n: number, hour = 10): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, 0, 0, 0);
  return d;
}

async function main() {
  console.log('🗑️  Limpando dados...');
  await prisma.auditLog.deleteMany();
  await prisma.logAcessoDados.deleteMany();
  await prisma.escopoToken.deleteMany();
  await prisma.tokenAcesso.deleteMany();
  await prisma.registroPsicologico.deleteMany();
  await prisma.registroExercicio.deleteMany();
  await prisma.registroRefeicao.deleteMany();
  await prisma.registroAgua.deleteMany();
  await prisma.registroPeso.deleteMany();
  await prisma.perfilNutricional.deleteMany();
  await prisma.planoAlimentar.deleteMany();
  await prisma.registroSintoma.deleteMany();
  await prisma.sinalVital.deleteMany();
  await prisma.contatoEmergencia.deleteMany();
  await prisma.medicamentoUso.deleteMany();
  await prisma.alergia.deleteMany();
  await prisma.condicaoSaude.deleteMany();
  await prisma.membroFamilia.deleteMany();
  await prisma.profissionalDetalhe.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.dispositivoConectado.deleteMany();
  await prisma.usuario.deleteMany();

  const senhaHash = await bcrypt.hash('Senha@123', 12);

  // ─── Usuários ──────────────────────────────────────────
  console.log('👤 Criando usuários...');

  const admin = await prisma.usuario.create({
    data: { nome: 'Admin SASF', email: 'admin@sasf.com', senhaHash, telefone: '(89) 99999-0001', tipoPerfil: 'ADMIN', statusConta: 'ATIVO' },
  });

  const paciente = await prisma.usuario.create({
    data: { nome: 'Maria Silva', email: 'maria@email.com', senhaHash, telefone: '(89) 99999-0002', tipoPerfil: 'PACIENTE', statusConta: 'ATIVO' },
  });

  const nutricionista = await prisma.usuario.create({
    data: { nome: 'Dra. Ana Nutricionista', email: 'ana.nutri@email.com', senhaHash, telefone: '(89) 99999-0004', tipoPerfil: 'PROFISSIONAL', statusConta: 'ATIVO' },
  });
  await prisma.profissionalDetalhe.create({
    data: { usuarioId: nutricionista.id, registroProfissional: 'CRN-11111', categoriaConselho: 'CRN', ufConselho: 'PI', especialidade: 'Nutrição Clínica', statusValidacao: 'APPROVED', avaliadoPorId: admin.id, avaliadoEm: daysAgo(30) },
  });

  const psicologo = await prisma.usuario.create({
    data: { nome: 'Dr. Carlos Psicólogo', email: 'carlos.psi@email.com', senhaHash, telefone: '(89) 99999-0005', tipoPerfil: 'PROFISSIONAL', statusConta: 'ATIVO' },
  });
  await prisma.profissionalDetalhe.create({
    data: { usuarioId: psicologo.id, registroProfissional: 'CRP-22222', categoriaConselho: 'CRP', ufConselho: 'PI', especialidade: 'Psicologia Clínica', statusValidacao: 'APPROVED', avaliadoPorId: admin.id, avaliadoEm: daysAgo(25) },
  });

  const profPendente = await prisma.usuario.create({
    data: { nome: 'Dr. João Santos', email: 'joao.santos@email.com', senhaHash, telefone: '(89) 99999-0003', tipoPerfil: 'PROFISSIONAL', statusConta: 'PENDENTE' },
  });
  await prisma.profissionalDetalhe.create({
    data: { usuarioId: profPendente.id, registroProfissional: 'CRM-12345', categoriaConselho: 'CRM', ufConselho: 'PI', especialidade: 'Clínico Geral', statusValidacao: 'PENDING' },
  });

  // ─── Membros da Família ────────────────────────────────
  console.log('👨‍👩‍👧 Criando membros...');

  const maria = await prisma.membroFamilia.create({
    data: { usuarioResponsavelId: paciente.id, nome: 'Maria Silva', dataNascimento: new Date('1990-05-15'), sexo: 'Feminino', parentesco: 'Eu mesma' },
  });

  const pedro = await prisma.membroFamilia.create({
    data: { usuarioResponsavelId: paciente.id, nome: 'Pedro Silva', dataNascimento: new Date('2015-03-10'), sexo: 'Masculino', parentesco: 'Filho' },
  });

  const jose = await prisma.membroFamilia.create({
    data: { usuarioResponsavelId: paciente.id, nome: 'José Silva', dataNascimento: new Date('1955-07-22'), sexo: 'Masculino', parentesco: 'Pai' },
  });

  // ─── Condições de Saúde ────────────────────────────────
  console.log('🩺 Criando condições...');
  await prisma.condicaoSaude.createMany({ data: [
    { membroId: maria.id, nomeCondicao: 'Ansiedade Generalizada', status: 'CONTROLADA', observacoes: 'Acompanhamento psicológico semanal' },
    { membroId: jose.id, nomeCondicao: 'Hipertensão Arterial', status: 'ATIVA', dataDiagnostico: new Date('2018-03-10'), observacoes: 'Losartana 50mg diário' },
    { membroId: jose.id, nomeCondicao: 'Diabetes Tipo 2', status: 'CONTROLADA', dataDiagnostico: new Date('2020-06-15'), observacoes: 'Metformina 850mg' },
    { membroId: pedro.id, nomeCondicao: 'Asma', status: 'CONTROLADA', dataDiagnostico: new Date('2020-01-20'), observacoes: 'Usa bombinha quando necessário' },
  ]});

  // ─── Alergias ──────────────────────────────────────────
  console.log('⚠️  Criando alergias...');
  await prisma.alergia.createMany({ data: [
    { membroId: maria.id, substancia: 'Dipirona', gravidade: 'GRAVE', reacao: 'Edema de glote' },
    { membroId: pedro.id, substancia: 'Amendoim', gravidade: 'MODERADA', reacao: 'Urticária' },
    { membroId: jose.id, substancia: 'AAS', gravidade: 'LEVE', reacao: 'Vermelhidão na pele' },
  ]});

  // ─── Medicamentos ──────────────────────────────────────
  console.log('💊 Criando medicamentos...');
  await prisma.medicamentoUso.createMany({ data: [
    { membroId: jose.id, nomeMedicamento: 'Losartana', dosagem: '50mg', frequencia: '1x ao dia', dataInicio: new Date('2018-04-01'), usoContinuo: true },
    { membroId: jose.id, nomeMedicamento: 'Metformina', dosagem: '850mg', frequencia: '2x ao dia', dataInicio: new Date('2020-07-01'), usoContinuo: true },
    { membroId: maria.id, nomeMedicamento: 'Sertralina', dosagem: '50mg', frequencia: '1x ao dia', dataInicio: new Date('2024-01-15'), usoContinuo: true },
  ]});

  // ─── Contatos de Emergência ────────────────────────────
  console.log('📞 Criando contatos...');
  await prisma.contatoEmergencia.createMany({ data: [
    { membroId: maria.id, nome: 'Carlos Silva', parentesco: 'Irmão', telefone: '(89) 99988-7766' },
    { membroId: pedro.id, nome: 'Maria Silva', parentesco: 'Mãe', telefone: '(89) 99999-0002' },
    { membroId: jose.id, nome: 'Maria Silva', parentesco: 'Filha', telefone: '(89) 99999-0002' },
  ]});

  // ─── Sinais Vitais ─────────────────────────────────────
  console.log('❤️  Criando sinais vitais...');
  const sinaisVitais = [];
  for (let i = 0; i < 14; i++) {
    sinaisVitais.push(
      { membroId: jose.id, registradoPorUsuarioId: paciente.id, tipoMedicao: 'PRESSAO' as const, valorPrimario: 130 + Math.floor(Math.random() * 20 - 10), valorSecundario: 80 + Math.floor(Math.random() * 10 - 5), unidade: 'mmHg', dataHoraMedicao: daysAgo(i, 8) },
      { membroId: jose.id, registradoPorUsuarioId: paciente.id, tipoMedicao: 'GLICEMIA' as const, valorPrimario: 110 + Math.floor(Math.random() * 30 - 15), unidade: 'mg/dL', dataHoraMedicao: daysAgo(i, 7) },
    );
  }
  sinaisVitais.push(
    { membroId: maria.id, registradoPorUsuarioId: paciente.id, tipoMedicao: 'FC' as const, valorPrimario: 72, unidade: 'bpm', dataHoraMedicao: daysAgo(0, 9) },
    { membroId: maria.id, registradoPorUsuarioId: paciente.id, tipoMedicao: 'SPO2' as const, valorPrimario: 98, unidade: '%', dataHoraMedicao: daysAgo(0, 9) },
    { membroId: maria.id, registradoPorUsuarioId: paciente.id, tipoMedicao: 'TEMPERATURA' as const, valorPrimario: 36.5, unidade: '°C', dataHoraMedicao: daysAgo(0, 9) },
  );
  await prisma.sinalVital.createMany({ data: sinaisVitais });

  // ─── Sintomas ──────────────────────────────────────────
  console.log('🤒 Criando sintomas...');
  await prisma.registroSintoma.createMany({ data: [
    { membroId: pedro.id, registradoPorUsuarioId: paciente.id, descricao: 'Tosse seca', intensidade: 4, dataHoraOcorrencia: daysAgo(2, 15) },
    { membroId: jose.id, registradoPorUsuarioId: paciente.id, descricao: 'Dor de cabeça', intensidade: 6, dataHoraOcorrencia: daysAgo(1, 14), observacoes: 'Após esforço físico' },
    { membroId: maria.id, registradoPorUsuarioId: paciente.id, descricao: 'Ansiedade', intensidade: 5, dataHoraOcorrencia: daysAgo(0, 20), observacoes: 'Antes de reunião importante' },
  ]});

  // ─── Perfil Nutricional ────────────────────────────────
  console.log('📋 Criando perfis nutricionais...');
  await prisma.perfilNutricional.create({
    data: { membroId: maria.id, alturaAtualCm: 165, pesoAtualKg: 68, metaPesoKg: 62, metaAguaMl: 2500, percentualGordura: 28 },
  });
  await prisma.perfilNutricional.create({
    data: { membroId: jose.id, alturaAtualCm: 172, pesoAtualKg: 85, metaPesoKg: 78, metaAguaMl: 2000 },
  });

  // ─── Registros de Peso (histórico 30 dias) ─────────────
  console.log('⚖️  Criando histórico de peso...');
  const pesosMaria = [];
  const pesosJose = [];
  for (let i = 30; i >= 0; i -= 3) {
    const pesoM = 72 - (30 - i) * 0.13;
    const imc = Math.round((pesoM / (1.65 * 1.65)) * 10) / 10;
    pesosMaria.push({ membroId: maria.id, pesoKg: Math.round(pesoM * 10) / 10, imc, dataHora: daysAgo(i, 7) });

    const pesoJ = 88 - (30 - i) * 0.1;
    const imcJ = Math.round((pesoJ / (1.72 * 1.72)) * 10) / 10;
    pesosJose.push({ membroId: jose.id, pesoKg: Math.round(pesoJ * 10) / 10, imc: imcJ, dataHora: daysAgo(i, 7) });
  }
  await prisma.registroPeso.createMany({ data: [...pesosMaria, ...pesosJose] });

  // ─── Registros de Água (últimos 7 dias) ────────────────
  console.log('💧 Criando registros de água...');
  const aguaRecords = [];
  for (let i = 6; i >= 0; i--) {
    const qtd = [300, 250, 500, 200, 350, 400, 300];
    for (const ml of qtd.slice(0, 4 + Math.floor(Math.random() * 3))) {
      aguaRecords.push({ membroId: maria.id, quantidadeMl: ml, dataHora: daysAgo(i, 8 + aguaRecords.length % 10) });
    }
  }
  await prisma.registroAgua.createMany({ data: aguaRecords });

  // ─── Refeições (últimos 3 dias) ────────────────────────
  console.log('🍽️  Criando refeições...');
  const refeicoes = [];
  for (let i = 2; i >= 0; i--) {
    refeicoes.push(
      { membroId: maria.id, tipo: 'CAFE_DA_MANHA' as const, descricao: 'Pão integral, café, frutas', calorias: 350, dataHora: daysAgo(i, 7) },
      { membroId: maria.id, tipo: 'ALMOCO' as const, descricao: 'Arroz integral, frango grelhado, salada', calorias: 550, dataHora: daysAgo(i, 12) },
      { membroId: maria.id, tipo: 'LANCHE_TARDE' as const, descricao: 'Iogurte natural com granola', calorias: 200, dataHora: daysAgo(i, 15) },
      { membroId: maria.id, tipo: 'JANTAR' as const, descricao: 'Sopa de legumes', calorias: 300, dataHora: daysAgo(i, 19) },
    );
  }
  await prisma.registroRefeicao.createMany({ data: refeicoes });

  // ─── Plano Alimentar ───────────────────────────────────
  console.log('📝 Criando plano alimentar...');
  await prisma.planoAlimentar.create({
    data: {
      membroId: maria.id, profissionalId: nutricionista.id,
      titulo: 'Plano Reeducação Alimentar',
      descricao: 'Foco em redução gradual de peso com alimentação balanceada',
      metaCaloricaDia: 1800, dataInicio: daysAgo(30),
      observacoes: 'Priorizar proteínas magras e carboidratos complexos',
    },
  });

  // ─── Exercícios (últimos 14 dias) ──────────────────────
  console.log('🏋️ Criando exercícios...');
  const exercicios = [
    { membroId: maria.id, tipo: 'CAMINHADA' as const, duracaoMin: 45, distanciaKm: 3.5, caloriasEst: 200, intensidade: 'MODERADA' as const, dataHora: daysAgo(1, 6) },
    { membroId: maria.id, tipo: 'CAMINHADA' as const, duracaoMin: 40, distanciaKm: 3.0, caloriasEst: 180, intensidade: 'MODERADA' as const, dataHora: daysAgo(3, 6) },
    { membroId: maria.id, tipo: 'ACADEMIA' as const, duracaoMin: 60, caloriasEst: 350, intensidade: 'INTENSA' as const, dataHora: daysAgo(5, 17) },
    { membroId: maria.id, tipo: 'CORRIDA' as const, duracaoMin: 30, distanciaKm: 4.0, caloriasEst: 300, intensidade: 'INTENSA' as const, dataHora: daysAgo(7, 6) },
    { membroId: maria.id, tipo: 'CAMINHADA' as const, duracaoMin: 50, distanciaKm: 4.0, caloriasEst: 220, intensidade: 'MODERADA' as const, dataHora: daysAgo(9, 6) },
    { membroId: maria.id, tipo: 'NATACAO' as const, duracaoMin: 45, caloriasEst: 400, intensidade: 'MODERADA' as const, dataHora: daysAgo(11, 16) },
    { membroId: jose.id, tipo: 'CAMINHADA' as const, duracaoMin: 30, distanciaKm: 2.0, caloriasEst: 120, intensidade: 'LEVE' as const, dataHora: daysAgo(2, 7) },
    { membroId: jose.id, tipo: 'CAMINHADA' as const, duracaoMin: 25, distanciaKm: 1.5, caloriasEst: 100, intensidade: 'LEVE' as const, dataHora: daysAgo(5, 7) },
  ];
  await prisma.registroExercicio.createMany({ data: exercicios });

  // ─── Registros Psicológicos (últimos 14 dias) ──────────
  console.log('🧠 Criando registros psicológicos...');
  const psicologicos = [];
  for (let i = 13; i >= 0; i--) {
    psicologicos.push({
      membroId: maria.id,
      humor: Math.min(10, Math.max(1, 6 + Math.floor(Math.random() * 4 - 1))),
      ansiedade: Math.min(10, Math.max(1, 4 + Math.floor(Math.random() * 3 - 1))),
      estresse: Math.min(10, Math.max(1, 3 + Math.floor(Math.random() * 3 - 1))),
      qualidadeSono: Math.min(10, Math.max(1, 7 + Math.floor(Math.random() * 3 - 1))),
      energia: Math.min(10, Math.max(1, 6 + Math.floor(Math.random() * 3 - 1))),
      dataHora: daysAgo(i, 22),
      observacoes: i === 0 ? 'Dia produtivo, sem picos de ansiedade' : undefined,
    });
  }
  await prisma.registroPsicologico.createMany({ data: psicologicos });

  // ─── Compartilhamento LGPD ─────────────────────────────
  console.log('🔗 Criando compartilhamentos...');
  const tokenNutri = await prisma.tokenAcesso.create({
    data: {
      membroId: maria.id, profissionalId: nutricionista.id, concedidoPorUsuarioId: paciente.id,
      codigoToken: randomBytes(32).toString('hex'),
      dataExpiracao: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      observacoes: 'Acompanhamento nutricional mensal',
      escopos: { create: [
        { categoriaDado: 'VITAIS' }, { categoriaDado: 'CONDICOES' }, { categoriaDado: 'ALERGIAS' },
        { categoriaDado: 'MEDICAMENTOS' }, { categoriaDado: 'PERFIL' },
      ]},
    },
  });

  await prisma.tokenAcesso.create({
    data: {
      membroId: maria.id, profissionalId: psicologo.id, concedidoPorUsuarioId: paciente.id,
      codigoToken: randomBytes(32).toString('hex'),
      dataExpiracao: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      observacoes: 'Acompanhamento psicológico',
      escopos: { create: [{ categoriaDado: 'SINTOMAS' }, { categoriaDado: 'CONDICOES' }] },
    },
  });

  // ─── Audit Logs ────────────────────────────────────────
  console.log('📋 Criando audit logs...');
  await prisma.auditLog.createMany({ data: [
    { userId: admin.id, acao: 'PROFISSIONAL_APROVADO', recurso: 'profissional:nutri', detalhes: 'Nutricionista aprovada' },
    { userId: admin.id, acao: 'PROFISSIONAL_APROVADO', recurso: 'profissional:psi', detalhes: 'Psicólogo aprovado' },
    { userId: paciente.id, acao: 'COMPARTILHAMENTO_CRIADO', recurso: `token:${tokenNutri.id}`, detalhes: 'Compartilhamento com nutricionista' },
    { userId: nutricionista.id, acao: 'ACESSO_POR_TOKEN', recurso: `token:${tokenNutri.id}`, detalhes: 'Nutricionista acessou dados de Maria' },
  ]});

  // ─── Log de Acesso ─────────────────────────────────────
  await prisma.logAcessoDados.create({
    data: { tokenId: tokenNutri.id, profissionalId: nutricionista.id, recursoAcessado: 'GET /professional/access/:token' },
  });

  console.log('\n✅ Seed completo!');
  console.log('──────────────────────────────────────');
  console.log('📧 Credenciais (senha: Senha@123):');
  console.log(`   Admin:         admin@sasf.com`);
  console.log(`   Paciente:      maria@email.com`);
  console.log(`   Nutricionista: ana.nutri@email.com`);
  console.log(`   Psicólogo:     carlos.psi@email.com`);
  console.log(`   Pendente:      joao.santos@email.com`);
  console.log('──────────────────────────────────────');
}

main()
  .catch((e) => { console.error('Erro no seed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
