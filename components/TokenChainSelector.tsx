"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import clsx from "clsx";
import { CHAINS } from "@/lib/data/chains";
import { TOKENS, ASSET_CLASS_META } from "@/lib/data/tokens";
import type { Token, Chain } from "@/lib/types";

interface Props {
  selectedChainId: string;
  selectedTokenSymbol: string;
  onChainChange: (id: string) => void;
  onTokenChange: (symbol: string) => void;
}

function commitmentPill(token: Token) {
  if (token.commitment === "core") return { cls: "pill-core", label: "Core" };
  if (token.commitment === "source-only")
    return { cls: "pill-source-only", label: "Source-only" };
  return { cls: "pill-extended", label: "Extended" };
}

export default function TokenChainSelector({
  selectedChainId,
  selectedTokenSymbol,
  onChainChange,
  onTokenChange,
}: Props) {
  const [chainOpen, setChainOpen] = useState(false);
  const [tokenOpen, setTokenOpen] = useState(false);
  const [tokenQuery, setTokenQuery] = useState("");

  const selectedChain = CHAINS.find((c) => c.id === selectedChainId)!;
  const selectedToken = TOKENS.find((t) => t.symbol === selectedTokenSymbol)!;

  const tokensOnChain = useMemo(
    () => TOKENS.filter((t) => t.chains.includes(selectedChainId)),
    [selectedChainId],
  );

  const filteredTokens = useMemo(() => {
    const q = tokenQuery.trim().toLowerCase();
    if (!q) return tokensOnChain;
    return tokensOnChain.filter(
      (t) =>
        t.symbol.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q),
    );
  }, [tokensOnChain, tokenQuery]);

  const handleChainSelect = (c: Chain) => {
    onChainChange(c.id);
    const compatibleTokens = TOKENS.filter((t) => t.chains.includes(c.id));
    if (compatibleTokens.length > 0) {
      const currentStillValid = compatibleTokens.find(
        (t) => t.symbol === selectedTokenSymbol,
      );
      if (!currentStillValid) onTokenChange(compatibleTokens[0].symbol);
    }
    setChainOpen(false);
  };

  const assetMeta = ASSET_CLASS_META[selectedToken.assetClass];
  const pill = commitmentPill(selectedToken);

  return (
    <div className="glass-card p-5">
      <h2 className="mb-4 flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-wider text-muted">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
        Select Source
      </h2>

      <div className="space-y-4">
        <div className="relative">
          <label className="mb-1.5 block text-xs font-medium text-muted">
            Source Chain
          </label>
          <button
            onClick={() => {
              setChainOpen(!chainOpen);
              setTokenOpen(false);
            }}
            className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3 text-left transition-colors hover:bg-white/[0.08]"
            aria-expanded={chainOpen}
          >
            <span className="flex items-center gap-2.5">
              <span
                className="inline-block h-5 w-5 rounded-full border border-white/20"
                style={{ backgroundColor: selectedChain.color }}
                aria-hidden
              />
              <span className="font-medium">{selectedChain.name}</span>
              <span className="font-mono text-xs text-muted">
                {selectedChain.shortCode}
              </span>
            </span>
            <ChevronDown
              className={clsx(
                "h-4 w-4 text-muted transition-transform",
                chainOpen && "rotate-180",
              )}
            />
          </button>

          {chainOpen && (
            <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-72 overflow-auto rounded-xl border border-white/10 bg-surface-elevated p-1 shadow-card scrollbar-thin">
              {CHAINS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleChainSelect(c)}
                  className={clsx(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-white/5",
                    c.id === selectedChainId && "bg-accent/10 text-accent",
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="inline-block h-4 w-4 rounded-full border border-white/20"
                      style={{ backgroundColor: c.color }}
                      aria-hidden
                    />
                    <span>{c.name}</span>
                  </span>
                  <span className="font-mono text-xs text-muted">
                    {c.family === "non-evm" ? "Non-EVM" : "EVM"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <label className="mb-1.5 block text-xs font-medium text-muted">
            Source Token
          </label>
          <button
            onClick={() => {
              setTokenOpen(!tokenOpen);
              setChainOpen(false);
              setTokenQuery("");
            }}
            className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3 text-left transition-colors hover:bg-white/[0.08]"
            aria-expanded={tokenOpen}
          >
            <span className="flex items-center gap-2.5">
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full border border-white/20 font-mono text-[10px] font-bold"
                style={{
                  backgroundColor: assetMeta.color + "30",
                  color: assetMeta.color,
                }}
                aria-hidden
              >
                {selectedToken.symbol.slice(0, 2)}
              </span>
              <span className="font-medium">{selectedToken.symbol}</span>
              <span className="text-xs text-muted">{selectedToken.name}</span>
            </span>
            <ChevronDown
              className={clsx(
                "h-4 w-4 text-muted transition-transform",
                tokenOpen && "rotate-180",
              )}
            />
          </button>

          {tokenOpen && (
            <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-xl border border-white/10 bg-surface-elevated p-1.5 shadow-card">
              <div className="relative mb-1">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  placeholder="Search token..."
                  value={tokenQuery}
                  onChange={(e) => setTokenQuery(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black/20 py-1.5 pl-8 pr-7 text-sm outline-none placeholder:text-muted focus:border-accent/50"
                  autoFocus
                />
                {tokenQuery && (
                  <button
                    onClick={() => setTokenQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                    aria-label="清除搜索"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-auto scrollbar-thin">
                {filteredTokens.length === 0 ? (
                  <div className="px-3 py-6 text-center text-xs text-muted">
                    该链上暂无支持的 Token
                  </div>
                ) : (
                  filteredTokens.map((t) => {
                    const meta = ASSET_CLASS_META[t.assetClass];
                    return (
                      <button
                        key={t.symbol}
                        onClick={() => {
                          onTokenChange(t.symbol);
                          setTokenOpen(false);
                        }}
                        className={clsx(
                          "flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-white/5",
                          t.symbol === selectedTokenSymbol &&
                            "bg-accent/10 text-accent",
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className="flex h-5 w-5 items-center justify-center rounded-full font-mono text-[9px] font-bold"
                            style={{
                              backgroundColor: meta.color + "30",
                              color: meta.color,
                            }}
                            aria-hidden
                          >
                            {t.symbol.slice(0, 2)}
                          </span>
                          <span className="font-medium text-sm">{t.symbol}</span>
                          <span className="text-[11px] text-muted">
                            {t.name}
                          </span>
                        </span>
                        <span
                          className="text-[10px] font-medium"
                          style={{ color: meta.color }}
                        >
                          {meta.label}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-2 space-y-2 rounded-xl border border-white/5 bg-black/20 p-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted">Asset Class</span>
            <span className="font-medium" style={{ color: assetMeta.color }}>
              {assetMeta.label}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted">Commitment</span>
            <span className={`pill ${pill.cls}`}>{pill.label}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted">Final Ledger</span>
            <span className="font-mono text-foreground">
              {selectedToken.finalAccount === "self"
                ? selectedToken.symbol
                : selectedToken.finalAccount}
            </span>
          </div>
          <p className="pt-1 text-[11px] leading-relaxed text-muted">
            {selectedToken.description}
          </p>
        </div>
      </div>
    </div>
  );
}
