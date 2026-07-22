# Redesign visual do SASF

Redesign puramente de apresentação do app `sasf-app`. Nenhuma regra de negócio, hook, chamada de API/serviço, rota ou estrutura de dados foi alterada — apenas JSX, `className`, componentes de `components/ui/` e tema.

## 1. Identidade e tema

Duas identidades conviviam no repositório (documentação em roxo/Poppins vs. a paleta azul já implementada em `tailwind.config.js`). **A paleta azul venceu**, por já ser a que está de fato implementada e testada no app.

`tailwind.config.js`:
- Cores consolidadas: `primary` `#2563EB` (+ `primary-50`, `primary-600`/`primary-dark` `#1D4ED8`), `secondary` `#10B981`, `accent` `#06B6D4` (+ `accent-light`), `success` `#16A34A`, `warning` `#F59E0B`, `danger`/`error` `#DC2626` (alias), `lime` `#84CC16` (faixa "Bom" do Health Score).
- `borderRadius` estendido com `3xl` (22px) e `4xl` (26px) para cards hero, além da escala padrão do Tailwind (12–16px).
- `fontFamily` migrada de Inter para **Plus Jakarta Sans** (400/500/600/700/800).

`app/_layout.tsx`:
- Carrega os 5 pesos da Plus Jakarta Sans via `@expo-google-fonts/plus-jakarta-sans`.
- Define `Text.defaultProps.style` com a fonte regular como fallback global — NativeWind só aplica `fontFamily` via `className` explícita, então sem isso qualquer `<Text>` sem `font-*` cairia na fonte padrão do sistema.
- Corrigidas duas referências residuais a `Inter_600SemiBold` que sobreviviam em `(tabs)/_layout.tsx` (bottom nav) e `(app)/_layout.tsx` (header title) — bug real, texto nesses dois pontos não estava pegando a fonte nova.

## 2. Logo

