"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ChevronDown, Megaphone } from "lucide-react";
import { NAV_SECTIONS } from "@/lib/nav-config";
import { cn } from "@/lib/utils";

function isChildActive(childHref: string, pathname: string, search: string) {
  const [childPath, childQuery] = childHref.split("?");
  if (childPath !== pathname) return false;
  if (!childQuery) return !search;
  return search === childQuery;
}

function isParentActive(item: { href: string; children?: { href: string }[] }, pathname: string) {
  const basePath = item.href.split("?")[0];
  if (item.children) {
    return item.children.some((c) => c.href.split("?")[0] === pathname) && pathname === basePath;
  }
  return pathname === basePath;
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const section of NAV_SECTIONS) {
      for (const item of section.items) {
        if (item.children?.some((c) => c.href.split("?")[0] === pathname)) {
          initial[item.label] = true;
        }
      }
    }
    return initial;
  });

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Megaphone className="h-4 w-4" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold">Central de Marketing</p>
          <p className="text-[11px] text-muted-foreground">Campanhas &amp; Faturamento</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-6">
        {NAV_SECTIONS.map((section, si) => (
          <div key={si} className="mb-1 mt-3 first:mt-0">
            {section.title && (
              <p className="px-2.5 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70">
                {section.title}
              </p>
            )}
            <ul className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isParentActive(item, pathname) && !item.children;
                const parentHighlighted = item.children?.some((c) => c.href.split("?")[0] === pathname) ?? false;
                const open = openGroups[item.label] ?? parentHighlighted;

                return (
                  <li key={item.label}>
                    {item.children ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setOpenGroups((p) => ({ ...p, [item.label]: !open }))}
                          className={cn(
                            "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                            parentHighlighted ? "text-foreground" : "text-muted-foreground"
                          )}
                        >
                          {Icon && <Icon className="h-4 w-4 shrink-0" />}
                          <span className="flex-1 text-left">{item.label}</span>
                          <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 transition-transform", open && "rotate-180")} />
                        </button>
                        {open && (
                          <ul className="ml-[26px] mt-0.5 flex flex-col gap-0.5 border-l border-border pl-3">
                            {item.children.map((child) => {
                              const childActive = isChildActive(child.href, pathname, search);
                              return (
                                <li key={child.href}>
                                  <Link
                                    href={child.href}
                                    onClick={onNavigate}
                                    className={cn(
                                      "block rounded-md px-2.5 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                                      childActive ? "bg-accent font-medium text-foreground" : "text-muted-foreground"
                                    )}
                                  >
                                    {child.label}
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        className={cn(
                          "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                          active ? "bg-primary/10 text-primary" : "text-muted-foreground"
                        )}
                      >
                        {Icon && <Icon className="h-4 w-4 shrink-0" />}
                        {item.label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );
}
