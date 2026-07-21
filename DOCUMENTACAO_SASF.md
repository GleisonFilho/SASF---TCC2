# SASF — Sistema de Acompanhamento de Saúde Familiar
## Documentação Técnica Completa — v1.0

---

## 1. Visão Geral

### O que é o SASF

O SASF (Sistema de Acompanhamento de Saúde Familiar) é uma plataforma móvel que centraliza o acompanhamento de saúde de todos os membros de uma família em um único aplicativo. Reúne sinais vitais, condições crônicas, alergias, medicamentos, nutrição, exercícios físicos e bem-estar emocional, com um sistema de compartilhamento seguro de dados com profissionais de saúde, em conformidade com a LGPD.

### Objetivos

- Permitir que um responsável familiar registre e acompanhe a saúde de todos os seus dependentes em um só lugar.
- Gerar insights automáticos de saúde a partir dos dados registrados, sem substituir avaliação médica.
- Possibilitar o compartilhamento controlado e auditável de dados de saúde com profissionais (nutricionistas, psicólogos, médicos).
- Oferecer um painel administrativo para validação de profissionais de saúde antes que possam acessar dados de pacientes.

### Problema que resolve

Famílias geralmente acompanham a saúde de seus membros de forma fragmentada — anotações em papel, aplicativos isolados por especialidade, ou simplesmente memória. Isso dificulta a visão completa do histórico de saúde, atrasa decisões e torna o compartilhamento de informações com profissionais lento e inseguro. O SASF resolve isso unificando o registro de dados de saúde física, nutricional e emocional em uma única base, com controle de acesso granular para profissionais.

### Público-alvo

- **Pacientes/Responsáveis familiares**: gerenciam a saúde própria e de dependentes (filhos, idosos, etc.).
- **Profissionais de saúde**: nutricionistas, psicólogos e médicos que acessam dados mediante consentimento explícito.
- **Administradores**: validam o cadastro de profissionais antes de liberá-los na plataforma.

---

## 2. Arquitetura

### Visão geral

```
Frontend (Expo)  ──HTTP/JSON──>  Backend (Express)  ──Prisma──>  PostgreSQL (Supabase)
```

### Backend

Arquitetura em camadas, com responsabilidade única por camada:

```
Routes → Controllers → Services → Repositories → Prisma → PostgreSQL
```

- **Routes**: definem o endpoint HTTP, aplicam middlewares (`authMiddleware`, `validate`, `checkRole`) e direcionam para o controller.
- **Controllers**: extraem dados da requisição, chamam o service, tratam erros (`err.status` → resposta HTTP) e formatam a resposta.
- **Services**: contêm toda a regra de negócio — validações de propriedade, cálculos, orquestração de múltiplos repositórios.
- **Repositories**: única camada que toca o Prisma Client diretamente; isola queries de banco do resto da aplicação.

### Frontend

```
Telas (Expo Router) → Hooks (TanStack Query) → Services (Axios) → API REST
                    ↘ Zustand (estado global: auth, settings)
```

- **Telas**: componentes de tela em `app/`, organizados por convenção de arquivos do Expo Router.
- **Hooks**: encapsulam chamadas de API com TanStack Query (cache, invalidação, loading/error states).
- **Services**: funções puras que chamam a API via Axios.
- **Zustand**: estado global leve para sessão de autenticação e preferências de configurações (sem Redux).

### Banco de Dados

PostgreSQL gerenciado pelo Supabase, acessado via Prisma ORM. Conexão dupla:
- **DATABASE_URL** (PgBouncer, porta 6543): usada em runtime pela aplicação (pooling de conexões).
- **DIRECT_URL** (porta 5432): usada apenas pelo Prisma CLI para migrations (DDL não funciona via pooler em modo transação).

### Tecnologias Utilizadas

