import { cn } from "@/lib/utils";
import { PLATFORM_LABELS, type Platform } from "@/types/enums";

export function PlatformBadge({ platform, className }: { platform: string; className?: string }) {
  const label = PLATFORM_LABELS[platform as Platform] ?? platform;
  const isMeta = platform === "meta";
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium",
        isMeta ? "bg-meta/15 text-meta" : "bg-google/15 text-google",
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", isMeta ? "bg-meta" : "bg-google")} />
      {label}
    </span>
  );
}
