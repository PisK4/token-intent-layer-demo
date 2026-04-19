"use client";

import { ArrowDownToLine, ArrowUpFromLine, Sparkles } from "lucide-react";
import clsx from "clsx";
import type { Direction } from "@/lib/types";

interface Props {
  direction: Direction;
  onDirectionChange: (dir: Direction) => void;
}

export default function Header({ direction, onDirectionChange }: Props) {
  return (
    <header className="flex flex-col gap-4 pb-6 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-blue-500 shadow-glow">
          <Sparkles className="h-5 w-5 text-slate-900" />
        </div>
        <div>
          <h1 className="font-display text-xl font-bold tracking-tight text-foreground md:text-2xl">
            EdgeX <span className="text-gradient-accent">Intent Layer</span>
          </h1>
          <p className="text-xs text-muted md:text-sm">
            任意链任意 Token → EdgeX 可接收、可解释、可提现的核心资产路径
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="pill pill-core">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
          Demo Mode
        </div>

        <div className="inline-flex rounded-xl border border-white/10 bg-white/5 p-1">
          <button
            onClick={() => onDirectionChange("deposit")}
            className={clsx(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200",
              direction === "deposit"
                ? "bg-accent text-slate-900 shadow-glow"
                : "text-muted hover:text-foreground",
            )}
            aria-pressed={direction === "deposit"}
          >
            <ArrowDownToLine className="h-4 w-4" />
            Deposit
          </button>
          <button
            onClick={() => onDirectionChange("withdraw")}
            className={clsx(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200",
              direction === "withdraw"
                ? "bg-accent text-slate-900 shadow-glow"
                : "text-muted hover:text-foreground",
            )}
            aria-pressed={direction === "withdraw"}
          >
            <ArrowUpFromLine className="h-4 w-4" />
            Withdraw
          </button>
        </div>
      </div>
    </header>
  );
}