| Camada | Tecnologia |
|---|---|
| Frontend | React Native, Expo SDK 56, Expo Router, TypeScript |
| Estilização | NativeWind (Tailwind CSS para React Native) |
| Estado/Dados | Zustand (estado local), TanStack Query (estado de servidor) |
| Formulários | React Hook Form + Zod |
| Gráficos | react-native-svg (componentes próprios `LineChart`, `MiniChart`, `ProgressRing`) |
| Ícones | @expo/vector-icons (Ionicons) |
| Backend | Node.js, Express, TypeScript |
| ORM | Prisma 7 |
| Banco | PostgreSQL (Supabase) |
| Autenticação | JWT (access + refresh token), bcryptjs |
| Validação | Zod (compartilhado entre frontend e backend) |
| Segurança | Helmet, CORS, express-rate-limit |

### Organização das Pastas

```
sasf-backend/
├── prisma/
│   ├── schema.prisma       # modelo de dados
│   ├── seed.ts             # dados de demonstração
│   └── migrations/         # histórico de migrações
└── src/
    ├── routes/             # definição de endpoints
    ├── controllers/        # tratamento HTTP
    ├── services/           # regras de negócio
    ├── repositories/       # acesso a dados (Prisma)
    ├── middlewares/        # auth, validação, RBAC, erros
    ├── schemas/             # validação Zod por domínio
    ├── config/             # env, conexão Prisma
    └── utils/              # JWT, hash, helpers

sasf-app/
├── app/                    # telas (Expo Router, file-based routing)
│   ├── (auth)/              # login, cadastro
│   └── (app)/
│       ├── (tabs)/          # home, família, compartilhamento, perfil
│       ├── membro/[id]/     # detalhe, saúde+, timeline, estatísticas
│       ├── perfil/          # editar, sobre, configurações, conquistas, dispositivos
│       ├── compartilhamento/
│       └── admin/
├── components/
│   ├── ui/                  # Button, Input, Card, Icon, gráficos, etc.
│   ├── health/               # HealthSection, AddModal (genéricos)
│   └── devices/              # DeviceCard
├── hooks/                   # um hook por domínio (useAuth, useWellness, etc.)
├── services/                 # chamadas HTTP por domínio
├── store/                    # Zustand (authStore, settingsStore)
├── types/                    # tipos TypeScript compartilhados
└── utils/                    # achievements (cálculo de conquistas)
```

---

## 3. Funcionalidades

### Autenticação
Cadastro de pacientes e profissionais, login com JWT, refresh token rotativo, logout com invalidação de token, atualização de perfil (nome, telefone, foto-placeholder, data de nascimento, sexo, endereço, cidade, estado).

### Família
CRUD de membros da família vinculados a um responsável. Cada membro é uma entidade independente — todos os dados de saúde (condições, sinais vitais, nutrição, etc.) são vinculados ao **membro**, não diretamente ao usuário, permitindo que um responsável acompanhe múltiplos dependentes.

### LGPD — Compartilhamento Seguro
Geração de tokens de acesso temporário para profissionais, com escopo granular (quais categorias de dados são liberadas: vitais, condições, alergias, etc.), data de expiração configurável e revogação manual a qualquer momento. Todo acesso de um profissional aos dados gera um registro de auditoria (`LogAcessoDados`).

### Nutrição
Perfil nutricional (altura, peso atual, meta de peso, % de gordura, circunferência abdominal, meta de água), histórico de peso com IMC calculado automaticamente, registro de consumo de água, registro de refeições por tipo (café, almoço, jantar etc.) e planos alimentares criados por nutricionistas.

### Psicologia
Registro diário de humor, ansiedade, estresse, qualidade do sono e energia (escala 1-10), usado tanto para insights quanto para o Health Score.

### Exercícios
Registro de atividades físicas (caminhada, corrida, academia, ciclismo, natação, futebol, outro) com duração, distância, calorias estimadas e intensidade. Estatísticas semanais agregadas (minutos totais, calorias, sessões).

### Insights (IA baseada em regras)
Motor de recomendações que analisa os dados mais recentes do membro e gera mensagens categorizadas por prioridade (informação, atenção, importante), cobrindo: IMC, sono, humor, ansiedade, estresse, hidratação, exercícios/sedentarismo, nutrição, hipertensão, diabetes e medicamentos. Nunca emite diagnóstico — sempre inclui aviso de que não substitui orientação médica.

