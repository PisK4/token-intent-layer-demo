"use client";

import { useMemo, useState } from "react";
import { Link2, Coins, Train, Layers, Plug } from "lucide-react";
import clsx from "clsx";
import { CHAINS, TOKENS, RAIL_META } from "@/lib/data-loader";
import { ASSET_CLASS_META } from "@/lib/asset-class-meta";

// External market execution protocols integrated by Intent Gateway.
// Sourced from architecture/方案设计/流动性扩展方案/fancy-demo/
// edgex-intent-layer-intergrate-protocol-matrix.md §7 Demo 推荐组合.
const MARKET_EXECUTION_PROTOCOLS = [
  { name: "UniswapX", role: "Dutch Order + Filler" },
  { name: "CoW Protocol", role: "Batch Auction + Solver" },
  { name: "1inch", role: "Aggregator · Long-tail fallback" },
  { name: "deBridge / DLN", role: "Cross-chain intent execution" },
  { name: "Mayan", role: "Solana-core terminal delivery" },
  { name: "LI.FI", role: "Route abstraction" },
  { name: "Everclear", role: "Rebalancing / clearing backend" },
] as const;

const SETTLEMENT_RAILS = Object.values(RAIL_META).map((r) => r.label);

export default function StatsStrip() {
  const [protocolsOpen, setProtocolsOpen] = useState(false);

  const { chainCount, tokenCount, railCount, classCount, protocolCount } =
    useMemo(() => {
      // Rails (settlement) = 6; Protocols = 4 infra + 7 market execution = 11.
      const infraProtocols = 4; // CCTP, Vault, LayerZero, Wormhole (canonical infra)
      return {
        chainCount: CHAINS.length,
        tokenCount: TOKENS.length,
        railCount: Object.keys(RAIL_META).length,
        classCount: Object.keys(ASSET_CLASS_META).length,
        protocolCount: infraProtocols + MARKET_EXECUTION_PROTOCOLS.length,
      };
    }, []);

  const stats = [
    {
      icon: Link2,
      label: "Chains",
      value: chainCount,
      accent: "#22C55E",
      hint: "EVM + Non-EVM",
    },
    {
      icon: Coins,
      label: "Tokens",
      value: tokenCount,
      accent: "#3B82F6",
      hint: "Core + Extended",
    },
    {
      icon: Train,
      label: "Settlement Rails",
      value: railCount,
      accent: "#A855F7",
      hint: SETTLEMENT_RAILS.join(" · "),
    },
    {
      icon: Layers,
      label: "Asset Classes",
      value: classCount,
      accent: "#F59E0B",
      hint: "Canonical → Long-tail",
    },
    {
      icon: Plug,
      label: "Protocols Integrated",
      value: protocolCount,
      accent: "#EC4899",
      hint: "Click to expand",
      interactive: true,
    },
  ];

  return (
    <div className="mb-4">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-5 md:gap-3">
        {stats.map((s) => {
          const Icon = s.icon;
          const isProtocols = s.label === "Protocols Integrated";
          return (
            <button
              key={s.label}
              type="button"
              onClick={() => isProtocols && setProtocolsOpen((o) => !o)}
              disabled={!s.interactive}
              aria-expanded={isProtocols ? protocolsOpen : undefined}
              className={clsx(
                "glass-card flex items-center gap-3 px-3 py-3 text-left transition-transform duration-200",
                s.interactive &&
                  "cursor-pointer hover:-translate-y-0.5 hover:shadow-glow",
                !s.interactive && "cursor-default",
              )}
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                style={{
                  backgroundColor: s.accent + "22",
                  color: s.accent,
                }}
              >
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-1.5">
                  <span
                    className="font-display text-2xl font-bold leading-none"
                    style={{ color: s.accent }}
                  >
                    {s.value}
                  </span>
                  {isProtocols && (
                    <span className="text-[10px] font-medium text-muted">
                      {protocolsOpen ? "▾" : "▸"}
                    </span>
                  )}
                </div>
                <div className="mt-1 text-[11px] font-medium uppercase tracking-wider text-muted">
                  {s.label}
                </div>
                <div className="mt-0.5 truncate text-[10px] text-muted/70">
                  {s.hint}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {protocolsOpen && (
        <div className="glass-card mt-2 p-4">
          <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
            <Plug className="h-3.5 w-3.5" />
            Protocol Integration Matrix
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-accent">
                Canonical Infrastructure
              </div>
              <ul className="space-y-1.5 text-[11px]">
                <li className="flex items-center justify-between rounded-lg border border-white/5 bg-black/20 px-2.5 py-1.5">
                  <span className="font-mono text-foreground">Circle CCTP</span>
                  <span className="text-muted">USDC canonical</span>
                </li>
                <li className="flex items-center justify-between rounded-lg border border-white/5 bg-black/20 px-2.5 py-1.5">
                  <span className="font-mono text-foreground">EdgeX Vault</span>
                  <span className="text-muted">Native custody</span>
                </li>
                <li className="flex items-center justify-between rounded-lg border border-white/5 bg-black/20 px-2.5 py-1.5">
                  <span className="font-mono text-foreground">LayerZero</span>
                  <span className="text-muted">Omnichain · OFT</span>
                </li>
                <li className="flex items-center justify-between rounded-lg border border-white/5 bg-black/20 px-2.5 py-1.5">
                  <span className="font-mono text-foreground">Wormhole</span>
                  <span className="text-muted">Non-EVM interop</span>
                </li>
              </ul>
            </div>
            <div className="lg:col-span-2">
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-accent">
                Market Execution (via Intent Gateway)
              </div>
              <ul className="grid grid-cols-1 gap-1.5 text-[11px] sm:grid-cols-2">
                {MARKET_EXECUTION_PROTOCOLS.map((p) => (
                  <li
                    key={p.name}
                    className="flex items-center justify-between rounded-lg border border-white/5 bg-black/20 px-2.5 py-1.5"
                  >
                    <span className="font-mono text-foreground">{p.name}</span>
                    <span className="truncate pl-2 text-[10px] text-muted">
                      {p.role}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="mt-3 text-[10px] leading-relaxed text-muted">
            EdgeX 自建 Token Router + Intent Gateway；外部协议（UniswapX /
            CoW / 1inch / deBridge / Mayan / LI.FI / Everclear）提供 solver
            竞价与路径抽象，EdgeX 不自建 solver network。
          </p>
        </div>
      )}
    </div>
  );
}
