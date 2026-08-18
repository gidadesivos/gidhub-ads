// Gera prisma/supabase_seed.sql com o mesmo dataset de demonstração do prisma/seed.ts,
// mas como INSERTs SQL puros — para rodar direto no SQL Editor do Supabase, sem precisar
// de uma conexão Postgres alcançável a partir de onde este script roda (bcrypt é 100% local).
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";

function id() {
  return randomUUID();
}

function daysAgo(n) {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - n);
  return d;
}

function inDays(n) {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + n);
  return d;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function yearMonth(date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function sqlStr(value) {
  if (value === null || value === undefined) return "NULL";
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlNum(value) {
  if (value === null || value === undefined) return "NULL";
  return String(value);
}

function sqlBool(value) {
  return value ? "TRUE" : "FALSE";
}

function sqlDate(date) {
  return `'${date.toISOString()}'`;
}

const statements = [];

function insert(table, columns, rows) {
  if (rows.length === 0) return;
  const cols = columns.map((c) => `"${c}"`).join(", ");
  const values = rows.map((row) => `(${row.join(", ")})`).join(",\n  ");
  statements.push(`INSERT INTO "${table}" (${cols}) VALUES\n  ${values};`);
}

async function main() {
  // ---------- Atendentes ----------
  const barbara = { id: id(), name: "Bárbara Souza", initials: "BS", dailyGoal: 5000, monthlyGoal: 110000, leadCapacity: 150 };
  const sara = { id: id(), name: "Sara Lima", initials: "SL", dailyGoal: 4500, monthlyGoal: 95000, leadCapacity: 280 };
  const joao = { id: id(), name: "João Pedro", initials: "JP", dailyGoal: 3200, monthlyGoal: 70000, leadCapacity: 80 };
  const attendants = [barbara, sara, joao];

  insert(
    "Attendant",
    ["id", "name", "avatarUrl", "initials", "status", "dailyGoal", "monthlyGoal", "leadCapacity", "createdAt", "updatedAt"],
    attendants.map((a) => [
      sqlStr(a.id),
      sqlStr(a.name),
      "NULL",
      sqlStr(a.initials),
      sqlStr("active"),
      sqlNum(a.dailyGoal),
      sqlNum(a.monthlyGoal),
      sqlNum(a.leadCapacity),
      sqlDate(new Date()),
      sqlDate(new Date()),
    ])
  );

  // ---------- Usuários ----------
  const adminHash = await bcrypt.hash("admin123", 10);
  const attHash = await bcrypt.hash("atendente123", 10);
  const users = [
    { id: id(), email: "admin@gidhub.com.br", passwordHash: adminHash, name: "Administrador", role: "ADMIN", attendantId: null },
    { id: id(), email: "barbara@gidhub.com.br", passwordHash: attHash, name: "Bárbara Souza", role: "ATTENDANT", attendantId: barbara.id },
    { id: id(), email: "sara@gidhub.com.br", passwordHash: attHash, name: "Sara Lima", role: "ATTENDANT", attendantId: sara.id },
  ];
  insert(
    "User",
    ["id", "email", "passwordHash", "name", "role", "attendantId", "createdAt", "updatedAt"],
    users.map((u) => [
      sqlStr(u.id),
      sqlStr(u.email),
      sqlStr(u.passwordHash),
      sqlStr(u.name),
      sqlStr(u.role),
      u.attendantId ? sqlStr(u.attendantId) : "NULL",
      sqlDate(new Date()),
      sqlDate(new Date()),
    ])
  );

  // ---------- Produtos ----------
  const productDefs = [
    { name: "Adesivo Resinado", category: "Adesivos", description: "Adesivos resinados personalizados com alto brilho e durabilidade." },
    { name: "Etiquetas Personalizadas", category: "Etiquetas", description: "Etiquetas sob medida para indústria e comércio." },
    { name: "Adesivo Industrial", category: "Adesivos", description: "Adesivos para identificação de máquinas e painéis elétricos." },
    { name: "Policarbonato", category: "Chapas", description: "Chapas e placas de policarbonato para sinalização e proteção." },
    { name: "Banner", category: "Impressos", description: "Banners promocionais em lona." },
    { name: "Lacre", category: "Segurança", description: "Lacres de segurança personalizados." },
  ];
  const products = productDefs.map((p) => ({ ...p, id: id() }));
  insert(
    "Product",
    ["id", "name", "category", "description", "active", "createdAt", "updatedAt"],
    products.map((p) => [sqlStr(p.id), sqlStr(p.name), sqlStr(p.category), sqlStr(p.description), sqlBool(true), sqlDate(new Date()), sqlDate(new Date())])
  );
  const [prAdesivoResinado, prEtiquetas, prAdesivoIndustrial, prPolicarbonato] = products;

  // ---------- Ofertas ----------
  const offerResinado = { id: id(), name: "Combo Resinado 3x2", productId: prAdesivoResinado.id, description: "Leve 3 chapas e pague 2.", cta: "Peça um orçamento" };
  const offerEtiquetas = { id: id(), name: "Etiquetas em lote", productId: prEtiquetas.id, description: "Desconto progressivo por volume.", cta: "Simule seu pedido" };
  const offerPolicarbonato = { id: id(), name: "Policarbonato sob medida", productId: prPolicarbonato.id, description: "Corte sob medida com entrega em 5 dias.", cta: "Solicite amostra" };
  const offers = [offerResinado, offerEtiquetas, offerPolicarbonato];
  insert(
    "Offer",
    ["id", "name", "productId", "description", "cta", "notes", "createdAt"],
    offers.map((o) => [sqlStr(o.id), sqlStr(o.name), sqlStr(o.productId), sqlStr(o.description), sqlStr(o.cta), "NULL", sqlDate(new Date())])
  );

  // ---------- Públicos ----------
  const audienceDefs = [
    { name: "Indústrias", platform: "meta", type: "interest", description: "Donos e compradores de indústrias de médio porte.", location: "SP, PR, SC", ageRange: "28-55", interests: "Indústria, manufatura, engenharia" },
    { name: "Clientes atuais", platform: "meta", type: "custom", description: "Base de clientes ativos para upsell.", location: "Brasil" },
    { name: "Visitantes site 30 dias", platform: "meta", type: "remarketing", description: "Visitantes do site nos últimos 30 dias.", location: "Brasil" },
    { name: "Lookalike clientes", platform: "meta", type: "lookalike", description: "Semelhante aos melhores clientes (1%).", location: "Brasil" },
    { name: "Adesivo resinado — pesquisa", platform: "google", type: "keywords", description: "Palavras-chave de pesquisa para adesivo resinado.", segmentation: "adesivo resinado, chapa resinada, resinado personalizado" },
    { name: "Etiqueta personalizada — pesquisa", platform: "google", type: "keywords", description: "Palavras-chave de etiquetas personalizadas.", segmentation: "etiqueta personalizada, etiqueta adesiva, etiqueta industrial" },
    { name: "Empresas de manutenção", platform: "meta", type: "interest", description: "Empresas de manutenção industrial e predial.", location: "Sul e Sudeste", ageRange: "25-60" },
  ];
  const audiences = audienceDefs.map((a) => ({ ...a, id: id() }));
  insert(
    "Audience",
    ["id", "name", "platform", "type", "description", "location", "ageRange", "interests", "segmentation", "exclusions", "notes", "createdAt", "updatedAt"],
    audiences.map((a) => [
      sqlStr(a.id),
      sqlStr(a.name),
      sqlStr(a.platform),
      sqlStr(a.type),
      sqlStr(a.description ?? null),
      sqlStr(a.location ?? null),
      sqlStr(a.ageRange ?? null),
      sqlStr(a.interests ?? null),
      sqlStr(a.segmentation ?? null),
      "NULL",
      "NULL",
      sqlDate(new Date()),
      sqlDate(new Date()),
    ])
  );
  const [audIndustrias, audClientes, audRemarketing, audLookalike, audPesquisaResinado, audPesquisaEtiqueta, audManutencao] = audiences;

  // ---------- Landing pages ----------
  const lpResinado = { id: id(), name: "LP Adesivo Resinado", url: "https://exemplo.com.br/adesivo-resinado", productId: prAdesivoResinado.id, status: "active" };
  const lpEtiquetas = { id: id(), name: "LP Etiquetas Personalizadas", url: "https://exemplo.com.br/etiquetas", productId: prEtiquetas.id, status: "active" };
  const lpPolicarbonato = { id: id(), name: "LP Policarbonato", url: "https://exemplo.com.br/policarbonato", productId: prPolicarbonato.id, status: "draft" };
  const landingPages = [lpResinado, lpEtiquetas, lpPolicarbonato];
  insert(
    "LandingPage",
    ["id", "name", "url", "productId", "status", "notes", "createdAt"],
    landingPages.map((l) => [sqlStr(l.id), sqlStr(l.name), sqlStr(l.url), sqlStr(l.productId), sqlStr(l.status), "NULL", sqlDate(new Date())])
  );

  // ---------- Criativos ----------
  const creativeDefs = [
    { name: "Vídeo — Resinado em máquina industrial", type: "video", format: "Reels", dimensions: "1080x1920", status: "approved", driveUrl: "https://drive.google.com/drive/folders/resinado-video-01", productId: prAdesivoResinado.id },
    { name: "Aplicação em painel elétrico", type: "image", format: "Feed", dimensions: "1080x1080", status: "approved", driveUrl: "https://drive.google.com/drive/folders/resinado-img-01", productId: prAdesivoResinado.id },
    { name: "Carrossel resinado — antes e depois", type: "carousel", format: "Feed", dimensions: "1080x1080", status: "review", driveUrl: "https://drive.google.com/drive/folders/resinado-carrossel-01", productId: prAdesivoResinado.id },
    { name: "Vídeo — linha de etiquetas", type: "video", format: "Reels", dimensions: "1080x1920", status: "production", productId: prEtiquetas.id },
    { name: "Etiqueta em rolo — still", type: "image", format: "Feed", dimensions: "1080x1350", status: "approved", driveUrl: "https://drive.google.com/drive/folders/etiquetas-img-01", productId: prEtiquetas.id },
    { name: "Chapa de policarbonato — still produto", type: "image", format: "Feed", dimensions: "1080x1080", status: "idea", productId: prPolicarbonato.id },
    { name: "Depoimento cliente indústria", type: "video", format: "Stories", dimensions: "1080x1920", status: "approved", driveUrl: "https://drive.google.com/drive/folders/depoimento-01", productId: prAdesivoIndustrial.id },
  ];
  const creatives = creativeDefs.map((c) => ({ ...c, id: id() }));
  insert(
    "Creative",
    ["id", "name", "type", "format", "dimensions", "status", "driveUrl", "thumbnailUrl", "productId", "notes", "createdAt", "updatedAt"],
    creatives.map((c) => [
      sqlStr(c.id),
      sqlStr(c.name),
      sqlStr(c.type),
      sqlStr(c.format ?? null),
      sqlStr(c.dimensions ?? null),
      sqlStr(c.status),
      sqlStr(c.driveUrl ?? null),
      "NULL",
      sqlStr(c.productId ?? null),
      "NULL",
      sqlDate(new Date()),
      sqlDate(new Date()),
    ])
  );
  const [cVideoResinado, cImgPainel, cCarrossel, cVideoEtiquetas, cEtiquetaStill, cPolicarbonatoStill, cDepoimento] = creatives;

  // ---------- Campanhas ----------
  const campaignDefs = [
    { name: "Adesivo Resinado — Agosto", productId: prAdesivoResinado.id, platform: "meta", objective: "vendas", status: "rodando", startDate: daysAgo(17), endDate: inDays(12), plannedBudget: 2500, actualSpend: 1850, attendantId: barbara.id, backupAttendantId: sara.id, landingPageId: lpResinado.id, offerId: offerResinado.id, destinationChannel: "whatsapp", audiences: [audIndustrias.id, audManutencao.id, audRemarketing.id], creatives: [cVideoResinado.id, cImgPainel.id, cCarrossel.id] },
    { name: "Etiquetas — Agosto", productId: prEtiquetas.id, platform: "google", objective: "leads", status: "rodando", startDate: daysAgo(10), endDate: inDays(20), plannedBudget: 1800, actualSpend: 940, attendantId: sara.id, backupAttendantId: null, landingPageId: lpEtiquetas.id, offerId: offerEtiquetas.id, destinationChannel: "site", audiences: [audPesquisaEtiqueta.id], creatives: [cVideoEtiquetas.id, cEtiquetaStill.id] },
    { name: "Policarbonato — Setembro", productId: prPolicarbonato.id, platform: "meta", objective: "vendas", status: "pronta", startDate: inDays(13), endDate: inDays(43), plannedBudget: 2000, actualSpend: 0, attendantId: joao.id, backupAttendantId: barbara.id, landingPageId: lpPolicarbonato.id, offerId: offerPolicarbonato.id, destinationChannel: "whatsapp", audiences: [audIndustrias.id, audLookalike.id], creatives: [cPolicarbonatoStill.id] },
    { name: "Adesivo Industrial — Remarketing", productId: prAdesivoIndustrial.id, platform: "meta", objective: "remarketing", status: "rodando", startDate: daysAgo(25), endDate: inDays(5), plannedBudget: 900, actualSpend: 780, attendantId: barbara.id, backupAttendantId: null, landingPageId: null, offerId: null, destinationChannel: "whatsapp", audiences: [audRemarketing.id, audClientes.id], creatives: [cDepoimento.id] },
    { name: "Adesivo Resinado — Pesquisa Google", productId: prAdesivoResinado.id, platform: "google", objective: "vendas", status: "rodando", startDate: daysAgo(30), endDate: inDays(15), plannedBudget: 1600, actualSpend: 1420, attendantId: sara.id, backupAttendantId: joao.id, landingPageId: lpResinado.id, offerId: offerResinado.id, destinationChannel: "site", audiences: [audPesquisaResinado.id], creatives: [cVideoResinado.id] },
    { name: "Etiquetas — Reconhecimento de marca", productId: prEtiquetas.id, platform: "meta", objective: "reconhecimento", status: "producao_criativos", startDate: inDays(6), endDate: inDays(36), plannedBudget: 700, actualSpend: 0, attendantId: null, backupAttendantId: null, landingPageId: null, offerId: null, destinationChannel: "site", audiences: [audLookalike.id], creatives: [cVideoEtiquetas.id] },
    { name: "Policarbonato — Institucional", productId: prPolicarbonato.id, platform: "google", objective: "trafego", status: "planejamento", startDate: inDays(20), endDate: inDays(50), plannedBudget: 1000, actualSpend: 0, attendantId: null, backupAttendantId: null, landingPageId: null, offerId: null, destinationChannel: "site", audiences: [], creatives: [] },
    { name: "Adesivo Resinado — Julho (finalizada)", productId: prAdesivoResinado.id, platform: "meta", objective: "vendas", status: "finalizada", startDate: daysAgo(55), endDate: daysAgo(18), plannedBudget: 2200, actualSpend: 2180, attendantId: barbara.id, backupAttendantId: null, landingPageId: lpResinado.id, offerId: offerResinado.id, destinationChannel: "whatsapp", audiences: [audIndustrias.id], creatives: [cVideoResinado.id, cImgPainel.id] },
  ];
  const campaigns = campaignDefs.map((c) => ({ ...c, id: id() }));
  insert(
    "Campaign",
    ["id", "name", "productId", "platform", "objective", "status", "startDate", "endDate", "plannedBudget", "actualSpend", "attendantId", "backupAttendantId", "landingPageId", "offerId", "destinationChannel", "notes", "createdAt", "updatedAt"],
    campaigns.map((c) => [
      sqlStr(c.id),
      sqlStr(c.name),
      sqlStr(c.productId ?? null),
      sqlStr(c.platform),
      sqlStr(c.objective),
      sqlStr(c.status),
      sqlDate(c.startDate),
      sqlDate(c.endDate),
      sqlNum(c.plannedBudget),
      sqlNum(c.actualSpend),
      sqlStr(c.attendantId ?? null),
      sqlStr(c.backupAttendantId ?? null),
      sqlStr(c.landingPageId ?? null),
      sqlStr(c.offerId ?? null),
      sqlStr(c.destinationChannel ?? null),
      "NULL",
      sqlDate(new Date()),
      sqlDate(new Date()),
    ])
  );

  const campaignAudienceRows = [];
  const campaignCreativeRows = [];
  for (const c of campaigns) {
    for (const audienceId of c.audiences) campaignAudienceRows.push([sqlStr(c.id), sqlStr(audienceId)]);
    for (const creativeId of c.creatives) campaignCreativeRows.push([sqlStr(c.id), sqlStr(creativeId)]);
  }
  insert("CampaignAudience", ["campaignId", "audienceId"], campaignAudienceRows);
  insert("CampaignCreative", ["campaignId", "creativeId"], campaignCreativeRows);

  const activeCampaigns = campaigns.filter((c) => c.status === "rodando" || c.status === "finalizada");

  // ---------- Lançamentos de faturamento ----------
  const sources = ["meta_ads", "google_ads", "organic", "referral"];
  const revenueRows = [];
  for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
    const date = daysAgo(dayOffset);
    for (const attendant of attendants) {
      const entriesToday = dayOffset === 0 ? rand(3, 6) : rand(1, 5);
      for (let i = 0; i < entriesToday; i++) {
        const hour = rand(8, 19);
        const isNewLead = Math.random() > 0.15;
        const sold = Math.random() > 0.35;
        const campaign = activeCampaigns.length ? pick(activeCampaigns) : null;
        const product = pick(products);
        revenueRows.push([
          sqlStr(id()),
          sqlStr(attendant.id),
          campaign ? sqlStr(campaign.id) : "NULL",
          sqlStr(product.id),
          sqlDate(date),
          sqlNum(hour),
          sqlNum(sold ? rand(180, 2400) : 0),
          sqlNum(rand(1, 3)),
          sqlNum(sold ? rand(1, 2) : 0),
          sqlStr(isNewLead ? "new_lead" : "old_client"),
          sqlStr(campaign ? (campaign.platform === "meta" ? "meta_ads" : "google_ads") : pick(sources)),
          "NULL",
          sqlDate(new Date()),
          sqlDate(new Date()),
        ]);
      }
    }
  }
  insert(
    "RevenueEntry",
    ["id", "attendantId", "campaignId", "productId", "date", "hour", "amount", "leadsCount", "salesCount", "customerType", "source", "notes", "createdAt", "updatedAt"],
    revenueRows
  );

  // ---------- Metas ----------
  const today = daysAgo(0);
  const dailyGoalRows = attendants.map((a) => [sqlStr(id()), sqlStr(a.id), sqlDate(today), sqlNum(a.dailyGoal)]);
  insert("DailyGoal", ["id", "attendantId", "date", "amount"], dailyGoalRows);

  const monthlyGoalRows = attendants.map((a) => [sqlStr(id()), sqlStr(a.id), sqlStr(yearMonth(today)), sqlNum(a.monthlyGoal)]);
  insert("MonthlyGoal", ["id", "attendantId", "yearMonth", "amount"], monthlyGoalRows);

  insert("Setting", ["key", "value"], [[sqlStr("company_name"), sqlStr("Gidhub Ads")]]);

  const header = `-- Dados de demonstração gerados por scripts/generate-seed-sql.mjs
-- Rode DEPOIS de aplicar prisma/supabase_init.sql (a estrutura das tabelas).
-- Este script assume que as tabelas estão vazias. Se já rodou antes e quer recriar os dados,
-- apague as linhas primeiro (TRUNCATE "RevenueEntry", "DailyGoal", "MonthlyGoal", "CampaignAudience",
-- "CampaignCreative", "Campaign", "Creative", "LandingPage", "Offer", "Audience", "User", "Attendant",
-- "Product", "Setting" CASCADE;) antes de rodar de novo.

BEGIN;

`;

  const footer = `

COMMIT;
`;

  process.stdout.write(header + statements.join("\n\n") + footer);
}

main();
