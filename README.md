# Central de Marketing

Webapp interno de planejamento de marketing, campanhas de mídia paga (Meta Ads e Google Ads), gestão de criativos, atendentes comerciais e acompanhamento de faturamento de leads novos.

## Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v4** + componentes no estilo shadcn/ui (Radix UI + CVA)
- **Prisma ORM** — schema modelado para Postgres/Supabase, rodando localmente em **SQLite** (ver nota abaixo)
- **React Hook Form** + **Zod** para formulários e validação
- **Recharts** para gráficos, **React Flow** para o Mapa da Estratégia
- **date-fns** com locale `pt-BR`, timezone `America/Sao_Paulo`, moeda `R$`
- Autenticação por sessão (cookie httpOnly + JWT via `jose`), com dois perfis: `ADMIN` e `ATTENDANT`

### Sobre o banco de dados

O ambiente de desenvolvimento não tinha um projeto Supabase configurado, então o Prisma está apontando para SQLite local (`prisma/dev.db`) para que o app rode e persista dados de ponta a ponta sem depender de credenciais externas. O `schema.prisma` foi modelado para ser compatível com Postgres — para migrar para Supabase:

1. Troque `provider = "sqlite"` para `provider = "postgresql"` em `prisma/schema.prisma`.
2. Aponte `DATABASE_URL` (`.env`) para a connection string do projeto Supabase.
3. Rode `npx prisma db push` (ou configure migrations com `prisma migrate`).
4. Configure RLS no Supabase e troque a autenticação por cookie/JWT própria pelo Supabase Auth, se desejado.

## Rodando localmente

```bash
npm install
npx prisma generate
npx prisma db push
npm run seed      # popula dados de demonstração
npm run dev
```

Acesse `http://localhost:3000`.

### Login de demonstração

- **Administrador:** `admin@gidhub.com.br` / `admin123`
- **Atendente:** `barbara@gidhub.com.br` / `atendente123`

## Scripts

- `npm run dev` — ambiente de desenvolvimento
- `npm run build` — build de produção
- `npm run lint` — ESLint
- `npm run seed` — repopula o banco com dados de demonstração (atendentes, produtos, públicos, criativos, campanhas e lançamentos de faturamento)

## Estrutura

```
src/
  app/            rotas (App Router) — grupo (app) para páginas autenticadas
  components/ui/  primitivos de UI (estilo shadcn)
  components/     shared: MetricCard, CampaignCard, AttendantCard, PageHeader, etc.
  components/layout/ sidebar, topbar, busca global, tema
  features/       por domínio: schema (zod) + actions (server actions) + queries (Prisma) + formulários
  lib/            auth, prisma client, métricas, formatação, período de datas
  types/          enums e tipos compartilhados
prisma/
  schema.prisma   modelo de dados
  seed.ts         dados de demonstração
```
