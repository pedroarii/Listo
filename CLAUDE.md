# Listo

Lista de mercado unificada: junta as receitas da semana com os itens recorrentes da casa, desconta o que já tenho e entrega tudo em embalagens reais, agrupado por seção do mercado.

Projeto pessoal: eu (Pedro) sou o usuário principal. Prioridade é resolver bem o meu uso, com código de qualidade de portfólio. Não é um produto comercial (ainda).

## Como trabalhar comigo

- Converse comigo em português. Código, nomes, commits, branches e comentários em inglês.
- Antes de implementar algo não trivial, proponha um plano curto e espere meu ok.
- Trabalhe uma issue por vez (ver `docs/ROADMAP.md`). Uma branch por issue: `feat/<n>-short-name`.
- Commits pequenos, no padrão Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `docs:`).
- Antes de dizer que algo está pronto: rode lint, typecheck e testes, e me mostre o resultado.
- Não adicione dependências sem me dizer qual e por quê. Prefira poucas dependências e bem mantidas.
- Decisões marcadas como "em aberto" abaixo: me apresente as opções com prós e contras e deixe eu escolher.
- Quando uma decisão for tomada ou um comando passar a existir, atualize este arquivo.

## Conceito central do produto

A lista é **unificada**: cada item sabe de onde veio.

- **Origens de um item:** receita (da semana), recorrente (item da casa) ou manual (avulso).
- **Consolidação:** o mesmo produto vindo de várias origens vira um item só, com as quantidades somadas e as origens preservadas. Ex.: "Frango: 1 bandeja (strogonoff 300g + marmita 600g)".
- **Unidade de compra:** quantidades são convertidas para embalagens reais. Precisa de 900g e a bandeja tem 1kg → 1 bandeja. Arredonda sempre pra cima e informa a sobra.
- **Checklist reverso:** o app mostra a lista completa e eu desmarco o que já tenho em casa. Não existe inventário de despensa na v0.
- Mudar a semana (tirar/adicionar receita, mudar porções) recalcula a lista.

## Modelo de domínio (alvo)

```
Section   → name, order (ordem em que ando no mercado)
Product   → name, section, baseUnit (g | ml | un), packageSize, packageName ("bandeja", "pacote"), isRecurring
Recipe    → name, servings, ingredients: [productId, quantity, unit]
WeekPlan  → [recipeId, servings]
ListItem  → productId, neededQty, packagesToBuy, origins: [{ type: recipe | recurring | manual, ref, qty }]
```

Unidades na v0: apenas `g`, `ml` e `un`. Conversões de medidas caseiras (colher, xícara) ficam fora por enquanto.

## Fora de escopo (não implemente sem eu pedir)

Preços, IA, foto/scan de despensa, inferência de estoque, integração com mercados/delivery, contas multiusuário, nutrição/macros.

## Stack e arquitetura

- Monorepo com **pnpm workspaces**:
  - `apps/web` — React + Vite, **PWA mobile-first** (uso principal é no celular, dentro do mercado; a lista gerada precisa funcionar offline em milestones futuras)
  - `apps/api` — Node + TypeScript + **Hono** (via `@hono/node-server`)
  - `packages/shared` — schemas Zod e tipos compartilhados entre web e api (fonte única da verdade para validação)
- **TypeScript `strict`** em tudo, tsconfig base compartilhado (`tsconfig.base.json`, com `noUncheckedIndexedAccess` e `verbatimModuleSyntax`). ESM em todos os pacotes.
- **Postgres** via docker-compose em desenvolvimento.
- Testes com **Vitest**. A lógica de consolidação da lista é o coração do app e deve ser pura (sem I/O) e muito bem testada.
- Versão do Node fixada em `.nvmrc` (usar a LTS ativa).

### Decisões tomadas

- **Node 26** (LTS ativa). **pnpm fixado via `packageManager` + Corepack** (Corepack não vem mais com o Node 25+: `npm i -g corepack && corepack enable`).
- **Framework HTTP: Hono** — Zod nativo via `@hono/zod-validator`, cliente RPC tipado (`hc`) para o web, testes via `app.request()` e portável entre runtimes (deixa o deploy em aberto).
- **`@listo/shared` exporta o TS fonte** (sem build). Vite e `tsx` consomem direto; o build da API usa **tsdown** e embute o shared no bundle (`deps.alwaysBundle`).
- **Portas em dev:** API `3001` (a 3000 é usada por outro projeto), web `5173` com proxy `/api` → API. Postgres na **5433** (a 5432 é usada por outro projeto), com `name: listo` no docker-compose (issue 3).
- Build scripts de dependências ficam bloqueados por padrão; liberações explícitas em `allowBuilds` no `pnpm-workspace.yaml`.
- **Lint: Oxlint** (não ESLint) — o `typescript-eslint` só suporta TS `<6.1` e o repo usa TS 7. Config única em `.oxlintrc.json` na raiz, warnings quebram o lint (`--deny-warnings`). Regras com tipo (`--type-aware`, exige `oxlint-tsgolint`) ainda não ligadas.
- **Formatação: Prettier** (`singleQuote`, `printWidth: 100`), config em `.prettierrc.json`.
- **Testes: Vitest** em `api` e `shared`, cada um com seu `vitest.config.ts`. Rotas testadas via `app.request()`. Meta de 80% de cobertura no `shared` entra junto com os schemas (issue 6).

### Decisões em aberto

- ORM: Drizzle ou Prisma (decidir na issue 3).
- Serviço de deploy (decidir na issue 11).

## Comandos

Todos na raiz:

- `pnpm install` — instala tudo
- `pnpm dev` — sobe API (http://localhost:3001) e web (http://localhost:5173) em paralelo
- `pnpm build` — build de todos os pacotes (API → `apps/api/dist/server.mjs`, web → `apps/web/dist`)
- `pnpm typecheck` — `tsc` em cada pacote
- `pnpm lint` — Oxlint no repo inteiro
- `pnpm format` / `pnpm format:check` — Prettier (escreve / só verifica)
- `pnpm test` — Vitest em cada pacote (`pnpm test:coverage` com cobertura; `pnpm --filter <pkg> test:watch` em modo watch)
- `pnpm --filter @listo/api start` — roda o build da API
- db: ainda não existe (issue 3)

## Estado atual

- Milestone atual: **M1 — Fundação** (detalhes e issues em `docs/ROADMAP.md`).
- Issues #1 e #2 concluídas. Próxima issue: **#3 Banco de dados e ORM**.
