"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRangeFilter } from "@/components/shared/date-range-filter";
import { PLATFORM_LABELS, PLATFORMS, REVENUE_SOURCE_LABELS, REVENUE_SOURCES } from "@/types/enums";

type Options = {
  attendants: { id: string; name: string }[];
  campaigns: { id: string; name: string }[];
  products: { id: string; name: string }[];
};

export function ReportFilters({ options }: { options: Options }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "all") params.delete(key);
    else params.set(key, value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <DateRangeFilter />
      <Select value={searchParams.get("atendente") ?? "all"} onValueChange={(v) => setParam("atendente", v)}>
        <SelectTrigger className="h-9 w-40">
          <SelectValue placeholder="Atendente" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos atendentes</SelectItem>
          {options.attendants.map((a) => (
            <SelectItem key={a.id} value={a.id}>
              {a.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={searchParams.get("campanha") ?? "all"} onValueChange={(v) => setParam("campanha", v)}>
        <SelectTrigger className="h-9 w-44">
          <SelectValue placeholder="Campanha" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas campanhas</SelectItem>
          {options.campaigns.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={searchParams.get("produto") ?? "all"} onValueChange={(v) => setParam("produto", v)}>
        <SelectTrigger className="h-9 w-40">
          <SelectValue placeholder="Produto" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos produtos</SelectItem>
          {options.products.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={searchParams.get("plataforma") ?? "all"} onValueChange={(v) => setParam("plataforma", v)}>
        <SelectTrigger className="h-9 w-36">
          <SelectValue placeholder="Plataforma" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas plataformas</SelectItem>
          {PLATFORMS.map((p) => (
            <SelectItem key={p} value={p}>
              {PLATFORM_LABELS[p]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={searchParams.get("origem") ?? "all"} onValueChange={(v) => setParam("origem", v)}>
        <SelectTrigger className="h-9 w-36">
          <SelectValue placeholder="Origem" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas origens</SelectItem>
          {REVENUE_SOURCES.map((s) => (
            <SelectItem key={s} value={s}>
              {REVENUE_SOURCE_LABELS[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
