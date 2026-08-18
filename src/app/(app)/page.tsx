import Link from "next/link";
import { Wallet, Megaphone, PlayCircle, Clapperboard, Users, ShoppingCart, TrendingUp, Gauge, ArrowRight } from "lucide-react";
import { getDashboardData } from "@/features/dashboard/queries";
import { getSession } from "@/lib/auth";
import { MetricCard } from "@/components/shared/metric-card";
import { AttendantCard } from "@/components/shared/attendant-card";
import { CampaignCard } from "@/components/shared/campaign-card";
import { CreativeCard } from "@/components/shared/creative-card";
import { DateRangeFilter } from "@/components/shared/date-range-filter";
import { RevenueHourlyChart } from "@/components/shared/revenue-hourly-chart";
import { EmptyState } from "@/components/shared/empty-state";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatPercent, formatMultiplier, formatNumber } from "@/lib/format";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const session = await getSession();
  const data = await getDashboardData(params.period, params.from, params.to);
  const { metrics } = data;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {greeting()}, {session?.name.split(" ")[0]}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Aqui está o panorama de campanhas, atendimento e faturamento.
          </p>
        </div>
        <DateRangeFilter />
      </div>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <MetricCard label="Investimento previsto (mês)" value={formatCurrency(metrics.investmentPlanned)} icon={Wallet} />
        <MetricCard label="Campanhas planejadas" value={formatNumber(metrics.plannedCount)} icon={Megaphone} />
        <MetricCard label="Campanhas rodando" value={formatNumber(metrics.runningCount)} icon={PlayCircle} accent="success" />
        <MetricCard
          label="Criativos"
          value={`${metrics.creativesReady}/${metrics.creativesReady + metrics.creativesNeeded}`}
          hint="prontos"
          icon={Clapperboard}
        />
        <MetricCard label="Leads novos" value={formatNumber(metrics.leads)} icon={Users} />
        <MetricCard label="Vendas" value={formatNumber(metrics.sales)} icon={ShoppingCart} accent="success" />
        <MetricCard label="Faturamento leads novos" value={formatCurrency(metrics.revenue)} icon={TrendingUp} accent="success" />
        <MetricCard label="Conversão" value={formatPercent(metrics.conversion)} icon={Gauge} />
        <MetricCard label="ROAS geral" value={formatMultiplier(metrics.roas)} icon={TrendingUp} accent="success" />
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">Faturamento hoje por atendente</h2>
          <Link href="/faturamento/por-atendente" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
            Ver tudo <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {data.attendantCards.length === 0 ? (
          <EmptyState title="Nenhum atendente cadastrado" />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.attendantCards.map((a) => (
              <AttendantCard key={a.id} {...a} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-base font-semibold">Faturamento por hora — hoje</h2>
        <Card className="p-4">
          <RevenueHourlyChart data={data.hourlyChart} />
        </Card>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">Campanhas rodando</h2>
          <Link href="/campanhas" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
            Ver todas <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {data.runningCampaigns.length === 0 ? (
          <EmptyState title="Nenhuma campanha rodando no momento" />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.runningCampaigns.map((c) => (
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
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">Próximas campanhas</h2>
          <Link href="/planejamento/roadmap" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
            Ver roadmap <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {data.upcomingCampaigns.length === 0 ? (
          <EmptyState title="Nenhuma campanha futura planejada" />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.upcomingCampaigns.map((c) => (
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
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">Criativos pendentes</h2>
          <Link href="/criativos" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
            Ver biblioteca <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {data.pendingCreatives.length === 0 ? (
          <EmptyState title="Nenhum criativo pendente" description="Todos os criativos estão aprovados ou arquivados." />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.pendingCreatives.map((c) => (
              <CreativeCard
                key={c.id}
                name={c.name}
                type={c.type}
                dimensions={c.dimensions}
                status={c.status}
                driveUrl={c.driveUrl}
                productName={c.product?.name}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
