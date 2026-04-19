"use client";

import { CircleCheck, CircleAlert, GitFork, ArrowRight, Route } from "lucide-react";
import clsx from "clsx";
import { RAIL_META } from "@/lib/data-loader";
import { ASSET_CLASS_META } from "@/lib/asset-class-meta";
import type { RoutePlan } from "@/lib/types";

interface Props {
  plan: RoutePlan | null;
}

export default function PathDetailCard({ plan }: Props) {
  if (!plan) {
    return (
      <div className="glass-card p-5">
        <h2 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-wider text-muted">
          <Route className="h-3.5 w-3.5" />
          Route Details
        </h2>
        <p className="text-xs text-muted">
          选择 Chain 与 Token 后，此处显示完整路径步骤。
        </p>
      </div>
    );
  }

  const railMeta = RAIL_META[plan.rail];
  const assetMeta = ASSET_CLASS_META[plan.sourceToken.assetClass];

  return (
    <div className="glass-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-wider text-muted">
          <Route className="h-3.5 w-3.5" />
          Route Details
        </h2>
        <span
          className="pill"
          style={{
            backgroundColor: railMeta.color + "20",
            color: railMeta.color,
            borderColor: railMeta.color + "50",
            border: "1px solid",
          }}
        >
          {railMeta.label}
        </span>
      </div>

      <div className="mb-4 flex items-center gap-2 text-sm">
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: plan.sourceChain.color }}
          />
          <span className="font-medium">{plan.sourceChain.name}</span>
        </div>
        <ArrowRight className="h-3.5 w-3.5 text-muted" />
        <span className="font-mono text-xs" style={{ color: assetMeta.color }}>
          {plan.sourceToken.symbol}
        </span>
        <ArrowRight className="h-3.5 w-3.5 text-muted" />
        <span className="font-mono text-xs text-accent">
          {plan.targetAccount}
        </span>
      </div>

      <ol className="space-y-3">
        {plan.steps.map((step, i) => {
          const isFallback = step.status === "fallback";
          const isDecision = step.status === "decision";
          const Icon = isFallback
            ? CircleAlert
            : isDecision
              ? GitFork
              : CircleCheck;
          return (
            <li
              key={i}
              className="relative flex gap-3 pl-1"
            >
              {i < plan.steps.length - 1 && (
                <span
                  className={clsx(
                    "absolute left-[14px] top-6 h-[calc(100%_-_8px)] w-px",
                    isFallback && "bg-amber-500/30",
                    isDecision && "bg-sky-500/30",
                    !isFallback && !isDecision && "bg-white/10",
                  )}
                  style={{
                    backgroundImage: isFallback
                      ? "linear-gradient(to bottom, #F59E0B 33%, transparent 33%)"
                      : isDecision
                        ? "linear-gradient(to bottom, #0EA5E9 33%, transparent 33%)"
                        : undefined,
                    backgroundSize:
                      isFallback || isDecision ? "1px 6px" : undefined,
                  }}
                />
              )}
              <div
                className={clsx(
                  "relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border",
                  isFallback &&
                    "border-amber-500/40 bg-amber-500/10 text-amber-400",
                  isDecision &&
                    "border-sky-500/40 bg-sky-500/10 text-sky-400",
                  !isFallback &&
                    !isDecision &&
                    "border-accent/40 bg-accent/10 text-accent",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 pb-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {step.label}
                  </span>
                  {step.protocol && (
                    <span className="rounded-md bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-muted">
                      {step.protocol}
                    </span>
                  )}
                  {isFallback && (
                    <span className="pill pill-source-only">fallback</span>
                  )}
                  {isDecision && (
                    <span className="pill pill-check">check</span>
                  )}
                </div>
                <p className="mt-0.5 text-[11px] leading-relaxed text-muted">
                  {step.detail}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      {plan.note && (
        <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
          <p className="text-[11px] leading-relaxed text-amber-200/90">
            <span className="font-semibold">Note · </span>
            {plan.note}
          </p>
        </div>
      )}
    </div>
  );
}
