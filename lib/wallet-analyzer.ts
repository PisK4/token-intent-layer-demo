import { TOKEN_MAP } from "./data-loader";
import type { AssetClass } from "./types";

export interface WalletHolding {
  symbol: string;
  chain: string;
  balance: number;
}

export interface AnalyzedHolding extends WalletHolding {
  usdValue: number;
  assetClass: AssetClass | "unknown";
  isDust: boolean;
  isYield: boolean;
  finalAccount: string;
  recommendation?: string;
}

export interface WalletAnalysis {
  totalUsdValue: number;
  holdings: AnalyzedHolding[];
  dustTokens: AnalyzedHolding[];
  yieldTokens: AnalyzedHolding[];
  totalDustUsd: number;
  totalYieldUsd: number;
  yieldPremiums: { symbol: string; premium: number; baseAsset: string }[];
  classBuckets: { assetClass: string; usdValue: number; count: number }[];
}

const UNIT_PRICE: Record<string, number> = {
  USDC: 1,
  USDT: 1,
  ETH: 3360,
  WBTC: 95000,
  cbBTC: 95000,
  SOL: 180,
  EDGE: 0.5,
  AVAX: 35,
  POL: 0.4,
  BNB: 600,
  HYPE: 40,
  APT: 10,
  SUI: 3,
  SEI: 0.35,
  stETH: 3696,
  wstETH: 4200,
  weETH: 3561,
  aUSDC: 1.08,
  sUSDe: 1.12,
  ENA: 0.68,
  AAVE: 152,
  LINK: 18,
  UNI: 9.2,
  PEPE: 0.0000128,
  ARB: 0.75,
  ONDO: 1.15,
  BGB: 4.8,
  OKB: 52,
  LIT: 1.2,
  MARU: 0.01,
  ASTER: 0.08,
  CAKE: 2.5,
  WLD: 1.5,
  JUP: 0.8,
  PYTH: 0.25,
  JTO: 2.8,
  RAY: 3.5,
  DEEP: 0.18,
  CETUS: 0.12,
  jitoSOL: 207,
  mSOL: 200,
  BONK: 0.00003,
  WIF: 1.8,
  MOG: 0.0000032,
};

// EdgeX 最小入金门槛为 $10；低于此值的非核心 token 无法单独充值，
// 需要通过 Intent Layer 合并归一化为 USDC / ETH 后才能满足入金条件。
const DUST_THRESHOLD_USD = 10;

const YIELD_PREMIUM: Record<string, { base: string; ratio: number }> = {
  stETH: { base: "ETH", ratio: 1.1 },
  wstETH: { base: "ETH", ratio: 1.25 },
  weETH: { base: "ETH", ratio: 1.06 },
  aUSDC: { base: "USDC", ratio: 1.08 },
  sUSDe: { base: "USDC", ratio: 1.12 },
  jitoSOL: { base: "SOL", ratio: 1.15 },
  mSOL: { base: "SOL", ratio: 1.11 },
};

export function analyzeWallet(holdings: WalletHolding[]): WalletAnalysis {
  const analyzed: AnalyzedHolding[] = holdings.map((h) => {
    const token = TOKEN_MAP[h.symbol];
    const price = UNIT_PRICE[h.symbol] ?? 0;
    const usdValue = h.balance * price;
    const assetClass = token?.assetClass ?? "unknown";
    const finalAccount = token?.finalAccount ?? "self";
    const isDust =
      usdValue < DUST_THRESHOLD_USD &&
      assetClass !== "canonical" &&
      assetClass !== "native";
    const isYield = assetClass === "yield";

    let recommendation: string | undefined;
    if (isDust) {
      recommendation = `Sweep to ${finalAccount === "ETH" ? "ETH" : "USDC"} via Intent Layer`;
    } else if (isYield) {
      const premium = YIELD_PREMIUM[h.symbol];
      recommendation = premium
        ? `Deposit to EdgeX as ${premium.base} (+${((premium.ratio - 1) * 100).toFixed(1)}% yield)`
        : `Deposit to EdgeX as ${finalAccount}`;
    }

    return {
      ...h,
      usdValue,
      assetClass,
      isDust,
      isYield,
      finalAccount,
      recommendation,
    };
  });

  const dustTokens = analyzed.filter((h) => h.isDust);
  const yieldTokens = analyzed.filter((h) => h.isYield);
  const totalUsdValue = analyzed.reduce((sum, h) => sum + h.usdValue, 0);
  const totalDustUsd = dustTokens.reduce((sum, h) => sum + h.usdValue, 0);
  const totalYieldUsd = yieldTokens.reduce((sum, h) => sum + h.usdValue, 0);

  const yieldPremiums = yieldTokens
    .map((h) => {
      const p = YIELD_PREMIUM[h.symbol];
      if (!p) return null;
      return {
        symbol: h.symbol,
        premium: (p.ratio - 1) * 100,
        baseAsset: p.base,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const bucketMap = new Map<string, { usdValue: number; count: number }>();
  for (const h of analyzed) {
    const key = h.assetClass;
    const existing = bucketMap.get(key) ?? { usdValue: 0, count: 0 };
    existing.usdValue += h.usdValue;
    existing.count += 1;
    bucketMap.set(key, existing);
  }
  const classBuckets = Array.from(bucketMap.entries())
    .map(([assetClass, data]) => ({ assetClass, ...data }))
    .sort((a, b) => b.usdValue - a.usdValue);

  return {
    totalUsdValue,
    holdings: analyzed,
    dustTokens,
    yieldTokens,
    totalDustUsd,
    totalYieldUsd,
    yieldPremiums,
    classBuckets,
  };
}
