export const PLATFORMS = ["meta", "google"] as const;
export type Platform = (typeof PLATFORMS)[number];

export const PLATFORM_LABELS: Record<Platform, string> = {
  meta: "Meta Ads",
  google: "Google Ads",
};

export const OBJECTIVES = ["vendas", "leads", "trafego", "remarketing", "reconhecimento", "outros"] as const;
export type Objective = (typeof OBJECTIVES)[number];

export const OBJECTIVE_LABELS: Record<Objective, string> = {
  vendas: "Vendas",
  leads: "Leads",
  trafego: "Tráfego",
  remarketing: "Remarketing",
  reconhecimento: "Reconhecimento",
  outros: "Outros",
};

export const CAMPAIGN_STATUSES = [
  "planejamento",
  "producao_criativos",
  "aguardando_aprovacao",
  "pronta",
  "rodando",
  "pausada",
  "finalizada",
] as const;
export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  planejamento: "Planejamento",
  producao_criativos: "Criativos em produção",
  aguardando_aprovacao: "Aguardando aprovação",
  pronta: "Pronta para rodar",
  rodando: "Rodando",
  pausada: "Pausada",
  finalizada: "Finalizada",
};

export const CAMPAIGN_STATUS_COLORS: Record<CampaignStatus, string> = {
  planejamento: "muted",
  producao_criativos: "warning",
  aguardando_aprovacao: "warning",
  pronta: "success",
  rodando: "success",
  pausada: "destructive",
  finalizada: "secondary",
};

export const DESTINATION_CHANNELS = ["whatsapp", "site", "loja", "outro"] as const;
export type DestinationChannel = (typeof DESTINATION_CHANNELS)[number];

export const DESTINATION_CHANNEL_LABELS: Record<DestinationChannel, string> = {
  whatsapp: "WhatsApp",
  site: "Site",
  loja: "Loja física",
  outro: "Outro",
};

export const AUDIENCE_TYPES = ["interest", "custom", "remarketing", "lookalike", "search", "keywords", "other"] as const;
export type AudienceType = (typeof AUDIENCE_TYPES)[number];

export const AUDIENCE_TYPE_LABELS: Record<AudienceType, string> = {
  interest: "Interesse",
  custom: "Personalizado",
  remarketing: "Remarketing",
  lookalike: "Lookalike / Semelhante",
  search: "Pesquisa",
  keywords: "Palavras-chave",
  other: "Outro",
};

export const CREATIVE_TYPES = ["video", "image", "carousel", "other"] as const;
export type CreativeType = (typeof CREATIVE_TYPES)[number];

export const CREATIVE_TYPE_LABELS: Record<CreativeType, string> = {
  video: "Vídeo",
  image: "Imagem",
  carousel: "Carrossel",
  other: "Outro",
};

export const CREATIVE_STATUSES = ["idea", "production", "review", "approved", "archived"] as const;
export type CreativeStatus = (typeof CREATIVE_STATUSES)[number];

export const CREATIVE_STATUS_LABELS: Record<CreativeStatus, string> = {
  idea: "Ideia",
  production: "Em produção",
  review: "Aguardando aprovação",
  approved: "Aprovado",
  archived: "Arquivado",
};

export const CREATIVE_STATUS_COLORS: Record<CreativeStatus, string> = {
  idea: "muted",
  production: "warning",
  review: "warning",
  approved: "success",
  archived: "secondary",
};

export const CUSTOMER_TYPES = ["new_lead", "old_client"] as const;
export type CustomerType = (typeof CUSTOMER_TYPES)[number];

export const CUSTOMER_TYPE_LABELS: Record<CustomerType, string> = {
  new_lead: "Lead novo",
  old_client: "Cliente antigo",
};

export const REVENUE_SOURCES = ["meta_ads", "google_ads", "organic", "referral", "other"] as const;
export type RevenueSource = (typeof REVENUE_SOURCES)[number];

export const REVENUE_SOURCE_LABELS: Record<RevenueSource, string> = {
  meta_ads: "Meta Ads",
  google_ads: "Google Ads",
  organic: "Orgânico",
  referral: "Indicação",
  other: "Outro",
};

export const ATTENDANT_STATUSES = ["active", "vacation", "inactive"] as const;
export type AttendantStatus = (typeof ATTENDANT_STATUSES)[number];

export const ATTENDANT_STATUS_LABELS: Record<AttendantStatus, string> = {
  active: "Ativo",
  vacation: "Férias",
  inactive: "Inativo",
};

export const LANDING_PAGE_STATUSES = ["active", "draft", "archived"] as const;
export type LandingPageStatus = (typeof LANDING_PAGE_STATUSES)[number];

export const LANDING_PAGE_STATUS_LABELS: Record<LandingPageStatus, string> = {
  active: "Ativa",
  draft: "Rascunho",
  archived: "Arquivada",
};

export const USER_ROLES = ["ADMIN", "ATTENDANT"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const KANBAN_MARKETING_COLUMNS = [
  "planejamento",
  "producao_criativos",
  "aguardando_aprovacao",
  "pronta",
  "rodando",
  "finalizada",
] as const satisfies readonly CampaignStatus[];

export const KANBAN_COMERCIAL_COLUMNS = [
  "campanha_ativa",
  "leads_chegando",
  "atendimento",
  "negociacao",
  "venda",
] as const;
export type KanbanComercialColumn = (typeof KANBAN_COMERCIAL_COLUMNS)[number];

export const KANBAN_COMERCIAL_LABELS: Record<KanbanComercialColumn, string> = {
  campanha_ativa: "Campanha ativa",
  leads_chegando: "Leads chegando",
  atendimento: "Atendimento",
  negociacao: "Negociação",
  venda: "Venda",
};
