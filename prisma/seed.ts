import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function daysAgo(n: number) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}

function inDays(n: number) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + n);
  return d;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function yearMonth(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

async function main() {
  console.log("Limpando dados existentes...");
  await prisma.revenueEntry.deleteMany();
  await prisma.dailyGoal.deleteMany();
  await prisma.monthlyGoal.deleteMany();
  await prisma.campaignAudience.deleteMany();
  await prisma.campaignCreative.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.creative.deleteMany();
  await prisma.landingPage.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.audience.deleteMany();
  await prisma.user.deleteMany();
  await prisma.attendant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.setting.deleteMany();

  console.log("Criando atendentes...");
  const barbara = await prisma.attendant.create({
    data: { name: "Bárbara Souza", initials: "BS", status: "active", dailyGoal: 5000, monthlyGoal: 110000, leadCapacity: 150 },
  });
  const sara = await prisma.attendant.create({
    data: { name: "Sara Lima", initials: "SL", status: "active", dailyGoal: 4500, monthlyGoal: 95000, leadCapacity: 280 },
  });
  const joao = await prisma.attendant.create({
    data: { name: "João Pedro", initials: "JP", status: "active", dailyGoal: 3200, monthlyGoal: 70000, leadCapacity: 80 },
  });
  const attendants = [barbara, sara, joao];

  console.log("Criando usuários...");
  const adminHash = await bcrypt.hash("admin123", 10);
  const attHash = await bcrypt.hash("atendente123", 10);
  await prisma.user.create({
    data: { email: "admin@gidhub.com.br", passwordHash: adminHash, name: "Administrador", role: "ADMIN" },
  });
  await prisma.user.create({
    data: { email: "barbara@gidhub.com.br", passwordHash: attHash, name: "Bárbara Souza", role: "ATTENDANT", attendantId: barbara.id },
  });
  await prisma.user.create({
    data: { email: "sara@gidhub.com.br", passwordHash: attHash, name: "Sara Lima", role: "ATTENDANT", attendantId: sara.id },
  });

  console.log("Criando produtos e ofertas...");
  const productData = [
    { name: "Adesivo Resinado", category: "Adesivos", description: "Adesivos resinados personalizados com alto brilho e durabilidade." },
    { name: "Etiquetas Personalizadas", category: "Etiquetas", description: "Etiquetas sob medida para indústria e comércio." },
    { name: "Adesivo Industrial", category: "Adesivos", description: "Adesivos para identificação de máquinas e painéis elétricos." },
    { name: "Policarbonato", category: "Chapas", description: "Chapas e placas de policarbonato para sinalização e proteção." },
    { name: "Banner", category: "Impressos", description: "Banners promocionais em lona." },
    { name: "Lacre", category: "Segurança", description: "Lacres de segurança personalizados." },
  ];
  const products = [];
  for (const p of productData) {
    products.push(await prisma.product.create({ data: { ...p, active: true } }));
  }
  const [prAdesivoResinado, prEtiquetas, prAdesivoIndustrial, prPolicarbonato] = products;

  const offerResinado = await prisma.offer.create({
    data: { name: "Combo Resinado 3x2", productId: prAdesivoResinado.id, description: "Leve 3 chapas e pague 2.", cta: "Peça um orçamento" },
  });
  const offerEtiquetas = await prisma.offer.create({
    data: { name: "Etiquetas em lote", productId: prEtiquetas.id, description: "Desconto progressivo por volume.", cta: "Simule seu pedido" },
  });
  const offerPolicarbonato = await prisma.offer.create({
    data: { name: "Policarbonato sob medida", productId: prPolicarbonato.id, description: "Corte sob medida com entrega em 5 dias.", cta: "Solicite amostra" },
  });

  console.log("Criando públicos...");
  const audienceData = [
    { name: "Indústrias", platform: "meta", type: "interest", description: "Donos e compradores de indústrias de médio porte.", location: "SP, PR, SC", ageRange: "28-55", interests: "Indústria, manufatura, engenharia" },
    { name: "Clientes atuais", platform: "meta", type: "custom", description: "Base de clientes ativos para upsell.", location: "Brasil" },
    { name: "Visitantes site 30 dias", platform: "meta", type: "remarketing", description: "Visitantes do site nos últimos 30 dias.", location: "Brasil" },
    { name: "Lookalike clientes", platform: "meta", type: "lookalike", description: "Semelhante aos melhores clientes (1%).", location: "Brasil" },
    { name: "Adesivo resinado — pesquisa", platform: "google", type: "keywords", description: "Palavras-chave de pesquisa para adesivo resinado.", segmentation: "adesivo resinado, chapa resinada, resinado personalizado" },
    { name: "Etiqueta personalizada — pesquisa", platform: "google", type: "keywords", description: "Palavras-chave de etiquetas personalizadas.", segmentation: "etiqueta personalizada, etiqueta adesiva, etiqueta industrial" },
    { name: "Empresas de manutenção", platform: "meta", type: "interest", description: "Empresas de manutenção industrial e predial.", location: "Sul e Sudeste", ageRange: "25-60" },
  ];
  const audiences = [];
  for (const a of audienceData) {
    audiences.push(await prisma.audience.create({ data: a }));
  }
  const [audIndustrias, audClientes, audRemarketing, audLookalike, audPesquisaResinado, audPesquisaEtiqueta, audManutencao] = audiences;

  console.log("Criando landing pages...");
  const lpResinado = await prisma.landingPage.create({
    data: { name: "LP Adesivo Resinado", url: "https://exemplo.com.br/adesivo-resinado", productId: prAdesivoResinado.id, status: "active" },
  });
  const lpEtiquetas = await prisma.landingPage.create({
    data: { name: "LP Etiquetas Personalizadas", url: "https://exemplo.com.br/etiquetas", productId: prEtiquetas.id, status: "active" },
  });
  const lpPolicarbonato = await prisma.landingPage.create({
    data: { name: "LP Policarbonato", url: "https://exemplo.com.br/policarbonato", productId: prPolicarbonato.id, status: "draft" },
  });

  console.log("Criando criativos...");
  const creativeData = [
    { name: "Vídeo — Resinado em máquina industrial", type: "video", format: "Reels", dimensions: "1080x1920", status: "approved", driveUrl: "https://drive.google.com/drive/folders/resinado-video-01", productId: prAdesivoResinado.id },
    { name: "Aplicação em painel elétrico", type: "image", format: "Feed", dimensions: "1080x1080", status: "approved", driveUrl: "https://drive.google.com/drive/folders/resinado-img-01", productId: prAdesivoResinado.id },
    { name: "Carrossel resinado — antes e depois", type: "carousel", format: "Feed", dimensions: "1080x1080", status: "review", driveUrl: "https://drive.google.com/drive/folders/resinado-carrossel-01", productId: prAdesivoResinado.id },
    { name: "Vídeo — linha de etiquetas", type: "video", format: "Reels", dimensions: "1080x1920", status: "production", productId: prEtiquetas.id },
    { name: "Etiqueta em rolo — still", type: "image", format: "Feed", dimensions: "1080x1350", status: "approved", driveUrl: "https://drive.google.com/drive/folders/etiquetas-img-01", productId: prEtiquetas.id },
    { name: "Chapa de policarbonato — still produto", type: "image", format: "Feed", dimensions: "1080x1080", status: "idea", productId: prPolicarbonato.id },
    { name: "Depoimento cliente indústria", type: "video", format: "Stories", dimensions: "1080x1920", status: "approved", driveUrl: "https://drive.google.com/drive/folders/depoimento-01", productId: prAdesivoIndustrial.id },
  ];
  const creatives = [];
  for (const c of creativeData) {
    creatives.push(await prisma.creative.create({ data: c }));
  }
  const [cVideoResinado, cImgPainel, cCarrossel, cVideoEtiquetas, cEtiquetaStill, cPolicarbonatoStill, cDepoimento] = creatives;

  console.log("Criando campanhas...");
  const campaignsSeed = [
    {
      name: "Adesivo Resinado — Agosto",
      productId: prAdesivoResinado.id,
      platform: "meta",
      objective: "vendas",
      status: "rodando",
      startDate: daysAgo(17),
      endDate: inDays(12),
      plannedBudget: 2500,
      actualSpend: 1850,
      attendantId: barbara.id,
      backupAttendantId: sara.id,
      landingPageId: lpResinado.id,
      offerId: offerResinado.id,
      destinationChannel: "whatsapp",
      audiences: [audIndustrias.id, audManutencao.id, audRemarketing.id],
      creatives: [cVideoResinado.id, cImgPainel.id, cCarrossel.id],
    },
    {
      name: "Etiquetas — Agosto",
      productId: prEtiquetas.id,
      platform: "google",
      objective: "leads",
      status: "rodando",
      startDate: daysAgo(10),
      endDate: inDays(20),
      plannedBudget: 1800,
      actualSpend: 940,
      attendantId: sara.id,
      landingPageId: lpEtiquetas.id,
      offerId: offerEtiquetas.id,
      destinationChannel: "site",
      audiences: [audPesquisaEtiqueta.id],
      creatives: [cVideoEtiquetas.id, cEtiquetaStill.id],
    },
    {
      name: "Policarbonato — Setembro",
      productId: prPolicarbonato.id,
      platform: "meta",
      objective: "vendas",
      status: "pronta",
      startDate: inDays(13),
      endDate: inDays(43),
      plannedBudget: 2000,
      actualSpend: 0,
      attendantId: joao.id,
      backupAttendantId: barbara.id,
      landingPageId: lpPolicarbonato.id,
      offerId: offerPolicarbonato.id,
      destinationChannel: "whatsapp",
      audiences: [audIndustrias.id, audLookalike.id],
      creatives: [cPolicarbonatoStill.id],
    },
    {
      name: "Adesivo Industrial — Remarketing",
      productId: prAdesivoIndustrial.id,
      platform: "meta",
      objective: "remarketing",
      status: "rodando",
      startDate: daysAgo(25),
      endDate: inDays(5),
      plannedBudget: 900,
      actualSpend: 780,
      attendantId: barbara.id,
      destinationChannel: "whatsapp",
      audiences: [audRemarketing.id, audClientes.id],
      creatives: [cDepoimento.id],
    },
    {
      name: "Adesivo Resinado — Pesquisa Google",
      productId: prAdesivoResinado.id,
      platform: "google",
      objective: "vendas",
      status: "rodando",
      startDate: daysAgo(30),
      endDate: inDays(15),
      plannedBudget: 1600,
      actualSpend: 1420,
      attendantId: sara.id,
      backupAttendantId: joao.id,
      landingPageId: lpResinado.id,
      offerId: offerResinado.id,
      destinationChannel: "site",
      audiences: [audPesquisaResinado.id],
      creatives: [cVideoResinado.id],
    },
    {
      name: "Etiquetas — Reconhecimento de marca",
      productId: prEtiquetas.id,
      platform: "meta",
      objective: "reconhecimento",
      status: "producao_criativos",
      startDate: inDays(6),
      endDate: inDays(36),
      plannedBudget: 700,
      actualSpend: 0,
      attendantId: null,
      destinationChannel: "site",
      audiences: [audLookalike.id],
      creatives: [cVideoEtiquetas.id],
    },
    {
      name: "Policarbonato — Institucional",
      productId: prPolicarbonato.id,
      platform: "google",
      objective: "trafego",
      status: "planejamento",
      startDate: inDays(20),
      endDate: inDays(50),
      plannedBudget: 1000,
      actualSpend: 0,
      attendantId: null,
      destinationChannel: "site",
      audiences: [],
      creatives: [],
    },
    {
      name: "Adesivo Resinado — Julho (finalizada)",
      productId: prAdesivoResinado.id,
      platform: "meta",
      objective: "vendas",
      status: "finalizada",
      startDate: daysAgo(55),
      endDate: daysAgo(18),
      plannedBudget: 2200,
      actualSpend: 2180,
      attendantId: barbara.id,
      landingPageId: lpResinado.id,
      offerId: offerResinado.id,
      destinationChannel: "whatsapp",
      audiences: [audIndustrias.id],
      creatives: [cVideoResinado.id, cImgPainel.id],
    },
  ];

  const campaigns = [];
  for (const c of campaignsSeed) {
    const { audiences: audIds, creatives: creaIds, ...data } = c;
    const campaign = await prisma.campaign.create({ data });
    for (const audienceId of audIds) {
      await prisma.campaignAudience.create({ data: { campaignId: campaign.id, audienceId } });
    }
    for (const creativeId of creaIds) {
      await prisma.campaignCreative.create({ data: { campaignId: campaign.id, creativeId } });
    }
    campaigns.push(campaign);
  }

  const activeCampaigns = campaigns.filter((c) => c.status === "rodando" || c.status === "finalizada");

  console.log("Criando lançamentos de faturamento...");
  const sources = ["meta_ads", "google_ads", "organic", "referral"];
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
        await prisma.revenueEntry.create({
          data: {
            attendantId: attendant.id,
            campaignId: campaign?.id ?? null,
            productId: product.id,
            date,
            hour,
            amount: sold ? rand(180, 2400) : 0,
            leadsCount: rand(1, 3),
            salesCount: sold ? rand(1, 2) : 0,
            customerType: isNewLead ? "new_lead" : "old_client",
            source: campaign ? (campaign.platform === "meta" ? "meta_ads" : "google_ads") : pick(sources),
            notes: null,
          },
        });
      }
    }
  }

  console.log("Criando metas...");
  const today = daysAgo(0);
  for (const attendant of attendants) {
    await prisma.dailyGoal.upsert({
      where: { attendantId_date: { attendantId: attendant.id, date: today } },
      update: { amount: attendant.dailyGoal },
      create: { attendantId: attendant.id, date: today, amount: attendant.dailyGoal },
    });
    await prisma.monthlyGoal.upsert({
      where: { attendantId_yearMonth: { attendantId: attendant.id, yearMonth: yearMonth(today) } },
      update: { amount: attendant.monthlyGoal },
      create: { attendantId: attendant.id, yearMonth: yearMonth(today), amount: attendant.monthlyGoal },
    });
  }

  await prisma.setting.create({ data: { key: "company_name", value: "Gidhub Ads" } });

  console.log("Seed concluído.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
