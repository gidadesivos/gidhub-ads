import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { CampaignPicker } from "@/features/planning/CampaignPicker";
import { StrategyMap } from "@/features/planning/StrategyMap";
import { EmptyState } from "@/components/shared/empty-state";
import { Waypoints } from "lucide-react";

export default async function StrategyMapPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const campaigns = await prisma.campaign.findMany({
    orderBy: { startDate: "desc" },
    select: { id: true, name: true },
  });

  if (campaigns.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Mapa da Estratégia" description="Visualize o fluxo completo de uma campanha." />
        <EmptyState icon={Waypoints} title="Nenhuma campanha cadastrada" description="Crie uma campanha para visualizar seu fluxo de estratégia." />
      </div>
    );
  }

  const selectedId = params.campanha && campaigns.some((c) => c.id === params.campanha) ? params.campanha : campaigns[0].id;

  const campaign = await prisma.campaign.findUniqueOrThrow({
    where: { id: selectedId },
    include: {
      product: true,
      attendant: true,
      audiences: { include: { audience: true } },
      creatives: { include: { creative: true } },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Mapa da Estratégia"
        description="Produto → Plataforma → Público → Criativo → Atendente → Destino."
        actions={<CampaignPicker campaigns={campaigns} selectedId={selectedId!} />}
      />

      <StrategyMap
        campaign={{
          id: campaign.id,
          name: campaign.name,
          productName: campaign.product?.name ?? "",
          platform: campaign.platform,
          objective: campaign.objective,
          audienceNames: campaign.audiences.map((a) => a.audience.name),
          creativeNames: campaign.creatives.map((c) => c.creative.name),
          attendantName: campaign.attendant?.name ?? null,
          destinationChannel: campaign.destinationChannel,
        }}
      />
    </div>
  );
}
