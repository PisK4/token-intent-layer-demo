"use client";

import {
  User,
  GitFork,
  Check,
  Zap,
  RotateCw,
  Lock,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import clsx from "clsx";

// 方案 v4.6 强调：所有 withdraw 路径都是三段式：
// User Intent → Liquidity Check (decision) → 分支执行
// 这是 Demo 技术高潮，必须视觉化展示。
// 布局：横跨全宽放在 HighlightBanner 下方（仅 withdraw 模式显示），
// 以横向 5 列 grid 展示 branch，高度压缩到最低以不挤压 Sankey。
interface Branch {
  icon: LucideIcon;
  label: string;
  sublabel: string;
  color: string;
  emphasize?: boolean;
}

const BRANCHES: Branch[] = [
  {
    icon: Check,
    label: "Canonical Direct",
    sublabel: "CCTP · USDC",
    color: "#3B82F6",
  },
  {
    icon: Check,
    label: "Vault Direct",
    sublabel: "库存充足 · 同资产",
    color: "#22C55E",
    emphasize: true,
  },
  {
    icon: Zap,
    label: "Solver Fill",
    sublabel: "Native / Routable · 跨链买入",
    color: "#F59E0B",
    emphasize: true,
  },
  {
    icon: RotateCw,
    label: "OFT Rebalance",
    sublabel: "Omnichain · 不经过 Solver",
    color: "#A855F7",
    emphasize: true,
  },
  {
    icon: Lock,
    label: "Source-only Blocked",
    sublabel: "库存不足 · 无 Solver 补位",
    color: "#F97316",
  },
];

export default function WithdrawFlowStrip() {
  return (
    <div className="glass-card relative p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-amber-400">
            <GitFork className="h-3 w-3" />
            Withdraw Flow
          </span>
          <span className="font-display text-sm font-semibold">
            三段式路由决策
          </span>
        </div>
        <span className="text-[11px] text-muted">
          User Intent → Liquidity Check → Branch Execution
        </span>
      </div>

      <div className="flex flex-col gap-2 md:flex-row md:items-stretch md:gap-2">
        {/* Step 1: User Intent */}
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 md:w-[200px] md:min-h-[96px] md:flex-col md:items-start md:justify-center md:px-3.5 md:py-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent">
            <User className="h-4 w-4" />
          </span>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-accent">
              Step 1
            </div>
            <div className="mt-0.5 text-sm font-semibold">User Intent</div>
            <div className="mt-0.5 text-[11px] leading-snug text-muted">
              声明 Withdraw Token + Target Chain
            </div>
          </div>
        </div>

        <ArrowRight className="hidden h-4 w-4 shrink-0 self-center text-muted md:block" />

        {/* Step 2: Liquidity Check (emphasized as Demo 技术高潮) */}
        <div className="relative flex items-center gap-3 overflow-hidden rounded-xl border border-sky-500/50 bg-sky-500/[0.08] px-3 py-2.5 shadow-[0_0_22px_rgba(14,165,233,0.18)] md:w-[210px] md:min-h-[96px] md:flex-col md:items-start md:justify-center md:px-3.5 md:py-3">
          <div
            className="pointer-events-none absolute -right-4 -top-4 h-14 w-14 rounded-full bg-sky-500/25 blur-2xl"
            aria-hidden
          />
          <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400 ring-1 ring-sky-500/40">
            <GitFork className="h-4 w-4" />
          </span>
          <div className="relative">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-sky-400">
              Step 2 · Decision
            </div>
            <div className="mt-0.5 text-sm font-bold text-sky-100">
              Liquidity Check
            </div>
            <div className="mt-0.5 text-[11px] leading-snug text-muted">
              检查目标链库存是否充足
            </div>
          </div>
        </div>

        <ArrowRight className="hidden h-4 w-4 shrink-0 self-center text-muted md:block" />

        {/* Step 3: Branch Execution — 全宽下 grid-cols-5 一行展开 */}
        <div className="flex flex-1 flex-col rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-2.5 md:min-h-[96px] md:py-3">
          <div className="mb-1.5 flex items-center gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
              Step 3 · Branch Execution
            </span>
          </div>
          <div className="grid flex-1 grid-cols-2 content-center gap-1.5 md:grid-cols-5">
            {BRANCHES.map((b) => {
              const Icon = b.icon;
              return (
                <span
                  key={b.label}
                  className={clsx(
                    "inline-flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-[11px] leading-tight transition-colors",
                    b.emphasize && "font-semibold",
                  )}
                  style={{
                    borderColor: b.color + (b.emphasize ? "60" : "30"),
                    backgroundColor: b.color + (b.emphasize ? "18" : "10"),
                    color: b.color,
                  }}
                  title={b.sublabel}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{b.label}</span>
                </span>
              );
            })}
          </div>
        </div>
      </div>

      <p className="mt-3 px-1 text-[10px] leading-relaxed text-muted">
        <span className="font-semibold text-foreground">叙事关键点：</span>
        {" "}
        Omnichain 资产走 OFT Rebalancing 通道（与 Solver 网络并列、不经过 Solver）；
        Source-only 资产库存不足时无 Solver 补位，这是方案口径，不是 Bug。
      </p>
    </div>
  );
}
