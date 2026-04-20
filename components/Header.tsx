"use client";

import { Sparkles } from "lucide-react";

// Direction toggle 已抽离到 components/FlowDirectionTabs.tsx（一级叙事开关）；
// Header 只保留品牌区 + Demo Mode 标记，避免视觉权重争夺。
export default function Header() {
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
      </div>
    </header>
  );
}
