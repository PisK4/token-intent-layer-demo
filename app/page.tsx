"use client";

import { useMemo, useState } from "react";
import Header from "@/components/Header";
import TokenChainSelector from "@/components/TokenChainSelector";
import SwapInterface from "@/components/SwapInterface";
import SankeyDiagram from "@/components/SankeyDiagram";
import PathDetailCard from "@/components/PathDetailCard";
import { planRoute } from "@/lib/route-planner";
import type { Direction } from "@/lib/types";

export default function Home() {
  const [direction, setDirection] = useState<Direction>("deposit");
  const [chainId, setChainId] = useState("ethereum");
  const [tokenSymbol, setTokenSymbol] = useState("stETH");
  const [stockSufficient, setStockSufficient] = useState(true);
  const [highlightVersion, setHighlightVersion] = useState(0);

  const plan = useMemo(
    () => planRoute(tokenSymbol, chainId, direction, stockSufficient),
    [tokenSymbol, chainId, direction, stockSufficient],
  );

  const onPreview = () => setHighlightVersion((v) => v + 1);

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1440px] px-4 py-6 md:px-8 md:py-10">
      <Header direction={direction} onDirectionChange={setDirection} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(360px,420px)_1fr]">
        <aside className="flex flex-col gap-5">
          <TokenChainSelector
            selectedChainId={chainId}
            selectedTokenSymbol={tokenSymbol}
            onChainChange={setChainId}
            onTokenChange={setTokenSymbol}
          />
          <SwapInterface
            direction={direction}
            tokenSymbol={tokenSymbol}
            chainId={chainId}
            stockSufficient={stockSufficient}
            onToggleStock={() => setStockSufficient((s) => !s)}
            onPreview={onPreview}
          />
          <PathDetailCard plan={plan} />
        </aside>

        <section className="min-h-[640px]">
          <SankeyDiagram
            direction={direction}
            highlightTokenSymbol={tokenSymbol}
            highlightChainId={chainId}
            highlightVersion={highlightVersion}
          />
        </section>
      </div>

      <footer className="mt-10 border-t border-white/5 pt-5 text-center text-[11px] text-muted">
        EdgeX Intent Layer Demo · 仅用于方案演示，不代表生产实现
      </footer>
    </main>
  );
}
