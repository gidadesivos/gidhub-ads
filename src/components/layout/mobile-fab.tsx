"use client";

import { Plus } from "lucide-react";
import { RevenueEntryModal } from "@/features/revenue/RevenueEntryModal";
import { Button } from "@/components/ui/button";

export function MobileRevenueFab() {
  return (
    <div className="fixed bottom-5 right-5 z-40 md:hidden">
      <RevenueEntryModal
        trigger={
          <Button size="icon" className="h-14 w-14 rounded-full p-4 shadow-lg">
            <Plus className="h-6 w-6" />
          </Button>
        }
      />
    </div>
  );
}
