# Central de Marketing

Webapp interno de planejamento de marketing, campanhas de mídia paga (Meta Ads e Google Ads), gestão de criativos, atendentes comerciais e acompanhamento de faturamento de leads novos.

## Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v4** + componentes no estilo shadcn/ui (Radix UI + CVA)
- **Prisma ORM** apontando para **Postgres no Supabase** (ver nota abaixo)
- **React Hook Form** + **Zod** para formulários e validação
- **Recharts** para gráficos, **React Flow** para o Mapa da Estratégia
- **date-fns** com locale `pt-BR`, timezone `America/Sao_Paulo`, moeda `R$`
- Autenticação por sessão (cookie httpOnly + JWT via `jose`), com dois perfis: `ADMIN` e `ATTENDANT`

### Sobre o banco de dados

`prisma/schema.prisma` usa `provider = "postgresql"` e `DATABASE_URL` (em `.env`, não versionado) aponta para o Postgres do projeto Supabase. A autenticação continua sendo a sessão própria (cookie httpOnly + JWT), não o Supabase Auth — `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` ficam disponíveis para uso futuro no lado do cliente (Storage, Realtime etc.), mas nada os usa ainda.

**Aplicando o schema no Supabase:** o ambiente onde este código foi escrito tem a saída de rede restrita a HTTPS por uma política da organização, e o host do Supabase não estava liberado nela — então não foi possível rodar `prisma db push`/`prisma migrate` direto daqui. `prisma/supabase_init.sql` já contém o DDL completo gerado a partir do schema (via `prisma migrate diff`), pronto para colar no **SQL Editor** do painel do Supabase. Depois de rodar esse SQL, popule os dados de demonstração com `npm run seed` a partir de um ambiente com acesso normal ao Postgres (sua máquina, CI ou o próprio deploy) — o script é idempotente (limpa e recria os dados a cada execução).

Se preferir aplicar via Prisma em vez do SQL Editor, rode a partir de um ambiente com acesso à porta 5432:

```bash
npx prisma db push
npm run seed
```

## Rodando localmente

```bash
npm install
npx prisma generate
npm run dev
```

Acesse `http://localhost:3000`. Certifique-se de que o schema já foi aplicado no Supabase (seção acima) antes de rodar.

### Login de demonstração

- **Administrador:** `admin@gidhub.com.br` / `admin123`
- **Atendente:** `barbara@gidhub.com.br` / `atendente123`

## Deploy na Vercel

1. **Aplique o schema no Supabase antes do primeiro deploy** (seção acima) — cole `prisma/supabase_init.sql` no SQL Editor e rode `npm run seed` de algum lugar com acesso ao Postgres.
2. Importe o repositório na Vercel normalmente (framework Next.js é detectado automaticamente — não precisa de `vercel.json`).
3. Em **Project Settings → Environment Variables**, cadastre (Production e Preview):
   - `DATABASE_URL` — connection string do **pooler** do Supabase (Project Settings → Database → Connection string → modo *Transaction*, porta `6543`, com `?pgbouncer=true` no final). Funções serverless abrem muitas conexões simultâneas; sem o pooler o limite de conexões do Postgres estoura rápido.
   - `DIRECT_URL` — connection string **direta** (porta `5432`), usada só pelo `prisma generate` durante o build.
   - `SESSION_SECRET` — um valor aleatório forte (`openssl rand -base64 32`). Sem essa variável o app recusa subir em produção (`NODE_ENV=production`) em vez de usar um segredo fraco.
   - `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` — do painel do Supabase (Project Settings → API).
4. O build (`npm run build`) já roda `prisma generate` antes do `next build` (via `postinstall` e via o próprio script `build`), então o Prisma Client sempre é gerado fresco para o ambiente da Vercel — não é preciso configurar nada extra de *build command*.
5. Depois do deploy, troque a senha do usuário admin de demonstração (ou crie um usuário novo direto no banco) antes de divulgar o link — as credenciais do `npm run seed` são só para desenvolvimento.

Veja `.env.example` para o formato de cada variável.

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
