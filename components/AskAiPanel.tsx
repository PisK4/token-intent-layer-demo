"use client";

import { useMemo, useState } from "react";
import {
  Scan,
  Trash2,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Wallet,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import clsx from "clsx";
import mockWalletJson from "@/data/mock-wallet.json";
import { analyzeWallet, type WalletHolding } from "@/lib/wallet-analyzer";
import { TOKEN_MAP, CHAIN_MAP } from "@/lib/data-loader";
import { ASSET_CLASS_META } from "@/lib/asset-class-meta";
import { TokenIcon } from "./AssetIcon";

const ACCENT = "#06B6D4";

interface Props {
  onNavigateToDeposit: (tokenSymbol: string, chainId: string) => void;
}

function fmt(v: number, decimals = 2): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`;
  return `$${v.toFixed(decimals)}`;
}

export default function AskAiPanel({ onNavigateToDeposit }: Props) {
  const analysis = useMemo(
    () => analyzeWallet(mockWalletJson as WalletHolding[]),
    [],
  );

  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [dustExpanded, setDustExpanded] = useState(true);
  const [yieldExpanded, setYieldExpanded] = useState(true);

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setScanned(true);
    }, 1500);
  };

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(360px,420px)_1fr]">
      {/* Left column: scanner + results */}
      <div className="flex flex-col gap-5">
        {/* Scan trigger card */}
        <div className="glass-card p-5">
          <div className="mb-4 flex items-center gap-3">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: ACCENT + "22", color: ACCENT }}
            >
              <Wallet className="h-5 w-5" />
            </span>
            <div>
              <h2
                className="font-display text-base font-bold"
                style={{ color: ACCENT }}
              >
                AI Wallet Scanner
              </h2>
              <p className="text-[11px] text-muted">
                检测 Dust Token（单个不足 EdgeX $10 最小入金门槛）+ Yield Token · 推荐优化方案
              </p>
            </div>
          </div>

          {!scanned ? (
            <button
              onClick={handleScan}
              disabled={scanning}
              className={clsx(
                "btn-primary w-full",
                scanning && "animate-pulse opacity-70",
              )}
              style={
                !scanning
                  ? {
                      background: `linear-gradient(135deg, ${ACCENT}, #0891B2)`,
                    }
                  : undefined
              }
            >
              <Scan className="h-4 w-4" />
              {scanning ? "Scanning wallet..." : "Scan My Wallet"}
            </button>
          ) : (
            <div className="space-y-3">
              {/* Overview stats */}
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-center">
                  <div className="font-display text-lg font-bold text-foreground">
                    {analysis.holdings.length}
                  </div>
                  <div className="text-[10px] text-muted">Tokens</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-center">
                  <div
                    className="font-display text-lg font-bold"
                    style={{ color: "#EC4899" }}
                  >
                    {analysis.dustTokens.length}
                  </div>
                  <div className="text-[10px] text-muted">Dust</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-center">
                  <div
                    className="font-display text-lg font-bold"
                    style={{ color: "#A855F7" }}
                  >
                    {analysis.yieldTokens.length}
                  </div>
                  <div className="text-[10px] text-muted">Yield</div>
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted">
                    Total Portfolio Value
                  </span>
                  <span className="font-mono text-sm font-bold text-foreground">
                    {fmt(analysis.totalUsdValue)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dust Scanner */}
        {scanned && analysis.dustTokens.length > 0 && (
          <div className="glass-card overflow-hidden">
            <button
              onClick={() => setDustExpanded((e) => !e)}
              className="flex w-full items-center justify-between p-4 text-left"
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ backgroundColor: "#EC489920", color: "#EC4899" }}
                >
                  <Trash2 className="h-4 w-4" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: "#EC4899" }}
                    >
                      Dust Tokens Detected
                    </span>
                    <span className="rounded-full bg-pink-500/20 px-2 py-0.5 text-[10px] font-bold text-pink-400">
                      {analysis.dustTokens.length}
                    </span>
                  </div>
                  <span className="text-[11px] text-muted">
                    Total value: {fmt(analysis.totalDustUsd)} · 单个均不足 $10 最小入金 · 建议合并归一化
                  </span>
                </div>
              </div>
              {dustExpanded ? (
                <ChevronUp className="h-4 w-4 text-muted" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted" />
              )}
            </button>

            {dustExpanded && (
              <div className="border-t border-white/5 px-4 pb-4">
                <div className="mt-3 space-y-2">
                  {analysis.dustTokens.map((h) => {
                    const token = TOKEN_MAP[h.symbol];
                    const meta = token
                      ? ASSET_CLASS_META[token.assetClass]
                      : null;
                    return (
                      <div
                        key={`${h.symbol}-${h.chain}`}
                        className="flex items-center gap-3 rounded-lg border border-white/5 bg-black/20 px-3 py-2"
                      >
                        <TokenIcon
                          logoUrl={token?.logoUrl}
                          symbol={h.symbol}
                          tintColor={meta?.color ?? "#EC4899"}
                          size={24}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-medium text-foreground">
                              {h.symbol}
                            </span>
                            <span className="text-[10px] text-muted">
                              @ {CHAIN_MAP[h.chain]?.name ?? h.chain}
                            </span>
                          </div>
                          <div className="text-[10px] text-muted">
                            {h.balance.toLocaleString()} · {fmt(h.usdValue)}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="rounded-full bg-pink-500/10 px-2 py-0.5 text-[10px] font-medium text-pink-400">
                            → {h.finalAccount === "ETH" ? "ETH" : "USDC"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <button
                  onClick={() => {
                    const first = analysis.dustTokens[0];
                    if (first) onNavigateToDeposit(first.symbol, first.chain);
                  }}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-pink-500/30 bg-pink-500/10 py-2.5 text-sm font-semibold text-pink-400 transition-colors hover:bg-pink-500/20"
                >
                  <Sparkles className="h-4 w-4" />
                  Sweep All Dust → USDC / ETH
                </button>
              </div>
            )}
          </div>
        )}

        {/* Yield Advisor */}
        {scanned && analysis.yieldTokens.length > 0 && (
          <div className="glass-card overflow-hidden">
            <button
              onClick={() => setYieldExpanded((e) => !e)}
              className="flex w-full items-center justify-between p-4 text-left"
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ backgroundColor: "#A855F720", color: "#A855F7" }}
                >
                  <TrendingUp className="h-4 w-4" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: "#A855F7" }}
                    >
                      Yield Tokens Found
                    </span>
                    <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] font-bold text-purple-400">
                      {analysis.yieldTokens.length}
                    </span>
                  </div>
                  <span className="text-[11px] text-muted">
                    Value: {fmt(analysis.totalYieldUsd)} · 含累积质押收益
                  </span>
                </div>
              </div>
              {yieldExpanded ? (
                <ChevronUp className="h-4 w-4 text-muted" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted" />
              )}
            </button>

            {yieldExpanded && (
              <div className="border-t border-white/5 px-4 pb-4">
                <div className="mt-3 space-y-2">
                  {analysis.yieldTokens.map((h) => {
                    const token = TOKEN_MAP[h.symbol];
                    const premium = analysis.yieldPremiums.find(
                      (p) => p.symbol === h.symbol,
                    );
                    return (
                      <div
                        key={`${h.symbol}-${h.chain}`}
                        className="flex items-center gap-3 rounded-lg border border-white/5 bg-black/20 px-3 py-2"
                      >
                        <TokenIcon
                          logoUrl={token?.logoUrl}
                          symbol={h.symbol}
                          tintColor="#A855F7"
                          size={24}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-medium text-foreground">
                              {h.symbol}
                            </span>
                            <span className="text-[10px] text-muted">
                              @ {CHAIN_MAP[h.chain]?.name ?? h.chain}
                            </span>
                          </div>
                          <div className="text-[10px] text-muted">
                            {h.balance.toLocaleString()} · {fmt(h.usdValue)}
                          </div>
                        </div>
                        <div className="text-right">
                          {premium && (
                            <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] font-medium text-purple-400">
                              +{premium.premium.toFixed(1)}% → {premium.baseAsset}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <button
                  onClick={() => {
                    const first = analysis.yieldTokens[0];
                    if (first) onNavigateToDeposit(first.symbol, first.chain);
                  }}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 py-2.5 text-sm font-semibold text-purple-400 transition-colors hover:bg-purple-500/20"
                >
                  <TrendingUp className="h-4 w-4" />
                  Deposit Yield Tokens → EdgeX
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right column: classification + action plan */}
      <div className="flex flex-col gap-5">
        {/* Asset classification breakdown */}
        {scanned && (
          <div className="glass-card p-5">
            <h3 className="mb-4 flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-wider text-muted">
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: ACCENT }}
              />
              Wallet Asset Classification
            </h3>

            <div className="space-y-2">
              {analysis.classBuckets.map((b) => {
                const meta =
                  ASSET_CLASS_META[b.assetClass as keyof typeof ASSET_CLASS_META];
                const pct =
                  analysis.totalUsdValue > 0
                    ? (b.usdValue / analysis.totalUsdValue) * 100
                    : 0;
                return (
                  <div key={b.assetClass} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block h-2.5 w-2.5 rounded-sm"
                          style={{
                            backgroundColor: meta?.color ?? "#64748B",
                          }}
                        />
                        <span className="font-medium text-foreground">
                          {meta?.label ?? b.assetClass}
                        </span>
                        <span className="text-muted">
                          {b.count} token{b.count > 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-foreground">
                          {fmt(b.usdValue)}
                        </span>
                        <span className="text-muted">
                          {pct.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max(pct, 0.5)}%`,
                          backgroundColor: meta?.color ?? "#64748B",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Stacked bar */}
            <div className="mt-4 flex h-4 overflow-hidden rounded-full bg-white/5">
              {analysis.classBuckets.map((b) => {
                const meta =
                  ASSET_CLASS_META[b.assetClass as keyof typeof ASSET_CLASS_META];
                const pct =
                  analysis.totalUsdValue > 0
                    ? (b.usdValue / analysis.totalUsdValue) * 100
                    : 0;
                return (
                  <div
                    key={b.assetClass}
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${Math.max(pct, 0.3)}%`,
                      backgroundColor: meta?.color ?? "#64748B",
                    }}
                    title={`${meta?.label ?? b.assetClass}: ${fmt(b.usdValue)}`}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* AI Action Plan */}
        {scanned && (
          <div className="glass-card p-5">
            <h3 className="mb-4 flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-wider text-muted">
              <Sparkles className="h-3.5 w-3.5" style={{ color: ACCENT }} />
              AI Recommended Action Plan
            </h3>

            <div className="space-y-3">
              {/* Step 1: Sweep dust */}
              <ActionStep
                step={1}
                color="#EC4899"
                icon={Trash2}
                title="Sweep Dust Tokens"
                description={`将 ${analysis.dustTokens.length} 个 Dust Token (${fmt(analysis.totalDustUsd)}) 合并归一化为 USDC / ETH — 单个不够 EdgeX $10 最小入金门槛，合并后一次性存入`}
                detail="1inch / UniswapX / CoW 源链聚合兑换 → CCTP / Vault 入账"
                status={analysis.dustTokens.length > 0 ? "actionable" : "done"}
                onAction={() => {
                  const first = analysis.dustTokens[0];
                  if (first) onNavigateToDeposit(first.symbol, first.chain);
                }}
              />

              {/* Step 2: Deposit yield */}
              <ActionStep
                step={2}
                color="#A855F7"
                icon={TrendingUp}
                title="Deposit Yield Tokens"
                description={`将 ${analysis.yieldTokens.length} 个收益型 Token (${fmt(analysis.totalYieldUsd)}) 存入 EdgeX，自动归一化为核心资产`}
                detail={
                  analysis.yieldPremiums.length > 0
                    ? `累积收益溢价: ${analysis.yieldPremiums.map((p) => `${p.symbol} +${p.premium.toFixed(1)}%`).join(", ")}`
                    : "源链实时汇率兑换"
                }
                status={analysis.yieldTokens.length > 0 ? "actionable" : "done"}
                onAction={() => {
                  const first = analysis.yieldTokens[0];
                  if (first) onNavigateToDeposit(first.symbol, first.chain);
                }}
              />

              {/* Step 3: Start trading */}
              <ActionStep
                step={3}
                color="#22C55E"
                icon={ArrowRight}
                title="Start Trading on EdgeX"
                description="优化后的核心资产 (USDC / ETH / SOL) 已入账，即可在 EdgeX 进行永续或现货交易"
                detail="Zero slippage · Deep liquidity · Cross-margin"
                status="info"
              />
            </div>
          </div>
        )}

        {/* Holdings detail table */}
        {scanned && (
          <div className="glass-card p-5">
            <h3 className="mb-4 flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-wider text-muted">
              <Wallet className="h-3.5 w-3.5" style={{ color: ACCENT }} />
              All Holdings ({analysis.holdings.length})
            </h3>
            <div className="max-h-[320px] overflow-y-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-white/5 text-left text-muted">
                    <th className="pb-2 font-medium">Token</th>
                    <th className="pb-2 font-medium">Chain</th>
                    <th className="pb-2 text-right font-medium">Balance</th>
                    <th className="pb-2 text-right font-medium">USD Value</th>
                    <th className="pb-2 font-medium">Class</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.holdings
                    .sort((a, b) => b.usdValue - a.usdValue)
                    .map((h) => {
                      const token = TOKEN_MAP[h.symbol];
                      const meta = token
                        ? ASSET_CLASS_META[token.assetClass]
                        : null;
                      return (
                        <tr
                          key={`${h.symbol}-${h.chain}`}
                          className="border-b border-white/[0.03] hover:bg-white/[0.02]"
                        >
                          <td className="py-2">
                            <div className="flex items-center gap-2">
                              <TokenIcon
                                logoUrl={token?.logoUrl}
                                symbol={h.symbol}
                                tintColor={meta?.color ?? "#64748B"}
                                size={18}
                              />
                              <span className="font-mono font-medium text-foreground">
                                {h.symbol}
                              </span>
                            </div>
                          </td>
                          <td className="py-2 text-muted">
                            {CHAIN_MAP[h.chain]?.name ?? h.chain}
                          </td>
                          <td className="py-2 text-right font-mono text-foreground">
                            {h.balance.toLocaleString(undefined, {
                              maximumFractionDigits: 4,
                            })}
                          </td>
                          <td className="py-2 text-right font-mono text-foreground">
                            {fmt(h.usdValue)}
                          </td>
                          <td className="py-2">
                            <span
                              className="rounded-full px-1.5 py-0.5 text-[9px] font-medium"
                              style={{
                                color: meta?.color ?? "#64748B",
                                backgroundColor:
                                  (meta?.color ?? "#64748B") + "20",
                              }}
                            >
                              {meta?.label ?? h.assetClass}
                            </span>
                          </td>
                          <td className="py-2">
                            {h.isDust && (
                              <span className="flex items-center gap-1 text-pink-400">
                                <AlertTriangle className="h-3 w-3" />
                                Dust
                              </span>
                            )}
                            {h.isYield && (
                              <span className="flex items-center gap-1 text-purple-400">
                                <TrendingUp className="h-3 w-3" />
                                Yield
                              </span>
                            )}
                            {!h.isDust && !h.isYield && (
                              <span className="flex items-center gap-1 text-green-400">
                                <CheckCircle2 className="h-3 w-3" />
                                OK
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pre-scan placeholder */}
        {!scanned && (
          <div className="glass-card flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
            <div
              className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{ backgroundColor: ACCENT + "15" }}
            >
              <Scan className="h-8 w-8" style={{ color: ACCENT }} />
            </div>
            <h3
              className="font-display text-lg font-bold"
              style={{ color: ACCENT }}
            >
              AI Wallet Intelligence
            </h3>
            <p className="mt-2 max-w-sm text-sm text-muted">
              点击左侧 &quot;Scan My Wallet&quot;
              按钮，AI 将自动扫描您的钱包，识别 Dust Token 和 Yield
              Token，并推荐最优处理方案。
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 text-left">
              <div className="rounded-xl border border-white/5 bg-black/20 p-3">
                <Trash2 className="mb-2 h-4 w-4 text-pink-400" />
                <div className="text-xs font-medium text-foreground">
                  Dust Token 扫描
                </div>
                <div className="mt-1 text-[10px] text-muted">
                  发现钱包中不足 EdgeX $10 最小入金门槛的零散代币，合并归一化为 USDC / ETH 后一键存入
                </div>
              </div>
              <div className="rounded-xl border border-white/5 bg-black/20 p-3">
                <TrendingUp className="mb-2 h-4 w-4 text-purple-400" />
                <div className="text-xs font-medium text-foreground">
                  Yield Token 管理
                </div>
                <div className="mt-1 text-[10px] text-muted">
                  检测收益型代币（stETH / aUSDC），建议存入 EdgeX 释放收益价值
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ActionStep({
  step,
  color,
  icon: Icon,
  title,
  description,
  detail,
  status,
  onAction,
}: {
  step: number;
  color: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  title: string;
  description: string;
  detail: string;
  status: "actionable" | "done" | "info";
  onAction?: () => void;
}) {
  return (
    <div
      className={clsx(
        "relative rounded-xl border px-4 py-3",
        status === "actionable"
          ? "border-white/10 bg-black/20"
          : "border-white/5 bg-black/10",
      )}
    >
      <div className="flex gap-3">
        <div className="flex flex-col items-center">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
            style={{ backgroundColor: color + "20", color }}
          >
            {step}
          </span>
          {step < 3 && (
            <span className="mt-1 h-full w-px bg-white/10" aria-hidden />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Icon className="h-3.5 w-3.5" style={{ color }} />
            <span
              className="text-sm font-semibold"
              style={{ color }}
            >
              {title}
            </span>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-foreground/80">
            {description}
          </p>
          <p className="mt-0.5 text-[10px] text-muted">{detail}</p>
          {status === "actionable" && onAction && (
            <button
              onClick={onAction}
              className="mt-2 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors hover:bg-white/5"
              style={{ color, border: `1px solid ${color}40` }}
            >
              Go to Deposit
              <ArrowRight className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
