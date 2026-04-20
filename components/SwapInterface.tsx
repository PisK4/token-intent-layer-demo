"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDown, Sparkles, Info } from "lucide-react";
import clsx from "clsx";
import { TOKEN_MAP, CHAIN_MAP, RAIL_META } from "@/lib/data-loader";
import { ASSET_CLASS_META } from "@/lib/asset-class-meta";
import type { Direction } from "@/lib/types";
import { TokenIcon } from "./AssetIcon";

interface Props {
  direction: Direction;
  tokenSymbol: string;
  chainId: string;
  stockSufficient: boolean;
  onToggleStock: () => void;
  onPreview: () => void;
}

// Mock exchange rates: amount -> approximate USD value
const UNIT_PRICE: Record<string, number> = {
  USDC: 1,
  USDT: 1,
  ETH: 3360,
  WBTC: 95000,
  cbBTC: 95000,
  SOL: 180,
  EDGE: 0.5,
  AVAX: 35,
  POL: 0.4,
  BNB: 600,
  HYPE: 40,
  APT: 10,
  SUI: 3,
  SEI: 0.35,
  stETH: 3696,
  wstETH: 4200,
  weETH: 3561,
  aUSDC: 1.08,
  sUSDe: 1.12,
  ENA: 0.68,
  AAVE: 152,
  LINK: 18,
  UNI: 9.2,
  PEPE: 0.0000128,
  ARB: 0.75,
  ONDO: 1.15,
  BGB: 4.8,
  OKB: 52,
  LIT: 1.2,
  MARU: 0.01,
  ASTER: 0.08,
  CAKE: 2.5,
  WLD: 1.5,
  JUP: 0.8,
  PYTH: 0.25,
  JTO: 2.8,
  RAY: 3.5,
  DEEP: 0.18,
  CETUS: 0.12,
  jitoSOL: 207,
  mSOL: 200,
  BONK: 0.00003,
  WIF: 1.8,
  MOG: 0.0000032,
};

