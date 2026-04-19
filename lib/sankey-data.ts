import { CHAINS, TOKENS, RAIL_META, isWithdrawable } from "./data-loader";
import { ASSET_CLASS_META } from "./asset-class-meta";
import type { Direction, SankeyLink, SankeyNode, Token } from "./types";

interface SankeyDataset {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

// 方向决定 node 的水平位置：
// - Deposit : Chain(0)  → AssetClass(1) → Rail(2) → Ledger(3)
// - Withdraw: Ledger(0) → Rail(1)       → AssetClass(2) → Chain(3)
function depthOf(
  kind: "chain" | "asset" | "rail" | "ledger",
  direction: Direction,
): number {
  if (direction === "deposit") {
    return { chain: 0, asset: 1, rail: 2, ledger: 3 }[kind];
  }
  return { ledger: 0, rail: 1, asset: 2, chain: 3 }[kind];
}

const LEDGER_ACCOUNTS = ["USDC @ EdgeX", "ETH @ EdgeX", "Token-as-is @ EdgeX"];

const FINAL_LEDGER_MAP: Record<string, string> = {
  USDC: "USDC @ EdgeX",
  ETH: "ETH @ EdgeX",
  SOL: "Token-as-is @ EdgeX",
  self: "Token-as-is @ EdgeX",
};

function primaryRail(token: Token): string {
  return token.rails[0];
}

export function buildSankeyData(direction: Direction): SankeyDataset {
  const nodes: SankeyNode[] = [];
  const links: SankeyLink[] = [];
  const nodeSet = new Set<string>();

  const addNode = (name: string, color?: string, depth?: number) => {
    if (nodeSet.has(name)) return;
    nodeSet.add(name);
    nodes.push({
      name,
      depth,
      itemStyle: color ? { color } : undefined,
    });
  };

  const addLink = (
    source: string,
    target: string,
    value: number,
    color?: string,
  ) => {
    links.push({
      source,
      target,
      value,
      lineStyle: color ? { color, opacity: 0.45 } : { opacity: 0.35 },
    });
  };

  // Weight heuristic: canonical + native assets get larger flow
  const weightFor = (token: Token, chainCount: number): number => {
    const base =
      token.assetClass === "canonical"
        ? 30
        : token.assetClass === "native"
          ? 20
          : token.assetClass === "omnichain"
            ? 10
            : token.assetClass === "yield"
              ? 8
              : token.assetClass === "routable"
                ? 6
                : token.assetClass === "source-only"
                  ? 4
                  : 3;
    return Math.max(2, base / chainCount);
  };

  // Build source chain -> asset class -> rail -> ledger
  // Withdraw 模式下跳过不可提现的 token（stETH / aUSDC / Long-tail 等归一化资产）
  for (const token of TOKENS) {
    if (direction === "withdraw" && !isWithdrawable(token)) continue;

    const assetMeta = ASSET_CLASS_META[token.assetClass];
    const assetNode = assetMeta.label;
    addNode(assetNode, assetMeta.color, depthOf("asset", direction));

    const rail = primaryRail(token);
    const railMeta = RAIL_META[rail as keyof typeof RAIL_META];
    const railNode = railMeta.label;
    addNode(railNode, railMeta.color, depthOf("rail", direction));

    const ledger = FINAL_LEDGER_MAP[token.finalAccount] ?? LEDGER_ACCOUNTS[2];
    const ledgerColor =
      token.finalAccount === "USDC" || token.finalAccount === "ETH"
        ? "#22C55E"
        : "#3B82F6";
    addNode(ledger, ledgerColor, depthOf("ledger", direction));

    for (const chainId of token.chains) {
      const chain = CHAINS.find((c) => c.id === chainId);
      if (!chain) continue;
      const chainNode = chain.name;
      addNode(chainNode, chain.color, depthOf("chain", direction));

      const value = weightFor(token, token.chains.length);

      if (direction === "deposit") {
        addLink(chainNode, assetNode, value, chain.color);
        addLink(assetNode, railNode, value, assetMeta.color);
        addLink(railNode, ledger, value, railMeta.color);
      } else {
        // Withdrawal: reverse direction — Ledger -> Rail -> AssetClass -> TargetChain
        addLink(ledger, railNode, value, ledgerColor);
        addLink(railNode, assetNode, value, railMeta.color);
        addLink(assetNode, chainNode, value, assetMeta.color);
      }
    }
  }

  return { nodes, links };
}
