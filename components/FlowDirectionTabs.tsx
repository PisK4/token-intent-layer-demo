"use client";

import {
  ArrowDownToLine,
  ArrowUpFromLine,
  BotMessageSquare,
  Sparkles,
  Target,
  Scan,
  type LucideIcon,
} from "lucide-react";
import clsx from "clsx";
import type { Direction } from "@/lib/types";

// 一级叙事开关：把 Direction 切换从 Header 右上角小 segmented 升级为
// 贯通全宽的大号 tab 条，放在 Header 与 StatsStrip 之间。
// 颜色语义与 Sankey banner / WithdrawFlowStrip 保持一致：
//   Deposit → 绿色 (#22C55E)
//   Withdraw → 琥珀 (#F59E0B)

interface TabConfig {
  id: Direction;
  icon: LucideIcon;
  badgeIcon: LucideIcon;
  title: string;
  subtitle: string;
  hint: string;
  accent: string;
}

const TABS: TabConfig[] = [
  {
    id: "deposit",
    icon: ArrowDownToLine,
    badgeIcon: Target,
    title: "Deposit",
    subtitle: "Source Chain → EdgeX",
    hint: "多链多 Token · 一键快速入金",
    accent: "#22C55E",
  },
  {
    id: "withdraw",
    icon: ArrowUpFromLine,
    badgeIcon: Sparkles,
    title: "Withdraw",
    subtitle: "EdgeX → Target Chain",
    hint: "提现任意链 · 智能选路 + 流动性兜底",
    accent: "#F59E0B",
  },
  {
    id: "ask-ai",
    icon: BotMessageSquare,
    badgeIcon: Scan,
    title: "Ask AI",
    subtitle: "Wallet Intelligence",
    hint: "扫描钱包 · 发现 Dust + Yield · 一键优化",
    accent: "#06B6D4",
  },
];

interface Props {
  direction: Direction;
  onDirectionChange: (dir: Direction) => void;
}

export default function FlowDirectionTabs({
  direction,
  onDirectionChange,
}: Props) {
  return (
    <div className="mb-5">
      <div className="mb-2 flex items-center gap-2 px-1">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
          Flow Direction
        </span>
        <span className="h-px flex-1 bg-white/5" />
        <span className="text-[10px] text-muted/70">
          切换方向将级联更新 Selector / Sankey / Route Details
        </span>
      </div>

      <div
        role="tablist"
        aria-label="Flow direction"
        className="grid grid-cols-1 gap-2 md:grid-cols-3 md:gap-3"
      >
        {TABS.map((t) => {
          const active = direction === t.id;
          const Icon = t.icon;
          const BadgeIcon = t.badgeIcon;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={active}
              onClick={() => onDirectionChange(t.id)}
              className={clsx(
                "group relative flex items-center gap-3 overflow-hidden rounded-2xl border px-4 py-3 text-left transition-all duration-200 md:gap-4 md:px-5 md:py-3.5",
                active
                  ? "shadow-glow ring-2"
                  : "border-white/10 bg-white/[0.03] hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.05]",
              )}
              style={
                active
                  ? {
                      backgroundColor: t.accent + "18",
                      borderColor: t.accent + "80",
                      boxShadow: `0 0 26px ${t.accent}30, inset 0 0 0 1px ${t.accent}40`,
                    }
                  : undefined
              }
            >
              {active && (
                <span
                  className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full opacity-40 blur-2xl"
                  style={{ backgroundColor: t.accent }}
                  aria-hidden
                />
              )}

              <span
                className={clsx(
                  "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors md:h-11 md:w-11",
                  !active && "bg-white/[0.06] text-muted",
                )}
                style={
                  active
                    ? {
                        backgroundColor: t.accent + "25",
                        color: t.accent,
                        boxShadow: `inset 0 0 0 1px ${t.accent}60`,
                      }
                    : undefined
                }
              >
                <Icon className="h-5 w-5" />
              </span>

              <div className="relative min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span
                    className={clsx(
                      "font-display text-base font-bold tracking-tight md:text-lg",
                      active ? "text-foreground" : "text-muted",
                    )}
                    style={active ? { color: t.accent } : undefined}
                  >
                    {t.title}
                  </span>
                  <span
                    className={clsx(
                      "font-mono text-[11px] md:text-xs",
                      active ? "text-foreground/70" : "text-muted/60",
                    )}
                  >
                    {t.subtitle}
                  </span>
                </div>
                <div
                  className={clsx(
                    "mt-0.5 flex items-center gap-1.5 text-[11px] leading-snug md:text-xs",
                    active ? "text-foreground/80" : "text-muted/70",
                  )}
                >
                  <BadgeIcon
                    className="h-3 w-3 shrink-0"
                    style={active ? { color: t.accent } : undefined}
                  />
                  <span className="truncate">{t.hint}</span>
                </div>
              </div>

              <span
                className={clsx(
                  "relative hidden shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-opacity md:inline-flex",
                  active ? "opacity-100" : "opacity-0 group-hover:opacity-60",
                )}
                style={
                  active
                    ? {
                        color: t.accent,
                        backgroundColor: t.accent + "20",
                        border: `1px solid ${t.accent}55`,
                      }
                    : {
                        color: "#94a3b8",
                        backgroundColor: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }
                }
              >
                {active ? "Active" : "Switch"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
