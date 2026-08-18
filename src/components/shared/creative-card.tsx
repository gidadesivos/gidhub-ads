import { Clapperboard, Image as ImageIcon, GalleryHorizontal, FileText, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CreativeStatusBadge } from "@/components/shared/status-badge";
import { CREATIVE_TYPE_LABELS, type CreativeType } from "@/types/enums";

const TYPE_ICONS: Record<string, typeof Clapperboard> = {
  video: Clapperboard,
  image: ImageIcon,
  carousel: GalleryHorizontal,
  other: FileText,
};

export function CreativeCard({
  name,
  type,
  dimensions,
  status,
  driveUrl,
  productName,
  campaignsCount,
}: {
  name: string;
  type: string;
  dimensions?: string | null;
  status: string;
  driveUrl?: string | null;
  productName?: string | null;
  campaignsCount?: number;
}) {
  const Icon = TYPE_ICONS[type] ?? FileText;
  return (
    <Card className="flex flex-col gap-2.5 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium leading-tight">{name}</p>
            {productName && <p className="text-xs text-muted-foreground">{productName}</p>}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span>{CREATIVE_TYPE_LABELS[type as CreativeType] ?? type}</span>
        {dimensions && <span>{dimensions}</span>}
        {typeof campaignsCount === "number" && <span>{campaignsCount} campanha(s)</span>}
      </div>
      <div className="flex items-center justify-between">
        <CreativeStatusBadge status={status} />
        {driveUrl && (
          <a
            href={driveUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            Drive <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </Card>
  );
}
