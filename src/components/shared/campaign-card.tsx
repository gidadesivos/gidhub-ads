import Link from "next/link";
import { Users, Clapperboard, Wallet, CalendarRange } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PlatformBadge } from "@/components/shared/platform-badge";
import { CampaignStatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatCurrency, formatDate } from "@/lib/format";
import { OBJECTIVE_LABELS, type Objective } from "@/types/enums";

type CampaignCardProps = {
  id: string;
  name: string;
  platform: string;
  objective: string;
  status: string;
  startDate: Date | string;
  endDate: Date | string;
  plannedBudget: number;
  productName?: string | null;
  attendantName?: string | null;
  audienceNames?: string[];
  creativesTotal?: number;
  creativesApproved?: number;
};

export function CampaignCard(props: CampaignCardProps) {
  const {
    id,
    name,
    platform,
    objective,
    status,
    startDate,
    endDate,
    plannedBudget,
    productName,
    attendantName,
    audienceNames = [],
    creativesTotal,
    creativesApproved,
  } = props;

  return (
    <Link href={`/campanhas/${id}`}>
      <Card className="flex h-full flex-col gap-3 p-4 transition-shadow hover:shadow-md">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold leading-tight">{name}</p>
            {productName && <p className="text-xs text-muted-foreground">{productName}</p>}
          </div>
          <PlatformBadge platform={platform} />
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            🎯 {OBJECTIVE_LABELS[objective as Objective] ?? objective}
          </span>
          {audienceNames.length > 0 && (
            <span className="inline-flex items-center gap-1 truncate">
              <Users className="h-3 w-3" /> {audienceNames[0]}
              {audienceNames.length > 1 ? ` +${audienceNames.length - 1}` : ""}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Avatar className="h-4 w-4">
              <AvatarFallback className="text-[8px]">{attendantName ? attendantName.slice(0, 2).toUpperCase() : "--"}</AvatarFallback>
            </Avatar>
            {attendantName ?? "Sem atendente"}
          </div>
          {typeof creativesTotal === "number" && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clapperboard className="h-3.5 w-3.5" />
              {creativesApproved ?? 0}/{creativesTotal} prontos
            </div>
          )}
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Wallet className="h-3.5 w-3.5" />
            {formatCurrency(plannedBudget)}
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <CalendarRange className="h-3.5 w-3.5" />
            {formatDate(startDate)} → {formatDate(endDate)}
          </div>
        </div>

        <div className="mt-auto pt-1">
          <CampaignStatusBadge status={status} />
        </div>
      </Card>
    </Link>
  );
}
