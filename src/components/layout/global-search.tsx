"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

type Result = { type: string; label: string; href: string };

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    timeoutRef.current = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.results || []);
      setOpen(true);
    }, 250);
  }, [query]);

  return (
    <Popover open={open && results.length > 0} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setOpen(true)}
            placeholder="Buscar campanhas, atendentes, produtos..."
            className="h-9 pl-8"
          />
        </div>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[360px] p-1.5" onOpenAutoFocus={(e) => e.preventDefault()}>
        <div className="flex flex-col">
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => {
                router.push(r.href);
                setOpen(false);
                setQuery("");
              }}
              className="flex items-center justify-between rounded-md px-2.5 py-2 text-left text-sm hover:bg-accent"
            >
              <span className="truncate">{r.label}</span>
              <span className="ml-2 shrink-0 text-[11px] text-muted-foreground">{r.type}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