### Dashboard
Tela inicial com Health Score do servidor, sequência de dias consecutivos de registro (streak), resumo semanal (água hoje, exercícios da semana, último peso, humor médio, contagem de medicamentos e condições), conquistas desbloqueadas e lista de membros da família.

### Administração
Painel para administradores aprovarem ou rejeitarem cadastros de profissionais pendentes, com motivo obrigatório em caso de rejeição. Toda decisão é registrada em audit log.

### Compartilhamento
Ver seção "LGPD" acima — é o mesmo módulo.

### Health Score
Pontuação de 0 a 100 calculada no backend, combinando 9 fatores ponderados: IMC (15pts), qualidade do sono (12pts), humor (12pts), controle de ansiedade (10pts), hidratação (13pts), exercícios (13pts), sinais vitais — pressão/glicemia (10pts), condições de saúde ativas (8pts) e medicamentos em uso (7pts). Classificado em 5 faixas: Excelente, Bom, Regular, Atenção, Crítico. A tela exibe a explicação do cálculo sob demanda.

### Timeline (Linha do Tempo)
Tela por membro que combina cronologicamente todos os registros de saúde (sinais vitais, sintomas, peso, exercícios, bem-estar emocional) em uma única lista agrupada por dia ("Hoje", "Ontem", datas anteriores), permitindo visualizar a evolução da saúde de forma unificada.

### Conquistas (Gamificação)
Sistema de medalhas calculado 100% no cliente a partir dos dados já carregados (sem persistência no backend): primeiro registro, 7 dias consecutivos de hidratação, 7 dias consecutivos de exercício, primeiro registro de humor, perfil de saúde completo, 10 exercícios registrados, primeiro compartilhamento LGPD.

---

## 4. Fluxo do Sistema

```
Paciente
   │
   ▼
Cadastro (e-mail + senha)
   │
   ▼
Login (JWT access + refresh token)
   │
   ▼
Cadastro da família (membros: filhos, pais, etc.)
   │
   ▼
Registros de saúde (sinais vitais, nutrição, exercícios, bem-estar)
   │
   ▼
Insights automáticos + Health Score (gerados a cada acesso)
   │
   ▼
Compartilhamento (token LGPD gerado para um profissional)
   │
   ▼
Profissional (acessa dados do membro dentro do escopo liberado, via token)
   │
   ▼
Administrador (aprova o cadastro do profissional antes do primeiro acesso)
```

Cada seta representa uma transição de tela e/ou chamada de API. O fluxo de administração (aprovação de profissional) ocorre **antes** de um profissional poder receber qualquer compartilhamento — um profissional com `statusConta = PENDENTE` não consegue ser destinatário de um token.

---

## 5. Banco de Dados

22 tabelas, organizadas em 6 domínios:

### Identidade e Autenticação
| Tabela | Responsabilidade |
|---|---|
| `usuarios` | Identidade única do sistema — paciente, profissional ou admin, diferenciados por `tipoPerfil`. Inclui campos de perfil (telefone, foto, nascimento, endereço). |
| `refresh_tokens` | Tokens de renovação de sessão, com expiração e revogação individual. |
| `profissionais_detalhes` | Extensão 1:1 de `usuarios` para profissionais — registro no conselho, categoria, UF, status de aprovação. |

### Família e Histórico Médico
| Tabela | Responsabilidade |
|---|---|
| `membros_familia` | Entidade central — cada pessoa cuja saúde é acompanhada, vinculada a um `usuario` responsável. |
| `condicoes_saude` | Condições crônicas/diagnósticos do membro. |
| `alergias` | Alergias conhecidas, com gravidade. |
| `medicamentos_uso` | Medicamentos em uso, contínuos ou temporários. |
| `contatos_emergencia` | Contatos para emergências. |
| `sinais_vitais` | Série temporal de medições (pressão, glicemia, peso, temperatura, FC, SpO2). |
| `registros_sintomas` | Sintomas percebidos, com intensidade 1-10. |

