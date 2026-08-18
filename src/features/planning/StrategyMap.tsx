"use client";

import { useMemo } from "react";
import ReactFlow, { Background, Controls, type Edge, type Node, MarkerType } from "reactflow";
import "reactflow/dist/style.css";
import { OBJECTIVE_LABELS, PLATFORM_LABELS, DESTINATION_CHANNEL_LABELS, type Objective, type Platform, type DestinationChannel } from "@/types/enums";

export type StrategyMapCampaign = {
  id: string;
  name: string;
  productName: string;
  platform: string;
  objective: string;
  audienceNames: string[];
  creativeNames: string[];
  attendantName: string | null;
  destinationChannel: string | null;
};

function nodeStyle(bg: string, fg = "white") {
  return {
    background: bg,
    color: fg,
    borderRadius: 10,
    padding: "10px 16px",
    fontSize: 12,
    fontWeight: 600,
    border: "none",
    textAlign: "center" as const,
    minWidth: 180,
  };
}

export function StrategyMap({ campaign }: { campaign: StrategyMapCampaign }) {
  const { nodes, edges } = useMemo(() => {
    const isMeta = campaign.platform === "meta";
    const platformColor = isMeta ? "var(--meta)" : "var(--google)";

    const steps: { id: string; label: string; color: string }[] = [
      { id: "produto", label: campaign.productName || campaign.name, color: "var(--foreground)" },
      { id: "plataforma", label: PLATFORM_LABELS[campaign.platform as Platform] ?? campaign.platform, color: platformColor },
      {
        id: "publico",
        label: campaign.audienceNames.length ? campaign.audienceNames.join(" · ") : "Público não definido",
        color: "var(--chart-3)",
      },
      {
        id: "criativos",
        label: campaign.creativeNames.length ? `${campaign.creativeNames.length} criativo(s)` : "Sem criativos",
        color: "var(--chart-4)",
      },
      { id: "atendente", label: campaign.attendantName ?? "Sem atendente", color: "var(--primary)" },
      {
        id: "destino",
        label: campaign.destinationChannel
          ? DESTINATION_CHANNEL_LABELS[campaign.destinationChannel as DestinationChannel]
          : "Destino não definido",
        color: "var(--chart-5)",
      },
      { id: "resultado", label: OBJECTIVE_LABELS[campaign.objective as Objective] ?? campaign.objective, color: "var(--success)" },
    ];

    const nodes: Node[] = steps.map((step, i) => ({
      id: step.id,
      position: { x: 40, y: i * 110 },
      data: { label: step.label },
      style: nodeStyle(step.color),
      draggable: false,
    }));

    const edges: Edge[] = steps.slice(0, -1).map((step, i) => ({
      id: `${step.id}-${steps[i + 1].id}`,
      source: step.id,
      target: steps[i + 1].id,
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: "var(--border)" },
    }));

    return { nodes, edges };
  }, [campaign]);

  return (
    <div style={{ height: 640 }} className="overflow-hidden rounded-xl border border-border bg-muted/20">
      <ReactFlow nodes={nodes} edges={edges} fitView fitViewOptions={{ padding: 0.3 }} proOptions={{ hideAttribution: true }} nodesConnectable={false}>
        <Background gap={20} color="var(--border)" />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
