export type AssetClass =
  | "canonical"
  | "native"
  | "omnichain"
  | "yield"
  | "routable"
  | "source-only"
  | "long-tail";

export type Rail =
  | "cctp"
  | "vault"
  | "intent-layer"
  | "layerzero"
  | "wormhole"
  | "direct";

export type Commitment = "core" | "extended" | "source-only" | "display-only";

export type Direction = "deposit" | "withdraw";

export interface Chain {
  id: string;
  name: string;
  color: string;
  family: "evm" | "non-evm";
  shortCode: string;
}

export interface Token {
  symbol: string;
  name: string;
  assetClass: AssetClass;
  chains: string[];
  commitment: Commitment;
  finalAccount: "USDC" | "ETH" | "SOL" | "self";
  rails: Rail[];
  description: string;
}

export interface SankeyNode {
  name: string;
  category?: string;
  itemStyle?: { color?: string };
  depth?: number;
}

export interface SankeyLink {
  source: string;
  target: string;
  value: number;
  lineStyle?: { color?: string; opacity?: number };
}

export interface PathStep {
  label: string;
  protocol?: string;
  detail: string;
  status?: "normal" | "fallback";
}

export interface RoutePlan {
  direction: Direction;
  sourceChain: Chain;
  sourceToken: Token;
  targetAccount: string;
  rail: Rail;
  steps: PathStep[];
  commitment: Commitment;
  note?: string;
}
