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
import clsx from "clsx";

interface Highlight {
  icon: LucideIcon;
  accent: string;
  title: string;
  body: string;
  emphasize?: boolean;
}

// 方案 v4.6 六大能力全量展示，不折叠。
// 前 3 张 emphasize（带 glow）对应方案三支柱：
//   1. 提现智能推荐 + Solver 兜底（withdraw 场景，Demo 技术高潮）
//   2. OFT Rebalancing 独立调度通道（与 Solver 并列，不占 Solver 流动性）
//   3. 收益型资产归一化入金（deposit 场景，按源链实时汇率）
// 后 3 张是支撑性能力：Non-EVM / Source-only / Intent Gateway Fallback
const HIGHLIGHTS: Highlight[] = [
  {
    icon: Compass,
    accent: "#0EA5E9",
    title: "智能推荐提现路径 + Solver 网络流动性搬运",
    body: "提现路径三段式：User Intent → Liquidity Check → Direct / Solver / OFT / Blocked。系统根据目标链库存实时推荐流动性充足的链；若选中链库存不足，Solver 自动从流动性充足的链跨链调度资产补给目标链完成交付。",
    emphasize: true,
  },
  {
    icon: Zap,
    accent: "#A855F7",
    title: "Omnichain Token Rebalancing · 不经过 Solver 网络",
    body: "Omnichain 资产（ENA / AAVE / LINK / EDGE / MARU）享 LayerZero OFT 再平衡通道 — 与 Solver 网络并列、零价格冲击、无 MEV 的独立调度通道，不占用 Solver 流动性。",
    emphasize: true,
  },
  {
    icon: Target,
    accent: "#22C55E",
    title: "收益型资产入金路径",
    body: "Yield Collateral 在源链按实时汇率兑换为核心资产 — 例如 1 stETH ≈ 1.1 ETH（累积质押收益）、1 aUSDC ≈ 1.08 USDC。Long-tail / Dust 同路径归一化；EdgeX Ledger 最终收敛到 USDC / ETH / SOL 三核心终态。",
    emphasize: true,
  },
  {
    icon: Globe,
    accent: "#F59E0B",
    title: "支持 Non-EVM 链资产入金",
    body: "Solana / Aptos / Sui 经 Wormhole 桥接直通 EVM Vault；Solana USDC 通过 CCTP 原生直达；jitoSOL / mSOL 使用 SOL 路径存入。",
  },
  {
    icon: RotateCcw,
    accent: "#F97316",
    title: "支持单链部署叙事 Token 入金",
    body: "ONDO / BGB / JUP / CAKE 等单链资产原 Token 进出；入金链 = 提现链；库存 = 入金累积；库存不足时无 Solver 兜底 — 是方案口径，不是 Bug。",
  },
  {
    icon: Shuffle,
    accent: "#EC4899",
    title: "集成多种流动性平衡/搬运通道",
    body: "EdgeX 自建 Token Router + Intent Gateway；通过外部协议（意图匹配网络 + DEX 聚合器） UniswapX / CoW / 1inch / deBridge / Mayan 组合，主 / 备 / 应急三级兜底。",
  },
];

function HighlightCard({ h }: { h: Highlight }) {
  const Icon = h.icon;
  return (
    <div
      className={clsx(
        "glass-card relative overflow-hidden p-4 transition-all duration-200",
        h.emphasize && "ring-1 ring-white/5",
      )}
    >
      <div
        className="absolute inset-y-0 left-0 w-1"
        style={{ backgroundColor: h.accent }}
        aria-hidden
      />
      {h.emphasize && (
        <div
          className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full opacity-20 blur-2xl"
          style={{ backgroundColor: h.accent }}
          aria-hidden
        />
      )}
      <div className="relative flex gap-3 pl-2">
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
            className="text-sm font-semibold leading-snug"
            style={{ color: h.accent }}
          >
            {h.title}
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-muted">{h.body}</p>
        </div>
      </div>
    </div>
  );
}

export default function HighlightBanner() {
  return (
    <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
      {HIGHLIGHTS.map((h) => (
        <HighlightCard key={h.title} h={h} />
      ))}
    </div>
  );
}
