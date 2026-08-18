import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { PlatformBadge } from "@/components/shared/platform-badge";
import { AudienceFormModal } from "@/features/audiences/AudienceFormModal";
import { ConfirmDeleteButton } from "@/components/shared/confirm-delete-button";
import { deleteAudience } from "@/features/audiences/actions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target } from "lucide-react";
import { AUDIENCE_TYPE_LABELS, type AudienceType, type Platform } from "@/types/enums";

export default async function AudiencesPage() {
  const audiences = await prisma.audience.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { campaigns: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Públicos" description="Biblioteca de públicos reutilizáveis nas campanhas." actions={<AudienceFormModal />} />

      {audiences.length === 0 ? (
        <EmptyState icon={Target} title="Nenhum público cadastrado" action={<AudienceFormModal />} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {audiences.map((a) => (
            <Card key={a.id} className="flex flex-col gap-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium leading-tight">{a.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{AUDIENCE_TYPE_LABELS[a.type as AudienceType]}</p>
                </div>
                <PlatformBadge platform={a.platform} />
              </div>
              {a.description && <p className="line-clamp-2 text-xs text-muted-foreground">{a.description}</p>}
              <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
                {a.location && <Badge variant="outline">{a.location}</Badge>}
                {a.ageRange && <Badge variant="outline">{a.ageRange}</Badge>}
                <Badge variant="outline">{a._count.campaigns} campanha(s)</Badge>
              </div>
              <div className="mt-auto flex items-center justify-between pt-1">
                <AudienceFormModal
                  mode="edit"
                  initial={{
                    id: a.id,
                    name: a.name,
                    platform: a.platform as Platform,
                    type: a.type as AudienceType,
                    description: a.description,
                    location: a.location,
                    ageRange: a.ageRange,
                    interests: a.interests,
                    segmentation: a.segmentation,
                    exclusions: a.exclusions,
                    notes: a.notes,
                  }}
                />
                <ConfirmDeleteButton
                  size="icon"
                  title="Excluir público"
                  description="Públicos vinculados a campanhas não podem ser removidos."
                  onConfirm={deleteAudience.bind(null, a.id)}
                />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
