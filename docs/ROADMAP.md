# Roadmap

1. **M1 — Fundação**: projeto de pé, produtos cadastrados, rodando no celular
2. **M2 — Receitas**: cadastro de receitas ligadas a produtos
3. **M3 — Semana + Lista**: plano semanal e algoritmo de consolidação com origens
4. **M4 — No mercado**: checklist reverso, modo de compra e offline

---

## M1 — Fundação

**Objetivo:** base técnica pronta e cadastro de produtos funcionando no celular, com os produtos reais da casa.

**Definition of Done:** abro o app no celular, vejo meus produtos agrupados por seção e consigo criar e editar um produto.

Ordem sugerida: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11.

### 1. Setup do monorepo

- [x] pnpm workspaces com `apps/web`, `apps/api` e `packages/shared`
- [x] TypeScript `strict` com tsconfig base compartilhado
- [x] Scripts raiz: `dev`, `build`, `lint`, `typecheck`, `test`
- [x] `.nvmrc` com a Node LTS ativa
- [x] Atualizar a seção "Comandos" do CLAUDE.md

### 2. Tooling e qualidade

- [x] Oxlint + Prettier para todo o monorepo (ESLint trocado por Oxlint: typescript-eslint não suporta TS 7)
- [x] Vitest configurado em `api` e `shared`
- [x] `.editorconfig` e `.env.example`

### 3. Banco de dados e ORM

- [ ] Postgres via docker-compose
- [ ] ORM com migrations (decidir Drizzle ou Prisma)
- [ ] Comando único para subir o banco e rodar migrations

### 4. Schema base

- [ ] `Section`: name, order
- [ ] `Product`: name, section, baseUnit (`g` | `ml` | `un`), packageSize, packageName, isRecurring
- [ ] Testes das regras de validação (packageSize > 0, unidade válida)

### 5. Seed com dados reais

- [ ] Seções na ordem do mercado onde compro
- [ ] 20 a 30 produtos reais da casa, com embalagens reais

### 6. Schemas compartilhados

- [ ] Schemas Zod de `Product` e `Section` em `packages/shared`
- [ ] Tipos inferidos usados na API e no web

### 7. API de produtos e seções

- [ ] CRUD de produtos e listagem de seções
- [ ] Validação com os schemas compartilhados
- [ ] Testes de integração das rotas principais

### 8. Shell do PWA

- [ ] Vite + React, layout mobile-first
- [ ] Manifest + service worker básico (instalável)
- [ ] Navegação base

### 9. Tela de produtos

- [ ] Lista agrupada por seção, na ordem do mercado
- [ ] Formulário de criar/editar produto
- [ ] Filtro "só recorrentes"

### 10. CI

- [ ] GitHub Actions: lint, typecheck e testes em cada push/PR

### 11. Deploy (pode escorregar pra M2)

- [ ] API e web publicados num serviço simples
- [ ] Acessível no celular fora de casa
