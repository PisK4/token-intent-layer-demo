"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { buildSankeyData } from "@/lib/data/sankey-data";
import { TOKEN_MAP, ASSET_CLASS_META } from "@/lib/data/tokens";
import { CHAIN_MAP } from "@/lib/data/chains";
import { RAIL_META } from "@/lib/data/rails";
import type { Direction } from "@/lib/types";

const ReactECharts = dynamic(() => import("echarts-for-react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[480px] w-full items-center justify-center">
      <div className="text-sm text-muted">Loading Sankey...</div>
    </div>
  ),
});

interface Props {
  direction: Direction;
  highlightTokenSymbol?: string;
  highlightChainId?: string;
  highlightVersion?: number;
}

export default function SankeyDiagram({
  direction,
  highlightTokenSymbol,
  highlightChainId,
  highlightVersion,
}: Props) {
  const option = useMemo(() => {
    // highlightVersion is a trigger-only dep to re-apply highlight animation on Preview click
    void highlightVersion;
    const { nodes, links } = buildSankeyData(direction);

    const highlightSet = new Set<string>();
    if (highlightTokenSymbol && highlightChainId) {
      const token = TOKEN_MAP[highlightTokenSymbol];
      const chain = CHAIN_MAP[highlightChainId];
      if (token && chain && token.chains.includes(highlightChainId)) {
        const assetLabel = ASSET_CLASS_META[token.assetClass].label;
        const railLabel = RAIL_META[token.rails[0]].label;
        const ledger =
          token.finalAccount === "USDC"
            ? "USDC @ EdgeX"
            : token.finalAccount === "ETH"
              ? "ETH @ EdgeX"
              : "Token-as-is @ EdgeX";
        highlightSet.add(chain.name);
        highlightSet.add(assetLabel);
        highlightSet.add(railLabel);
        highlightSet.add(ledger);
      }
    }

    const highlightedLinks = links.map((link) => {
      const onPath =
        highlightSet.has(link.source) && highlightSet.has(link.target);
      return {
        ...link,
        lineStyle: {
          color: link.lineStyle?.color ?? "#94A3B8",
          opacity: onPath ? 0.95 : highlightSet.size > 0 ? 0.08 : 0.35,
        },
      };
    });

    const highlightedNodes = nodes.map((n) => {
      const on = highlightSet.has(n.name);
      return {
        ...n,
        itemStyle: {
          ...n.itemStyle,
          opacity: highlightSet.size > 0 && !on ? 0.25 : 1,
          borderColor: on ? "#22C55E" : "transparent",
          borderWidth: on ? 2 : 0,
        },
        label: {
          color: on ? "#F8FAFC" : "#CBD5E1",
          fontWeight: on ? 700 : 500,
        },
      };
    });

    return {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "item",
        triggerOn: "mousemove",
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        borderColor: "#334155",
        borderWidth: 1,
        padding: 10,
        textStyle: {
          color: "#F8FAFC",
          fontSize: 12,
        },
        formatter: (params: { dataType: string; data: { source?: string; target?: string; value?: number; name?: string }; name?: string }) => {
          if (params.dataType === "edge") {
            return `<div style="font-weight:600;color:#22C55E;">${params.data.source} → ${params.data.target}</div><div style="color:#94A3B8;margin-top:4px;">flow weight: ${params.data.value}</div>`;
          }
          return `<div style="font-weight:600">${params.name}</div>`;
        },
      },
      series: [
        {
          type: "sankey",
          left: 12,
          right: 140,
          top: 20,
          bottom: 20,
          nodeWidth: 14,
          nodeGap: 10,
          nodeAlign: "justify",
          layoutIterations: 32,
          emphasis: {
            focus: "adjacency",
            blurScope: "coordinateSystem",
            lineStyle: {
              opacity: 0.95,
            },
          },
          data: highlightedNodes,
          links: highlightedLinks,
          lineStyle: {
            curveness: 0.5,
          },
          label: {
            color: "#CBD5E1",
            fontSize: 11,
            fontFamily: "Inter, sans-serif",
          },
          itemStyle: {
            borderWidth: 0,
          },
        },
      ],
      animationDuration: 600,
      animationEasing: "cubicOut",
    };
  }, [direction, highlightTokenSymbol, highlightChainId, highlightVersion]);

  return (
    <div className="glass-card h-full p-3 md:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
        <div>
          <h2 className="font-display text-base font-semibold">
            Intent Path Flow
          </h2>
          <p className="text-[11px] text-muted">
            {direction === "deposit"
              ? "Source Chain → Asset Class → Protocol Rail → EdgeX Ledger"
              : "EdgeX Ledger → Protocol Rail → Asset Class → Target Chain"}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {Object.values(RAIL_META).map((r) => (
            <span
              key={r.label}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/20 px-2 py-0.5 text-[10px]"
            >
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: r.color }}
              />
              <span className="text-muted">{r.label}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="h-[520px] w-full md:h-[600px]">
        <ReactECharts
          option={option}
          style={{ height: "100%", width: "100%" }}
          notMerge
          lazyUpdate
          theme="dark"
        />
      </div>
    </div>
  );
}
