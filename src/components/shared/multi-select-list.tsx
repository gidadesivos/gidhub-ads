"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export function MultiSelectList({
  options,
  value,
  onChange,
  emptyLabel = "Nada cadastrado ainda.",
}: {
  options: { id: string; label: string; sublabel?: string }[];
  value: string[];
  onChange: (next: string[]) => void;
  emptyLabel?: string;
}) {
  if (options.length === 0) {
    return <p className="rounded-md border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">{emptyLabel}</p>;
  }

  function toggle(id: string) {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  }

  return (
    <div className="flex max-h-48 flex-col gap-0.5 overflow-y-auto rounded-lg border border-border p-1.5">
      {options.map((opt) => {
        const checked = value.includes(opt.id);
        return (
          <label
            key={opt.id}
            className={cn(
              "flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm hover:bg-accent",
              checked && "bg-accent/60"
            )}
          >
            <Checkbox checked={checked} onCheckedChange={() => toggle(opt.id)} />
            <span className="flex-1 truncate">{opt.label}</span>
            {opt.sublabel && <span className="text-xs text-muted-foreground">{opt.sublabel}</span>}
          </label>
        );
      })}
    </div>
  );
}