### Nutrição
| Tabela | Responsabilidade |
|---|---|
| `perfis_nutricionais` | Altura, peso atual, metas e percentual de gordura por membro (1:1). |
| `registros_peso` | Histórico de peso com IMC calculado no momento do registro. |
| `registros_agua` | Consumo de água por horário. |
| `registros_refeicao` | Refeições registradas por tipo e calorias. |
| `planos_alimentares` | Planos criados por nutricionistas para um membro. |

### Exercícios e Psicologia
| Tabela | Responsabilidade |
|---|---|
| `registros_exercicio` | Atividades físicas com duração, distância, calorias, intensidade. |
| `registros_psicologicos` | Humor, ansiedade, estresse, sono, energia — escala 1-10. |

### LGPD e Auditoria
| Tabela | Responsabilidade |
|---|---|
| `tokens_acesso` | Consentimento materializado — token, profissional, membro, escopo e validade. |
| `escopo_token` | Granularidade do consentimento (quais categorias de dado foram liberadas). |
| `logs_acesso_dados` | Trilha imutável de cada acesso de um profissional aos dados via token. |
| `audit_logs` | Log genérico de ações sensíveis do sistema (aprovação/rejeição de profissional, criação/revogação de compartilhamento). |

### Dispositivos (preparação futura)
| Tabela | Responsabilidade |
|---|---|
| `dispositivos_conectados` | Reservada para integração futura com wearables (Samsung Health, Google Fit, etc.) — ainda não populada pela aplicação. |

### Relacionamentos principais

- `usuarios` 1—N `membros_familia` (um responsável gerencia vários membros)
- `membros_familia` 1—N (condições, alergias, medicamentos, contatos, sinais vitais, sintomas, peso, água, refeições, exercícios, psicológicos, tokens de acesso)
- `tokens_acesso` 1—N `escopo_token` e 1—N `logs_acesso_dados`
- `usuarios` (profissional) 1—1 `profissionais_detalhes`

Todas as chaves primárias são UUID, evitando enumeração sequencial de registros sensíveis de saúde.

---

## 6. API

Convenção: todas as rotas sob `/api`, JSON. 🔒 = requer JWT. 🔒A = requer JWT + papel ADMIN.

### Autenticação (`/api/auth`)
| Método | URL | Auth | Descrição |
|---|---|---|---|
| POST | `/register` | — | Cadastro de paciente |
| POST | `/register/professional` | — | Cadastro de profissional (entra como PENDENTE) |
| POST | `/login` | — | Login, retorna access + refresh token |
| POST | `/refresh` | — | Renova o access token |
| POST | `/logout` | 🔒 | Invalida o refresh token |
| GET | `/me` | 🔒 | Dados completos do usuário autenticado |

### Usuários (`/api/users`)
| Método | URL | Auth | Descrição |
|---|---|---|---|
| PUT | `/me` | 🔒 | Atualiza nome, telefone, foto, nascimento, sexo, endereço, cidade, UF |

### Membros da Família (`/api/family-members`)
| Método | URL | Auth | Descrição |
|---|---|---|---|
| GET/POST | `/` | 🔒 | Lista/cria membros do responsável logado |
| GET/PUT/DELETE | `/:id` | 🔒 | Detalhe, edição, remoção |

### Histórico Médico (`/api/family-members/:membroId/...`)
| Recurso | Métodos |
|---|---|
| `conditions` | GET, POST, GET/:id, PUT/:id, DELETE/:id |
| `allergies` | GET, POST, GET/:id, PUT/:id, DELETE/:id |
| `medications` | GET, POST, GET/:id, PUT/:id, DELETE/:id |
| `emergency-contacts` | GET, POST, GET/:id, PUT/:id, DELETE/:id |
| `vital-signs` | GET, POST, GET/:id, DELETE/:id |
| `symptoms` | GET, POST, GET/:id, DELETE/:id |

