import { Badge } from "@/components/ui/badge";
import {
  CAMPAIGN_STATUS_LABELS,
  CAMPAIGN_STATUS_COLORS,
  CREATIVE_STATUS_LABELS,
  CREATIVE_STATUS_COLORS,
  type CampaignStatus,
  type CreativeStatus,
} from "@/types/enums";
import type { BadgeProps } from "@/components/ui/badge";

export function CampaignStatusBadge({ status }: { status: string }) {
  const label = CAMPAIGN_STATUS_LABELS[status as CampaignStatus] ?? status;
  const variant = (CAMPAIGN_STATUS_COLORS[status as CampaignStatus] ?? "muted") as BadgeProps["variant"];
  return <Badge variant={variant}>{label}</Badge>;
}

export function CreativeStatusBadge({ status }: { status: string }) {
  const label = CREATIVE_STATUS_LABELS[status as CreativeStatus] ?? status;
  const variant = (CREATIVE_STATUS_COLORS[status as CreativeStatus] ?? "muted") as BadgeProps["variant"];
  return <Badge variant={variant}>{label}</Badge>;
}
