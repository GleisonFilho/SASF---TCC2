# SASF — Auditoria Final Pré-Apresentação (TCC)

Data: 22/07/2026. Escopo: revisão completa de backend e frontend, testes end-to-end reais contra a API, varredura de código em todas as telas, e avaliação de prontidão para a banca.

> Este documento é específico da auditoria realizada nesta sessão. O `RELATORIO_FINAL.md` (30/06) documenta uma fase anterior do projeto e está **desatualizado em um ponto importante**: descreve o Health Score com 9 fatores — nesta sessão ele foi reformulado para os **7 pilares** descritos abaixo, que é a versão atualmente em produção.

---

## 1. O que foi testado de verdade (não só lido)

### Backend — 34 chamadas reais contra a API rodando, sem mockar nada

| Área | Testes | Resultado |
|---|---|---|
| Autenticação | Login (PACIENTE/PROFISSIONAL/ADMIN), `/auth/me`, refresh token, rejeição de senha errada, rejeição sem token | ✅ 5/5 |
| Membros da família | Listar, detalhe, 404 em membro inexistente | ✅ 3/3 |
| Registros de saúde | GET de condições, alergias, medicamentos, contatos, sinais vitais, sintomas | ✅ 6/6 |
| Wellness | GET de perfil nutricional, peso, água, refeições, exercícios, estatística semanal, psicologia | ✅ 7/7 |
| Health Score / Insights | Geração de insights, cálculo de score, **confirmado: 7 pilares somando exatamente 100 pontos**, tendência de 7 dias presente | ✅ 6/6 |
| Relatório agregado | GET do relatório de saúde do membro | ✅ 1/1 |
| Compartilhamento (LGPD) | Listar compartilhamentos, criar+apagar registro de teste (limpo depois), validação de campo obrigatório | ✅ 5/5 |
| Autorização entre papéis | PACIENTE tentando acessar rota de ADMIN → 403; profissional pendente loga mas não consegue receber compartilhamento (bloqueado com 400 explícito) | ✅ 2/2 |

**Nenhuma chamada falhou.** O único "erro" apontado pelo script de teste foi o próprio script assumir `204` no DELETE quando a API retorna `200` — comportamento correto, só uma convenção diferente (ver seção 4).

### Frontend

- `npx tsc --noEmit`: **limpo**, backend e frontend, checado repetidamente a cada rodada de correção.
- `npx expo lint`: **0 erros**, 4 avisos informativos pré-existentes (limitação conhecida do `react-hook-form` com o React Compiler, e dois `useEffect` com dependências omitidas intencionalmente — nenhum é bug).
- Auditoria de código em **24 arquivos de tela** (auth, tabs, membro, wellness, admin, compartilhamento, perfil) feita por três revisões independentes, procurando: imports não usados, referências a coisas removidas, acesso a `null`/`undefined` sem guarda, `TODO`/placeholders esquecidos, e mutações sem tratamento de erro.

---

## 2. Bugs encontrados e corrigidos nesta sessão