### Nutrição (`/api/family-members/:membroId/nutrition/...`)
| Recurso | Métodos |
|---|---|
| `profile` | GET, PUT |
| `weight` | GET, POST, DELETE/:id |
| `water` | GET, POST, DELETE/:id |
| `meals` | GET, POST, DELETE/:id |
| `meal-plans` | GET, POST, PUT/:id |

### Exercícios (`/api/family-members/:membroId/exercises`)
| Método | URL | Descrição |
|---|---|---|
| GET/POST | `/` | Lista/registra exercício |
| DELETE | `/:id` | Remove |
| GET | `/weekly-stats` | Estatísticas agregadas da semana |

### Psicologia (`/api/family-members/:membroId/psychology`)
| Método | URL | Descrição |
|---|---|---|
| GET/POST | `/` | Lista/registra |
| DELETE | `/:id` | Remove |

### Insights e Score (`/api/family-members/:membroId/insights`)
| Método | URL | Descrição |
|---|---|---|
| GET | `/` | Lista de recomendações priorizadas |
| GET | `/score` | Health Score (0-100) com breakdown |

### Compartilhamento LGPD (`/api`)
| Método | URL | Auth | Descrição |
|---|---|---|---|
| GET/POST | `/sharing` | 🔒 | Lista/cria compartilhamento |
| GET | `/sharing/:id` | 🔒 | Detalhe + logs de acesso |
| PATCH | `/sharing/:id/revoke` | 🔒 | Revoga |
| GET | `/sharing/:id/logs` | 🔒 | Logs de acesso |
| GET | `/professional/shared-access` | 🔒 | Tokens recebidos pelo profissional |
| GET | `/professional/access/:token` | 🔒 | Acessa dados via token |

### Administração (`/api/admin`)
| Método | URL | Auth | Descrição |
|---|---|---|---|
| GET | `/professionals` | 🔒A | Lista (filtro `?status=`) |
| GET | `/professionals/:id` | 🔒A | Detalhe |
| PATCH | `/professionals/:id/approve` | 🔒A | Aprova |
| PATCH | `/professionals/:id/reject` | 🔒A | Rejeita (motivo obrigatório) |

**Total: ~74 endpoints.**

---

## 7. Inteligência Artificial

### Como funciona hoje

O `HealthInsightService` é um motor de regras determinístico — não há chamada a nenhuma API externa de IA. Ele:

1. Busca, em paralelo, os dados mais recentes do membro (perfil nutricional, peso, água, exercícios da semana, psicologia, refeições, condições, medicamentos, sinais vitais).
2. Aplica um conjunto de regras de negócio fixas (ex.: "se a pressão sistólica >= 140, gerar alerta de hipertensão").
3. Atribui uma prioridade a cada insight (1 = mais importante, 5 = informativo).
4. Ordena por prioridade e retorna a lista.
5. O mesmo conjunto de dados também alimenta o cálculo do Health Score, com pesos diferentes por fator.

Toda mensagem gerada inclui o aviso: *"Estas recomendações são apenas informativas e não substituem orientação médica."* O sistema nunca emite diagnóstico — apenas observações descritivas sobre os dados registrados.

### Preparação para integração futura com LLMs

A arquitetura isola a lógica de geração de insights dentro de `healthInsightService.generate()`, que recebe um snapshot de dados (`fetchHealthData()`) e devolve uma lista de `Insight[]`. Essa separação permite, no futuro, substituir o motor de regras por uma chamada a um provider de LLM (OpenAI, Gemini, Claude) que receba o mesmo snapshot de dados como contexto e gere recomendações em linguagem natural — sem que nenhuma outra camada do sistema (controller, rotas, frontend) precise mudar, pois o contrato de saída (`Insight[]`) permanece o mesmo.

---

## 8. Segurança

### JWT
Autenticação via access token (curta duração) + refresh token (longa duração), ambos JWT assinados com segredos distintos. O access token carrega `userId`, `tipoPerfil` e `statusConta` no payload.

### Refresh Token
Refresh tokens são persistidos no banco (tabela `refresh_tokens`) com data de expiração, permitindo revogação individual (logout) sem invalidar outras sessões do mesmo usuário. A rotação ocorre a cada renovação — o token antigo é invalidado ao gerar um novo.

