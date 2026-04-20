"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { Check, Zap, RotateCw, Lock } from "lucide-react";
import { TOKENS, isWithdrawable, CHAIN_MAP } from "@/lib/data-loader";
import { ASSET_CLASS_META } from "@/lib/asset-class-meta";
import type { AssetClass, Direction, Token } from "@/lib/types";

const ReactECharts = dynamic(() => import("echarts-for-react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[380px] w-full items-center justify-center">
      <div className="text-sm text-muted">Loading Universe...</div>
    </div>
  ),
});

interface Props {
  direction: Direction;
  selectedTokenSymbol: string;
  onSelectToken: (symbol: string) => void;
}

// Map chain count → bubble pixel size (log scale; single-chain tokens still legible)
function sizeFor(chainCount: number): number {
  return Math.round(Math.log2(chainCount + 1) * 22 + 32);
}

function commitmentBadge(t: Token): string {
  if (t.commitment === "core") return "Core";
  if (t.commitment === "source-only") return "Source-only";
  return "Extended";
}

export default function BubbleUniverse({
  direction,
  selectedTokenSymbol,
  onSelectToken,
}: Props) {
  const { option, total, classCount } = useMemo(() => {
    const visible =
      direction === "withdraw" ? TOKENS.filter(isWithdrawable) : TOKENS;

    // Preserve stable category order matching ASSET_CLASS_META keys
    const assetOrder: AssetClass[] = [
      "canonical",
      "native",
      "omnichain",
      "yield",
      "routable",
      "source-only",
      "long-tail",
    ];
    const presentClasses = assetOrder.filter((ac) =>
      visible.some((t) => t.assetClass === ac),
    );

    const categories = presentClasses.map((ac) => ({
      name: ASSET_CLASS_META[ac].label,
      itemStyle: { color: ASSET_CLASS_META[ac].color },
    }));

    const hasSelection = !!selectedTokenSymbol;
    const nodes = visible.map((t) => {
      const meta = ASSET_CLASS_META[t.assetClass];
      const selected = t.symbol === selectedTokenSymbol;
      // 选中态：symbolSize × 1.15 + 强 glow；其他 token opacity 降至 0.5 以聚焦
      const baseSize = sizeFor(t.chains.length);
      return {
        id: t.symbol,
        name: t.symbol,
        category: presentClasses.indexOf(t.assetClass),
        symbolSize: selected ? Math.round(baseSize * 1.15) : baseSize,
        value: t.chains.length,
        itemStyle: {
          color: meta.color,
          borderColor: selected ? "#F8FAFC" : "rgba(255,255,255,0.15)",
          borderWidth: selected ? 3 : 1,
          shadowBlur: selected ? 32 : 0,
          shadowColor: meta.color,
          opacity: hasSelection && !selected ? 0.5 : 0.92,
        },
        label: {
          show: true,
          color: "#FFFFFF",
          fontSize: selected ? 12 : 11,
          fontWeight: 700,
          formatter: "{b}",
        },
        // custom fields surfaced in tooltip via formatter
        tokenMeta: {
          name: t.name,
          assetClassLabel: meta.label,
          assetColor: meta.color,
          chains: t.chains
            .map((cid) => CHAIN_MAP[cid]?.name ?? cid)
            .join(" · "),
          commitment: commitmentBadge(t),
          finalAccount:
            t.finalAccount === "self" ? t.symbol : t.finalAccount,
          description: t.description,
          logoUrl: t.logoUrl ?? "",
        },
      };
    });

    const opt = {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "item",
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        borderColor: "#334155",
        borderWidth: 1,
        padding: 12,
        textStyle: { color: "#F8FAFC", fontSize: 12 },
        formatter: (params: {
          dataType?: string;
          name?: string;
          data?: {
            tokenMeta?: {
              name: string;
              assetClassLabel: string;
              assetColor: string;
              chains: string;
              commitment: string;
              finalAccount: string;
              description: string;
              logoUrl: string;
            };
          };
        }) => {
          if (params.dataType !== "node" || !params.data?.tokenMeta) {
            return params.name ?? "";
          }
          const m = params.data.tokenMeta;
          const logoImg = m.logoUrl
            ? `<img src="${m.logoUrl}" alt="" style="width:28px;height:28px;border-radius:9999px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.06);object-fit:cover;flex-shrink:0" />`
            : `<span style="width:28px;height:28px;border-radius:9999px;background:${m.assetColor}30;color:${m.assetColor};display:inline-flex;align-items:center;justify-content:center;font-family:monospace;font-size:10px;font-weight:700;flex-shrink:0">${(params.name ?? "").slice(0, 2)}</span>`;
          return `
            <div style="display:flex;gap:10px;align-items:flex-start">
              ${logoImg}
              <div>
                <div style="font-weight:700;font-size:13px;color:${m.assetColor}">${params.name} <span style="color:#94A3B8;font-weight:400">${m.name}</span></div>
                <div style="margin-top:6px;color:#94A3B8;font-size:11px">${m.assetClassLabel} · ${m.commitment}</div>
                <div style="margin-top:4px;color:#CBD5E1;font-size:11px">Final Ledger: <span style="color:#22C55E;font-family:monospace">${m.finalAccount}</span></div>
                <div style="margin-top:4px;color:#CBD5E1;font-size:11px;max-width:280px;word-break:break-word">Chains: ${m.chains}</div>
                <div style="margin-top:6px;color:#94A3B8;font-size:11px;max-width:280px;line-height:1.4">${m.description}</div>
              </div>
            </div>
          `;
        },
      },
      legend: {
        show: false,
      },
      animationDurationUpdate: 500,
      animationEasingUpdate: "cubicOut",
      series: [
        {
          type: "graph",
          layout: "force",
          roam: false,
          draggable: true,
          symbol: "circle",
          categories,
          data: nodes,
          edges: [],
          force: {
            repulsion: 180,
            gravity: 0.12,
            edgeLength: 0,
            layoutAnimation: true,
            friction: 0.25,
          },
          label: {
            position: "inside",
          },
          emphasis: {
            scale: 1.1,
            itemStyle: {
              borderColor: "#F8FAFC",
              borderWidth: 3,
              shadowBlur: 20,
            },
            label: {
              fontSize: 13,
            },
          },
        },
      ],
    };

    return {
      option: opt,
      total: visible.length,
      classCount: presentClasses.length,
    };
  }, [direction, selectedTokenSymbol]);

  const onEvents = useMemo(
    () => ({
      click: (params: { dataType?: string; name?: string }) => {
        if (params.dataType === "node" && params.name) {
          onSelectToken(params.name);
        }
      },
    }),
    [onSelectToken],
  );

  const isWithdraw = direction === "withdraw";

  return (
    <div className="glass-card p-3 md:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
        <div>
          <h2 className="font-display text-base font-semibold">
            Supported Tokens Universe
          </h2>
          <p className="text-[11px] text-muted">
            {isWithdraw
              ? "当前方向可提现资产 · 泡泡大小 = 支持链数"
              : "当前方向可入金资产 · 泡泡大小 = 支持链数"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[11px] text-muted">
            <span className="font-mono text-foreground">{total}</span> Tokens
          </span>
          <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[11px] text-muted">
            <span className="font-mono text-foreground">{classCount}</span> Classes
          </span>
        </div>
      </div>

      <div className="mb-2 flex flex-wrap gap-1.5 px-1">
        {Object.entries(ASSET_CLASS_META).map(([key, meta]) => (
          <span
            key={key}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/20 px-2 py-0.5 text-[11px]"
          >
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: meta.color }}
            />
            <span className="text-muted">{meta.label}</span>
          </span>
        ))}
      </div>

      {/* Scheduling Mechanism mini legend — 方案 v4.6 强调 OFT vs Solver 对比 */}
      <div className="mb-3 flex flex-wrap items-center gap-1.5 border-t border-white/5 pt-2 px-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
          Withdraw Scheduling:
        </span>
        <span
          className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px]"
          style={{ borderColor: "#3B82F640", backgroundColor: "#3B82F610", color: "#60A5FA" }}
          title="Canonical USDC 通过 CCTP 直达；Solver 仅极端 fallback"
        >
          <Check className="h-2.5 w-2.5" />
          CCTP Canonical
        </span>
        <span
          className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px]"
          style={{ borderColor: "#F59E0B40", backgroundColor: "#F59E0B10", color: "#FBBF24" }}
          title="Native / Routable 资产库存不足时 Solver 网络跨链 fill"
        >
          <Zap className="h-2.5 w-2.5" />
          Solver Network
        </span>
        <span
          className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px]"
          style={{ borderColor: "#A855F740", backgroundColor: "#A855F710", color: "#C084FC" }}
          title="Omnichain 资产走 LayerZero OFT 再平衡 — 不经过 Solver 网络"
        >
          <RotateCw className="h-2.5 w-2.5" />
          OFT Rebalance · No Solver
        </span>
        <span
          className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px]"
          style={{ borderColor: "#F9731640", backgroundColor: "#F9731610", color: "#FB923C" }}
          title="Source-only 资产库存 = 入金累积，无 solver 补位"
        >
          <Lock className="h-2.5 w-2.5" />
          Source-only · No Scheduling
        </span>
      </div>

      <div className="h-[380px] w-full md:h-[440px]">
        <ReactECharts
          option={option}
          style={{ height: "100%", width: "100%" }}
          onEvents={onEvents}
          notMerge
          lazyUpdate
          theme="dark"
        />
      </div>

      <p className="mt-2 px-1 text-[11px] text-muted">
        Tip: 点击任意泡泡 → 左侧 Selector 与 Sankey 同步高亮该 Token 路径。
      </p>
    </div>
  );
}
