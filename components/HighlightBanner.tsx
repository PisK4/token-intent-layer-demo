"use client";

import {
  Compass,
  Zap,
  Target,
  Globe,
  RotateCcw,
  Shuffle,
  type LucideIcon,
} from "lucide-react";

interface Highlight {
  icon: LucideIcon;
  accent: string;
  title: string;
  body: string;
}

const HIGHLIGHTS: Highlight[] = [
  {
    icon: Compass,
    accent: "#0EA5E9",
    title: "智能推荐 + Solver 兜底",
    body: "系统根据提现 Token 实时推荐流动性充足的目标链；若主动选择库存不足的链，自动调度 Solver 网络跨链搬运流动性完成交付",
  },
  {
    icon: Zap,
    accent: "#A855F7",
    title: "OFT Rebalancing 零价格冲击",
    body: "Omnichain 资产（ENA / AAVE / LINK）享 LayerZero OFT 再平衡通道；零冲击、无 MEV、不经过 Solver 网络",
  },
  {
    icon: Target,
    accent: "#22C55E",
    title: "按真实汇率归一化入账",
    body: "Yield Collateral 按源链实时汇率兑换为核心资产 — 例如 1 stETH ≈ 1.1 ETH（累积质押收益）；Long-tail / Dust 同路径归一化为 USDC / ETH / SOL",
  },
  {
    icon: Globe,
    accent: "#F59E0B",
    title: "Non-EVM 一等公民",
    body: "Solana / Aptos / Sui 经 Wormhole 桥接直通 EVM Vault；jitoSOL / mSOL 打开 SOL 第三核心终态",
  },
  {
    icon: RotateCcw,
    accent: "#F97316",
    title: "Source-only 源链闭环",
    body: "ONDO / BGB / JUP 等单链资产原 Token 进出，入金链 = 提现链，不强制跨链也不依赖 solver 补位",
  },
  {
    icon: Shuffle,
    accent: "#EC4899",
    title: "Intent Gateway 多协议 Fallback",
    body: "UniswapX / CoW / 1inch / deBridge / Mayan 主 / 备 / 应急三级兜底；不自建 solver network",
  },
];

export default function HighlightBanner() {
  return (
    <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2">
      {HIGHLIGHTS.map((h) => {
        const Icon = h.icon;
        return (
          <div
            key={h.title}
            className="glass-card relative overflow-hidden p-4"
          >
            <div
              className="absolute inset-y-0 left-0 w-1"
              style={{ backgroundColor: h.accent }}
              aria-hidden
            />
            <div className="flex gap-3 pl-2">
              <span
                className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                style={{
                  backgroundColor: h.accent + "20",
                  color: h.accent,
                }}
                aria-hidden
              >
                <Icon className="h-4 w-4" />
              </span>
              <div className="flex-1">
                <div
                  className="text-sm font-semibold"
                  style={{ color: h.accent }}
                >
                  {h.title}
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-muted">
                  {h.body}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