### LGPD
O módulo de compartilhamento é o núcleo de conformidade: nenhum profissional acessa dados de um paciente sem um token de consentimento explícito, com escopo granular e prazo de validade definidos pelo próprio paciente. A revogação é imediata e unilateral.

### Auditoria
Duas camadas de log: `logs_acesso_dados` (todo acesso de profissional via token) e `audit_logs` (ações administrativas sensíveis — aprovação/rejeição de profissional, criação/revogação de compartilhamento). Ambas são tabelas append-only — a aplicação nunca atualiza ou apaga registros de auditoria.

### Controle de Acesso (RBAC)
Middleware `checkRole` restringe rotas administrativas a usuários com `tipoPerfil = ADMIN`. O middleware `authMiddleware` valida o JWT e bloqueia contas com `statusConta = BLOQUEADO`. A validação de propriedade (um usuário só acessa seus próprios membros de família) é feita na camada de serviço, não apenas no middleware.

### Perfis
Três perfis com permissões distintas: `PACIENTE` (gerencia sua família e compartilha dados), `PROFISSIONAL` (acessa dados apenas via token de compartilhamento válido, após aprovação do admin), `ADMIN` (aprova/rejeita profissionais).

---

## 9. Diferenciais do Projeto

- **Saúde familiar, não individual**: o modelo de dados gira em torno de `membros_familia`, permitindo que um responsável acompanhe múltiplos dependentes — diferente da maioria dos apps de saúde, focados em um único usuário.
- **LGPD como núcleo, não acessório**: compartilhamento com escopo granular, revogação imediata e auditoria completa fazem parte da arquitetura desde a primeira tabela.
- **Dashboard inteligente**: Health Score real (calculado no backend a partir de 9 fatores), streak de engajamento, conquistas e resumo semanal — não apenas listas de dados.
- **Health Score explicável**: a pontuação não é uma caixa-preta — a tela mostra o breakdown por fator e a explicação do cálculo.
- **Nutrição, exercícios e psicologia integrados**: três domínios de saúde tradicionalmente tratados por apps separados, unificados em um só perfil de membro.
- **Insights sem diagnóstico**: todo o sistema de recomendações é desenhado para informar, nunca substituir avaliação profissional — texto de aviso obrigatório em toda mensagem.
- **Arquitetura escalável**: separação estrita Routes → Controllers → Services → Repositories no backend e Services → Hooks → Telas no frontend, replicada de forma idêntica em todos os 14+ módulos do sistema.
- **Preparação para IA real**: a camada de insights já isola o "provider" de recomendação, pronta para trocar regras determinísticas por um LLM sem alterar nenhuma outra camada.
- **Preparação para SmartWatch**: arquitetura completa (Repository → Service → Hooks → Componentes) já implementada para dispositivos vestíveis, aguardando apenas a integração real dos SDKs.

---

## 10. Trabalhos Futuros

- Integração real com Samsung Health, Google Fit / Health Connect, Apple HealthKit, Garmin Connect e Fitbit Web API (arquitetura já preparada em `services/devices.*`).
- Geração de insights via LLM (OpenAI, Gemini ou Claude), substituindo o motor de regras determinístico mantendo o mesmo contrato de saída.
- Notificações push inteligentes (lembrete de medicação, meta de água não atingida, etc.).
- OCR de exames laboratoriais para extração automática de sinais vitais.
- Upload de receitas médicas com reconhecimento de medicamentos.
- Agendamento de consultas integrado ao módulo de compartilhamento.
- Telemedicina (chamada de vídeo) integrada ao painel do profissional.
- Chat assíncrono entre paciente e profissional, dentro do escopo do token de compartilhamento.
- Predição de risco de saúde usando modelos de machine learning treinados sobre o histórico do paciente.
- Dark mode completo (a infraestrutura de preferência já existe em `settingsStore`, falta a aplicação visual em todas as telas).
- Internacionalização (i18n) — estrutura de seletor de idioma já presente na tela de Configurações.

