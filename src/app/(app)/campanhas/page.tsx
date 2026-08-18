import { listCampaigns } from "@/features/campaigns/queries";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { CampaignFormModal } from "@/features/campaigns/CampaignFormModal";
import { CampaignFilters } from "@/components/shared/campaign-filters";
import { CampaignCard } from "@/components/shared/campaign-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Megaphone } from "lucide-react";

export default async function CampaignsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const [campaigns, attendants, products] = await Promise.all([
    listCampaigns({
      platform: params.plataforma,
      status: params.status,
      attendantId: params.atendente,
      productId: params.produto,
      q: params.q,
    }),
    prisma.attendant.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.product.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Campanhas"
        description={`${campaigns.length} campanha(s) encontrada(s)`}
        actions={<CampaignFormModal />}
      />
      <CampaignFilters attendants={attendants} products={products} />

      {campaigns.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="Nenhuma campanha encontrada"
          description="Ajuste os filtros ou crie uma nova campanha."
          action={<CampaignFormModal />}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((c) => (
            <CampaignCard
              key={c.id}
              id={c.id}
              name={c.name}
              platform={c.platform}
              objective={c.objective}
              status={c.status}
              startDate={c.startDate}
              endDate={c.endDate}
              plannedBudget={c.plannedBudget}
              productName={c.product?.name}
              attendantName={c.attendant?.name}
              audienceNames={c.audiences.map((a) => a.audience.name)}
              creativesTotal={c.creatives.length}
              creativesApproved={c.creatives.filter((cc) => cc.creative.status === "approved").length}
            />
          ))}
        </div>
      )}
    </div>
  );
}