`components/ui/Logo.tsx` reescrito com `react-native-svg`: escudo com linha de pulso (mesmo símbolo usado no ícone do app hoje), três variantes:
- `full` (padrão): preenchimento em gradiente azul→ciano via `<LinearGradient>` do próprio SVG, com sombra azul (`constants/shadows.ts`).
- `icon`: preenchimento sólido numa cor (contextos pequenos/densos onde gradiente fica poluído).
- `mono`: apenas contorno, sem preenchimento (fundos escuros, marca d'água).

Os arquivos `assets/icon.png`/`assets/splash.png` **não foram regenerados** — não há ferramenta de rasterização SVG→PNG neste ambiente. Ficou combinado com o usuário que isso é um passo manual futuro (exportar o símbolo SVG acima numa ferramenta de design).

## 3. Sistema de componentes (`components/ui/`)

- `Button.tsx`: sombras coloridas por variante (`constants/shadows.ts`), nova variante `danger-outline` (contorno vermelho, usada onde o mockup pede ação destrutiva secundária, ex. "Rejeitar" profissional).
- `Input.tsx`: `displayName` adicionado (erro de lint pré-existente).
- `StatCard.tsx`, `HealthScore.tsx`: sombra padronizada via `cardShadow`.
- `ProgressRing.tsx`: cor do trilho ajustada para `#F1F5F9`.
- `Toast.tsx`: fundo mudou de cor sólida por tipo para **fundo escuro neutro + ícone colorido por tipo** (sucesso/erro/info), como pedido. Corrigido também um erro real de lint (`useRef(...).current` lido durante o render — trocado por `useState(() => ...)`, comportamento idêntico).
- `Skeleton.tsx`: mesmo fix de `useRef`→`useState`.
- `AddModal.tsx` (`components/health/`): já implementava alça de arrasto no topo e animação de subida nativa (`Modal animationType="slide"`) — só o raio dos cantos foi ajustado para `rounded-t-4xl`.
- `MemberScoreRing.tsx` (novo): anel de progresso com o Health Score real de um membro, usado nos cards de família (Home e tela Família) no lugar do círculo com iniciais.

Não foram criados `Card.tsx`/`Chip.tsx` genéricos: o app já tem um padrão de card consistente (`bg-surface rounded-2xl border border-gray-100` + sombra) repetido deliberadamente em vez de abstraído, e `ChipSelect.tsx` já cobre o papel de "Chip" em todo o app. Criar componentes novos sem adoção em nenhuma tela iria contra a instrução de reaproveitar o que existe.

## 4. Health Score

Anel de progresso + breakdown com barras "obtido/peso" + faixa de cor + rótulo, usando os fatores **reais** retornados por `healthInsightService.calculateScore` (backend, inalterado): IMC, Sono, Humor, Ansiedade, Hidratação, Exercícios, Sinais Vitais, Condições de Saúde, Medicamentos.

**Decisão registrada com o usuário**: os 7 pilares/pesos específicos pedidos na spec (Sinais vitais 25 · Bem-estar psicológico 20 · Nutrição 15 · Exercícios 15 · Hidratação 10 · Sono 10 · Adesão 5) são diferentes do que o backend calcula hoje. Optou-se por manter o cálculo real e não fabricar dados que não existem — mudar o backend para bater com a spec seria alterar regra de negócio, o que as regras invioláveis proíbem.

**Limitação conhecida**: a mini-tendência (sparkline) de 7 dias pedida na spec não foi implementada porque o backend não expõe histórico de score ao longo do tempo, só o snapshot atual. O mesmo vale para o gráfico "Evolução do Health Score" da tela de Estatísticas. Adicionar isso exigiria um endpoint novo (regra de negócio), fora do escopo desta tarefa.

## 5. Telas

Praticamente todas as telas do app foram revisadas nesta sessão (incluindo uma passada anterior de restyle geral). Destaques desta rodada final:

- **`membro/[id]/wellness.tsx`**: reestruturada em **abas** Nutrição / Exercícios / Psicologia (antes mostrava tudo empilhado). Health Score, Insights, Linha do Tempo e o atalho para Estatísticas ficam sempre visíveis acima das abas, por serem visão geral do membro, não específicos de um domínio. Nenhum hook, mutation ou modal foi alterado — só a organização do JSX.
- **`perfil.tsx`** (aba): avatar em gradiente, hero com `rounded-4xl`, nova linha de estatísticas (Membros/Medalhas/Sequência).
- **`familia.tsx`** / **`home.tsx`**: avatares de membro trocados de iniciais para anel de Health Score (`MemberScoreRing`); botão "Novo Membro" em `familia.tsx` virou contorno tracejado.
- **`perfil/conquistas.tsx`**: hero em gradiente laranja + grade 2 colunas com badge de status.
- **`perfil/dispositivos.tsx`**: cabeçalho ilustrado centralizado.
- **`admin/profissionais.tsx`**: contadores Pendente/Aprovado/Rejeitado.
- **`admin/profissional/[id].tsx`**: "Aprovar" em verde (`variant="secondary"`), "Rejeitar" em contorno vermelho (`variant="danger-outline"`) — antes os dois usavam variantes que não batiam com a hierarquia visual esperada.
- **`compartilhamento/novo.tsx`**: prazo de expiração virou 3 chips fixos (7/30/90 dias) em vez de campo numérico livre.
- **`compartilhamento/[id].tsx`** e **`perfil/dispositivos.tsx`** já atendiam à spec (token parcialmente oculto em monospace + histórico de acessos em timeline; provedores nomeados) e não precisaram de mudança estrutural.
- **`(auth)/login.tsx`**: divisor "ou" adicionado entre o botão de entrar e o link de cadastro.

Telas **não** restruturadas por decisão deliberada: `estatisticas.tsx`, `configuracoes.tsx`, `sobre.tsx`, `membro/novo.tsx`, `register.tsx` — já usam os tokens de cor/raio/sombra corretos e, no caso de Configurações/Sobre, têm mais funcionalidade do que a referência de design mostra (idioma, limpar cache, seções extra); reestruturá-las para bater 100% com o layout de referência seria mudança de produto, não de estilo.

## 6. Microinterações

`react-native-reanimated` já está no projeto, mas a maior parte do que a spec pede já existia via `Animated` nativo e comportamento padrão do React Native:
- Toast: entrada com `Animated.spring` (já existia, mantido).
- BottomSheet (`AddModal`): subida nativa via `Modal animationType="slide"` + alça de arrasto visual no topo (já existia).
- Estados pressionados: `activeOpacity` em praticamente todo `TouchableOpacity` do app (já existia, padrão consistente).

**Não implementado**: uma splash screen animada *dentro do app* (fade/scale/ripple). O app usa a splash nativa do Expo (`app.json` + `expo-splash-screen`), que já cobre o carregamento inicial. Adicionar uma tela de splash animada em JS exigiria uma rota/tela nova antes do auth-gate, o que esbarra na regra "não altere navegação/rotas".

## 7. Lint e build

- `npx expo lint` configurou ESLint pela primeira vez neste projeto (não havia configuração antes). Ele encontrou **7 erros reais em código pré-existente** (não escrito nesta sessão): `Input.tsx` sem `displayName`, e `Skeleton.tsx`/`Toast.tsx` lendo `useRef(...).current` durante o render (padrão que sempre funcionou na prática, mas viola a regra nova `react-hooks/refs` do React 19). Todos os três foram corrigidos com mudanças mínimas e comportamentalmente idênticas.
- Resultado final: `npx expo lint` → **0 erros, 4 avisos** (avisos restantes são limitações informativas de biblioteca — `react-hook-form`'s `watch()` não pode ser memoizado pelo React Compiler — e `exhaustive-deps` em `useEffect`s que intencionalmente rodam só uma vez; nenhum é um bug).
- `npx tsc --noEmit` → limpo, sem erros, validado a cada bloco desta tarefa.

## Prontidão para apresentação de TCC

**Pontos fortes**: identidade visual única e consistente (cor, tipografia, raio, sombra) aplicada de ponta a ponta; Health Score transparente com breakdown real (não uma caixa-preta); fluxo de compartilhamento LGPD com token ofuscado e trilha de auditoria; zero erros de tipo ou lint.

**Recomendações antes da banca**:
1. Gerar os PNGs de ícone/splash a partir do novo símbolo do `Logo` (pendente, ferramenta externa).
2. Se a banca perguntar sobre os "7 pilares" do Health Score, a resposta correta é a lista real de 9 fatores que o backend calcula (documentada no item 4) — não a lista conceitual de 7 que apareceu numa versão anterior da especificação.
3. Testar o app em dispositivo físico após este redesign (troca de fonte + `expo-linear-gradient` novo) para confirmar que não há regressão visual em Android/iOS reais, não só no Expo Go durante o desenvolvimento.
