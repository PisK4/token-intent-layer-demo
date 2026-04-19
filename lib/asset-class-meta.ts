import type { AssetClass } from "./types";

// Visual/semantic metadata for asset classifications.
// Kept as TS (not JSON) because it's UI styling, not business data.
export const ASSET_CLASS_META: Record<
  AssetClass,
  { label: string; color: string; description: string }
> = {
  canonical: {
    label: "Canonical Settlement",
    color: "#3B82F6",
    description: "USDC 规范结算资产，走 CCTP 通道",
  },
  native: {
    label: "Native Asset",
    color: "#22C55E",
    description:
      "ETH / BTC / SOL 原生资产；Vault 直接交付，库存不足时 solver 跨链 fill",
  },
  omnichain: {
    label: "Omnichain Standard",
    color: "#06B6D4",
    description:
      "OFT/NTT 互通资产（ENA / AAVE / LINK）；库存不足走跨链协议再平衡，不走 Solver",
  },
  yield: {
    label: "Yield Collateral",
    color: "#A855F7",
    description: "stETH / aUSDC 等收益型资产，源链归一化",
  },
  routable: {
    label: "Routable Asset",
    color: "#F59E0B",
    description:
      "UNI / PEPE / WBTC 等原 Token 进出；目标链库存不足时 solver 跨链调度",
  },
  "source-only": {
    label: "Source-only",
    color: "#F97316",
    description: "ONDO / BGB 源链闭环，库存 = 入金累积",
  },
  "long-tail": {
    label: "Long-tail / Dust",
    color: "#EC4899",
    description: "低流动性 token，归一化为 USDC/ETH",
  },
};
