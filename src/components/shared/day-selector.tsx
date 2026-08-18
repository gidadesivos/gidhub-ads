"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { todayISODate } from "@/lib/format";

export function DaySelector({ paramKey = "date" }: { paramKey?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const value = searchParams.get(paramKey) || todayISODate();

  return (
    <Input
      type="date"
      value={value}
      onChange={(e) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set(paramKey, e.target.value);
        router.push(`${pathname}?${params.toString()}`);
      }}
      className="h-9 w-40"
    />
  );
}
