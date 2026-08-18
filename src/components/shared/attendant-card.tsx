"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressMetric } from "@/components/shared/progress-metric";
import { RevenueEntryModal } from "@/features/revenue/RevenueEntryModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { formatCurrency, formatPercent } from "@/lib/format";

export function AttendantCard({
  id,
  name,
  initials,
  avatarUrl,
  leadsToday,
  salesToday,
  conversion,
  revenueToday,
  goal,
  progress,
  activeCampaigns,
  metaCount,
  googleCount,
}: {
  id: string;
  name: string;
  initials: string;
  avatarUrl?: string | null;
  leadsToday: number;
  salesToday: number;
  conversion: number;
  revenueToday: number;
  goal: number;
  progress: number;
  activeCampaigns: number;
  metaCount: number;
  googleCount: number;
}) {
  const router = useRouter();
  return (
    <Card className="flex flex-col gap-3.5 p-4">
      <div className="flex items-center justify-between">
        <Link href={`/atendentes/${id}`} className="flex items-center gap-2.5">
          <Avatar className="h-9 w-9">
            {avatarUrl && <AvatarImage src={avatarUrl} />}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <p className="font-medium hover:underline">{name}</p>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-lg font-semibold leading-tight">{leadsToday}</p>
          <p className="text-[11px] text-muted-foreground">Leads novos</p>
        </div>
        <div>
          <p className="text-lg font-semibold leading-tight">{salesToday}</p>
          <p className="text-[11px] text-muted-foreground">Vendas</p>
        </div>
        <div>
          <p className="text-lg font-semibold leading-tight">{formatPercent(conversion, 1)}</p>
          <p className="text-[11px] text-muted-foreground">Conversão</p>
        </div>
      </div>

      <div>
        <p className="text-[11px] text-muted-foreground">Faturamento novos leads</p>
        <p className="text-xl font-semibold text-primary">{formatCurrency(revenueToday)}</p>
      </div>

      <ProgressMetric
        label="Meta diária"
        percent={progress}
        currentLabel={formatCurrency(revenueToday)}
        goalLabel={formatCurrency(goal)}
      />

      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{activeCampaigns} campanhas ativas</span>
        <div className="flex gap-1.5">
          {metaCount > 0 && <Badge variant="meta">{metaCount} Meta</Badge>}
          {googleCount > 0 && <Badge variant="google">{googleCount} Google</Badge>}
        </div>
      </div>

      <RevenueEntryModal
        defaultAttendantId={id}
        onSaved={() => router.refresh()}
        trigger={
          <Button variant="outline" size="sm" className="w-full gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Lançar faturamento
          </Button>
        }
      />
    </Card>
  );
}
