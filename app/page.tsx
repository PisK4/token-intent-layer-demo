"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import TokenChainSelector from "@/components/TokenChainSelector";
import SwapInterface from "@/components/SwapInterface";
import SankeyDiagram from "@/components/SankeyDiagram";
import PathDetailCard from "@/components/PathDetailCard";
import BubbleUniverse from "@/components/BubbleUniverse";
import { planRoute } from "@/lib/route-planner";
import { TOKENS, TOKEN_MAP, isWithdrawable } from "@/lib/data-loader";
import type { Direction } from "@/lib/types";

export default function Home() {
  const [direction, setDirection] = useState<Direction>("deposit");
  const [chainId, setChainId] = useState("ethereum");
  const [tokenSymbol, setTokenSymbol] = useState("stETH");
  const [stockSufficient, setStockSufficient] = useState(true);
  const [highlightVersion, setHighlightVersion] = useState(0);

  // 切到 Withdraw 时若当前 token 不可提现，自动 fallback 到该链上首个可提现 token（优先 USDC）
  useEffect(() => {
    if (direction !== "withdraw") return;
    const current = TOKENS.find((t) => t.symbol === tokenSymbol);
    if (current && current.chains.includes(chainId) && isWithdrawable(current)) return;

    const candidatesOnChain = TOKENS.filter(
      (t) => t.chains.includes(chainId) && isWithdrawable(t),
    );
    if (candidatesOnChain.length > 0) {
      const usdc = candidatesOnChain.find((t) => t.symbol === "USDC");
      setTokenSymbol((usdc ?? candidatesOnChain[0]).symbol);
      return;
    }
    // 极端情况：当前链在 Withdraw 下无任何可提现 token → 回退到 Ethereum + USDC
    setChainId("ethereum");
    setTokenSymbol("USDC");
  }, [direction, chainId, tokenSymbol]);

  const plan = useMemo(
    () => planRoute(tokenSymbol, chainId, direction, stockSufficient),
    [tokenSymbol, chainId, direction, stockSufficient],
  );

  const onPreview = () => setHighlightVersion((v) => v + 1);

  // Bubble Universe 点击一个 token → 若当前链不支持则切到首个支持链；并触发 Sankey 高亮脉冲
  const onSelectTokenFromBubble = useCallback(
    (symbol: string) => {
      const t = TOKEN_MAP[symbol];
      if (!t) return;
      setTokenSymbol(symbol);
      if (!t.chains.includes(chainId)) {
        setChainId(t.chains[0]);
      }
      setHighlightVersion((v) => v + 1);
    },
    [chainId],
  );

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1440px] px-4 py-6 md:px-8 md:py-10">
      <Header direction={direction} onDirectionChange={setDirection} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(360px,420px)_1fr]">
        <aside className="flex flex-col gap-5">
          <TokenChainSelector
            direction={direction}
            selectedChainId={chainId}
            selectedTokenSymbol={tokenSymbol}
            onChainChange={setChainId}
            onTokenChange={setTokenSymbol}
          />
          <PathDetailCard plan={plan} />
          <SwapInterface
            direction={direction}
            tokenSymbol={tokenSymbol}
            chainId={chainId}
            stockSufficient={stockSufficient}
            onToggleStock={() => setStockSufficient((s) => !s)}
            onPreview={onPreview}
          />
        </aside>

        <section className="flex min-h-[640px] flex-col gap-5">
          <SankeyDiagram
            direction={direction}
            highlightTokenSymbol={tokenSymbol}
            highlightChainId={chainId}
            highlightVersion={highlightVersion}
          />
          <BubbleUniverse
            direction={direction}
            selectedTokenSymbol={tokenSymbol}
            onSelectToken={onSelectTokenFromBubble}
          />
        </section>
      </div>

      <footer className="mt-10 border-t border-white/5 pt-5 text-center text-[11px] text-muted">
        EdgeX Intent Layer Demo · 仅用于方案演示，不代表生产实现
      </footer>
    </main>
  );
}
