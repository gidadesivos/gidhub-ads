import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { MarketingKanbanBoard } from "@/features/kanban/MarketingKanbanBoard";
import { CampaignFormModal } from "@/features/campaigns/CampaignFormModal";

export default async function MarketingKanbanPage() {
  const campaigns = await prisma.campaign.findMany({
    where: { status: { not: "pausada" } },
    include: { product: true, attendant: true, creatives: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Kanban de Marketing"
        description="Arraste os cards para atualizar o status de produção da campanha."
        actions={<CampaignFormModal />}
      />
      <MarketingKanbanBoard
        campaigns={campaigns.map((c) => ({
          id: c.id,
          name: c.name,
          platform: c.platform,
          status: c.status,
          endDate: c.endDate,
          productName: c.product?.name,
          attendantName: c.attendant?.name,
          attendantInitials: c.attendant?.initials,
          creativesTotal: c.creatives.length,
        }))}
      />
    </div>
  );
}