---

## 11. Manual do Usuário

### Login e Cadastro
Na tela inicial, informe e-mail e senha para entrar, ou toque em "Cadastre-se" para criar uma nova conta de paciente.

### Início (Dashboard)
Mostra seu Health Score, sequência de dias ativos, conquistas recentes, resumo da semana (água, exercícios, peso, humor, medicamentos, condições) e a lista de membros da família.

### Família
Lista todos os membros cadastrados. Toque em "+" para adicionar um novo membro (nome, data de nascimento, sexo, parentesco). Toque em um membro para ver seus detalhes.

### Detalhe do Membro
Mostra sinais vitais, sintomas, condições de saúde, alergias, medicamentos e contatos de emergência. A partir daqui você acessa "Saúde+" (nutrição, exercícios e bem-estar), "Linha do Tempo" e "Estatísticas".

### Saúde+
Tela de nutrição/exercícios/bem-estar do membro: registre peso, consumo de água (com botões rápidos +200/+300/+500ml), refeições, exercícios e estado emocional. Os insights de saúde aparecem no topo, atualizados automaticamente.

### Linha do Tempo
Mostra todos os registros de saúde do membro em ordem cronológica, agrupados por "Hoje", "Ontem" e datas anteriores.

### Estatísticas
Gráficos de evolução de peso, água, exercícios, humor, pressão, glicemia e sono.

### Compartilhar
Gere um token de acesso temporário para um profissional informar o e-mail dele, escolher quais categorias de dados serão liberadas e por quantos dias. Revogue a qualquer momento na lista de compartilhamentos.

### Perfil
Acesse Editar Perfil, Conquistas, Dispositivos, Configurações e Sobre o SASF.

### Configurações
Altere tema, notificações, veja política de privacidade e termos de uso, limpe o cache do app ou saia da conta.

### Painel Administrativo (apenas Admin)
Lista profissionais pendentes de aprovação. Aprove ou rejeite (com motivo) cada cadastro.

---

## 12. Manual do Desenvolvedor

### Pré-requisitos
- Node.js 20+
- npm
- Conta Supabase com projeto PostgreSQL criado

### Configurar o Backend

```bash
cd sasf-backend
npm install
```

Crie o arquivo `.env` com:

```env
DATABASE_URL="postgresql://...:6543/postgres?pgbouncer=true"   # PgBouncer (runtime)
DIRECT_URL="postgresql://...:5432/postgres"                     # Conexão direta (migrations)
JWT_SECRET="..."
JWT_REFRESH_SECRET="..."
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=3333
NODE_ENV="development"
CORS_ORIGIN="*"
```

### Gerar o Prisma Client e rodar migrations

```bash
npx prisma generate
npx prisma migrate dev
```

### Popular o banco com dados de demonstração

```bash
npx prisma db seed
```

Credenciais geradas (senha: `Senha@123`): `admin@sasf.com`, `maria@email.com`, `ana.nutri@email.com`, `carlos.psi@email.com`, `joao.santos@email.com` (profissional pendente).

### Executar o Backend

```bash
npm run dev
```

Servidor disponível em `http://localhost:3333`.

### Configurar o Frontend

```bash
cd sasf-app
npm install --legacy-peer-deps
```

### Executar o Expo

```bash
npx expo start
```

Pressione `w` para abrir no navegador, ou escaneie o QR code com o app Expo Go no celular (mesma rede Wi-Fi do computador).

### Como Testar

- **Type-check backend**: `npx tsc --noEmit` dentro de `sasf-backend/`.
- **Type-check frontend**: `npx tsc --noEmit` dentro de `sasf-app/`.
- **Build web de validação**: `npx expo export --platform web` dentro de `sasf-app/`.
- **Testes manuais de API**: ver `docs/yaak-requests.md` para exemplos de requisição por módulo.
- Para testar o app em dispositivo Android físico, garanta que o celular esteja na mesma rede do computador — o app detecta automaticamente o IP do backend via `Constants.expoConfig.hostUri` com fallback de reconexão automática.