export default function SwapInterface({
  direction,
  tokenSymbol,
  chainId,
  stockSufficient,
  onToggleStock,
  onPreview,
}: Props) {
  const token = TOKEN_MAP[tokenSymbol];
  const chain = CHAIN_MAP[chainId];
  const assetMeta = ASSET_CLASS_META[token.assetClass];
  const rail = token.rails[0];
  const railMeta = RAIL_META[rail];

  // 方案 v4.6：commitment 等级决定用户可期望的服务保障
  const commitmentNote =
    token.commitment === "core"
      ? `Core Commitment · ${railMeta.label} canonical settlement`
      : token.commitment === "source-only"
        ? `Source-only Commitment · 源链闭环，无 Solver 补位`
        : `Extended Commitment · ${railMeta.label} + Solver fallback`;

  const defaultAmount =
    token.symbol === "USDC"
      ? "1000"
      : token.symbol === "ETH"
        ? "1.5"
        : token.symbol === "stETH"
          ? "1.5"
          : token.symbol === "PEPE"
            ? "500000000"
            : token.symbol === "MOG"
              ? "10000000"
              : "100";

  const [amount, setAmount] = useState(defaultAmount);
  // CTA 首次加载 2s 后闪动一次引导注意力；点击一次后不再闪
  const [ctaHinted, setCtaHinted] = useState(false);
  const [ctaAttention, setCtaAttention] = useState(false);
  useEffect(() => {
    if (ctaHinted) return;
    const t = setTimeout(() => setCtaAttention(true), 1800);
    return () => clearTimeout(t);
  }, [ctaHinted]);

  const { targetAmount, targetLabel, usdValue, yieldPremium } = useMemo(() => {
    const numeric = Number(amount) || 0;
    const priceIn = UNIT_PRICE[token.symbol] ?? 1;
    const usd = numeric * priceIn;

    const premiumFor = (baseSymbol: string): number | undefined => {
      if (token.assetClass !== "yield") return undefined;
      const basePrice = UNIT_PRICE[baseSymbol];
      if (!basePrice) return undefined;
      const ratio = priceIn / basePrice;
      return ratio > 1.001 ? (ratio - 1) * 100 : undefined;
    };

    if (direction === "deposit") {
      if (token.finalAccount === "USDC") {
        return {
          targetAmount: usd.toFixed(2),
          targetLabel: "USDC @ EdgeX",
          usdValue: usd,
          yieldPremium: premiumFor("USDC"),
        };
      }
      if (token.finalAccount === "ETH") {
        const ethOut = usd / UNIT_PRICE.ETH;
        return {
          targetAmount: ethOut.toFixed(4),
          targetLabel: "ETH @ EdgeX",
          usdValue: usd,
          yieldPremium: premiumFor("ETH"),
        };
      }
      if (token.finalAccount === "SOL") {
        const solOut = usd / UNIT_PRICE.SOL;
        return {
          targetAmount: solOut.toFixed(3),
          targetLabel: "SOL @ EdgeX",
          usdValue: usd,
          yieldPremium: premiumFor("SOL"),
        };
      }
      return {
        targetAmount: numeric.toLocaleString(),
        targetLabel: `${token.symbol} @ EdgeX`,
        usdValue: usd,
        yieldPremium: undefined,
      };
    }

    // Withdraw
    return {
      targetAmount: numeric.toLocaleString(),
      targetLabel: `${token.symbol} @ ${chain.name}`,
      usdValue: usd,
      yieldPremium: undefined,
    };
  }, [amount, token, chain, direction]);

  const isWithdraw = direction === "withdraw";

  return (
    <div className="glass-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-wider text-muted">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
          {isWithdraw ? "Withdraw Intent" : "Deposit Intent"}
        </h2>
        {isWithdraw && (
          <button
            onClick={onToggleStock}
            className={clsx(
              "pill transition-colors",
              stockSufficient
                ? "pill-core"
                : "pill-source-only animate-flow-pulse",
            )}
            title="切换库存状态以查看 fallback 路径"
          >
            {stockSufficient ? "Stock OK" : "Stock Low"}
          </button>
        )}
      </div>

      <div className="space-y-1">
        <div className="rounded-xl border border-white/10 bg-black/20 p-3.5">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted">
              {isWithdraw ? "From EdgeX" : `From ${chain.name}`}
            </span>
            <span className="font-mono text-[11px] text-muted">
              ≈ ${usdValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
              className="w-full bg-transparent font-display text-3xl font-bold outline-none placeholder:text-muted/50"
              placeholder="0.0"
            />
            <div
              className="flex shrink-0 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 font-medium"
              style={{ color: assetMeta.color }}
            >
              <TokenIcon
                logoUrl={token.logoUrl}
                symbol={token.symbol}
                tintColor={assetMeta.color}
                size={20}
              />
              <span>{token.symbol}</span>
            </div>
          </div>
        </div>

        <div className="relative flex flex-col items-center justify-center gap-1 py-1">
          <div className="absolute inset-x-6 top-4 h-px bg-white/5" />
          <div className="relative flex items-center gap-2 rounded-full border border-white/10 bg-surface-elevated px-3 py-1.5 text-[11px]">
            <ArrowDown className="h-3.5 w-3.5" style={{ color: railMeta.color }} />
            <span className="font-medium" style={{ color: railMeta.color }}>
              via {railMeta.label}
            </span>
          </div>
          <span className="text-[10px] text-muted">{commitmentNote}</span>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/20 p-3.5">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted">
              {isWithdraw ? `To ${chain.name}` : "To EdgeX Ledger"}
            </span>
            <span className="font-mono text-[11px] text-muted">
              auto-calculated · demo
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-full font-display text-3xl font-bold text-foreground">
              {targetAmount}
            </span>
            {(() => {
              const targetSymbol = targetLabel.split(" @ ")[0];
              const targetTok = TOKEN_MAP[targetSymbol];
              return (
                <div className="flex shrink-0 items-center gap-2 rounded-lg border border-white/10 bg-accent/10 px-3 py-1.5 font-medium text-accent">
                  <TokenIcon
                    logoUrl={targetTok?.logoUrl}
                    symbol={targetSymbol}
                    tintColor="#22C55E"
                    size={20}
                  />
                  <span>{targetSymbol}</span>
                </div>
              );
            })()}
          </div>
          <p className="mt-2 text-[11px] text-muted">{targetLabel}</p>
          {yieldPremium !== undefined && (
            <div className="mt-2 flex items-center gap-1.5 rounded-lg border border-accent/20 bg-accent/5 px-2 py-1.5">
              <Sparkles className="h-3 w-3 text-accent" />
              <span className="text-[11px] font-medium text-accent">
                Yield premium: +{yieldPremium.toFixed(1)}%
              </span>
              <span className="text-[11px] text-muted">
                · {token.symbol} 已累积收益，归一化后获得更多 {token.finalAccount}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-xl border border-white/5 bg-black/10 p-3">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted" />
        <p className="text-[11px] leading-relaxed text-muted">
          本 Demo 仅演示路径编排，不执行真实交易。金额基于 mock 价格估算。
        </p>
      </div>

      <button
        onClick={() => {
          setCtaHinted(true);
          setCtaAttention(false);
          onPreview();
        }}
        className={clsx(
          "btn-primary mt-3 w-full",
          ctaAttention && !ctaHinted && "animate-cta-pulse",
        )}
      >
        <Sparkles className="h-4 w-4" />
        Preview Route on Sankey
      </button>
    </div>
  );
}