| # | Bug | Onde | Causa | Correção |
|---|---|---|---|---|
| 1 | Crash "Couldn't find a navigation context" ao trocar de aba (Wellness) ou de tema (Configurações) | `wellness.tsx`, `configuracoes.tsx`, `admin/profissionais.tsx`, `compartilhamento/novo.tsx` (4 pontos) | `TouchableOpacity` com `className` condicional (template string trocando de classe) dentro de `.map()` — padrão que quebra a integração NativeWind/Expo Router nesta versão | Convertido para `className` estático + `style` inline condicional em todos os 6 pontos afetados |
| 2 | Saudação da Home podia mostrar dia da semana errado | `home.tsx` | `toLocaleDateString('pt-BR', {weekday:'long'})` depende de dados ICU que nem todo Android com Hermes tem completos | Nome do dia/mês agora montado manualmente (`utils/date.ts`), sem depender de `Intl` |
| 3 | Tela de Estatísticas mostrava "Sem dados ainda" mesmo quando havia registros de água | `estatisticas.tsx` | Checagem `hasAnyData` esquecia de incluir `water.data` | Adicionado à checagem |
| 4 | Tela de Conquistas travava no loading para sempre se o usuário não tivesse nenhum membro cadastrado | `perfil/conquistas.tsx` | Condição `!membroId` nunca resolvia (não distinguia "carregando" de "carregado e vazio") | Agora mostra um estado vazio explicativo em vez de girar infinitamente |
| 5 | Revogar compartilhamento falhava silenciosamente (sem aviso ao usuário) se desse erro | `compartilhamento.tsx` (lista) | `mutate()` sem `onError` | Toast de erro adicionado, mesmo padrão já usado em Família |
| 6 | Botões de água rápida (+200/300/500ml) falhavam silenciosamente em caso de erro | `wellness.tsx` | `mutate()` sem `onError` | Toast de erro adicionado |
| 7 | Sino de notificação na Home não fazia nada ao tocar | `home.tsx` | Faltava `onPress` | Agora leva para Configurações → Notificações (removido também o indicador vermelho de "não lida", já que não existe uma central de notificações real por trás) |
| 8 | Health Score com 9 fatores diferentes dos 7 pilares do design (Sinais Vitais 25, Bem-estar 20, Nutrição 15, Exercícios 15, Hidratação 10, Sono 10, Adesão 5) | `healthInsight.service.ts` (backend) | Cálculo nunca tinha sido atualizado pra bater com a especificação de design | Reescrito para os 7 pilares reais, com tendência de 7 dias calculada sob demanda (sem tabela nova no banco) |
| 9 | `expo-notifications` derrubava o app inteiro no Expo Go (Android, SDK 53+) | `notifications.service.ts` | Limitação da própria plataforma Expo Go — nem notificação local funciona lá | Detecção de Expo Go, módulo nativo isolado atrás de import tardio, no-op gracioso com aviso na tela em vez de crash |

---

## 3. Observações registradas, não corrigidas (baixo risco, documentadas)

- **DELETE retorna `200` em vez de `204`**: funciona corretamente (registro é apagado), só não segue a convenção REST estrita. Não afeta o app, que trata qualquer 2xx como sucesso.
- **Home não mostra erro se falhar a busca de água/peso/exercício/psicológico/condições/medicamentos/score** — só a lista de membros tem tratamento de erro visível; as demais falham "silenciosamente" mostrando zeros. Aceitável para a demonstração, mas se a banca perguntar sobre robustez, é um ponto honesto a mencionar.
- **Rejeitar profissional não tem diálogo de confirmação** antes de abrir o modal (só o preenchimento do motivo com mínimo de 5 caracteres funciona como barreira). Aprovar já tem confirmação via `Alert.alert`.
- **Adesão ao Tratamento** (pilar de 5 pontos do Health Score) é uma **estimativa**, não uma medição real — o sistema não registra se o paciente realmente tomou o medicamento, só a lista de medicamentos ativos. Isso já está documentado no texto de `explicacao` que a própria API retorna.
- **Sparkline de 7 dias e gráfico "evolução do score" de longo prazo**: o de 7 dias existe e é real (recalculado a partir dos dados brutos); um gráfico de vários meses não foi implementado porque exigiria guardar histórico do score no banco (mudança de schema, fora do escopo combinado).
- **PNG do ícone/splash do app** não foi regenerado a partir do novo símbolo do Logo — segue pendente, precisa de ferramenta externa de exportação SVG→PNG.

---

## 4. Veredito: apto para apresentação?

**Sim, com ressalvas conhecidas e documentadas.** Backend e frontend compilam sem erros, o lint está limpo, os fluxos principais (autenticação, cadastro de membro, registro de dados de saúde, Health Score, compartilhamento LGPD, aprovação de profissionais) foram testados de ponta a ponta contra a API real e funcionam. Os 9 bugs encontrados nesta auditoria foram corrigidos e revalidados.

**Recomendações antes da banca:**
1. Testar em dispositivo físico após esta rodada de correções (reinício completo do Metro — várias mudanças em `app.json`/dependências nativas aconteceram nesta sessão).
2. Ter na ponta da língua a explicação do pilar "Adesão ao Tratamento" ser uma estimativa (seção 3) — é o ponto mais provável de pergunta técnica da banca sobre limitações.
3. Decidir se vale a pena gerar os PNGs de ícone/splash antes da entrega final (item cosmético, não bloqueia a apresentação).
4. Ao demonstrar o fluxo de Admin, usar o profissional "Dr. João Santos" (pendente) para o fluxo de aprovação ao vivo — não foi alterado nesta auditoria, o estado dele nos dados de exemplo continua intacto.
