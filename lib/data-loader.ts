import chainsJson from "@/data/chains.json";
import tokensJson from "@/data/tokens.json";
import railsJson from "@/data/rails.json";
import type { Chain, Token, Rail } from "./types";

export const CHAINS: Chain[] = chainsJson as Chain[];

export const TOKENS: Token[] = tokensJson as Token[];

export const RAIL_META: Record<
  Rail,
  { label: string; color: string; description: string }
> = railsJson as Record<
  Rail,
  { label: string; color: string; description: string }
>;

export const CHAIN_MAP: Record<string, Chain> = Object.fromEntries(
  CHAINS.map((c) => [c.id, c]),
);

export const TOKEN_MAP: Record<string, Token> = Object.fromEntries(
  TOKENS.map((t) => [t.symbol, t]),
);

// Withdraw 可见性：EdgeX Ledger 实际持有该 symbol 才能原 Token 提现。
// - finalAccount === "self"：原 Token 入账（UNI / PEPE / ONDO / SOL 等）→ 可提现
// - symbol === finalAccount：本身就是归一化终态（USDC / ETH）→ 可提现
// - 其他（stETH / wstETH / aUSDC / MOG / long-tail 等）：Deposit 时已归一化，Ledger 不持有该 symbol → 不可提现
export const isWithdrawable = (t: Token): boolean =>
  t.finalAccount === "self" || t.symbol === t.finalAccount;

// Development-only sanity checks to catch common JSON misconfig early.
if (process.env.NODE_ENV !== "production") {
  const chainIds = new Set(CHAINS.map((c) => c.id));
  const railKeys = new Set(Object.keys(RAIL_META));
  for (const t of TOKENS) {
    for (const cid of t.chains) {
      if (!chainIds.has(cid)) {
        console.warn(
          `[data-loader] Token ${t.symbol} references unknown chain id: ${cid}`,
        );
      }
    }
    for (const r of t.rails) {
      if (!railKeys.has(r)) {
        console.warn(
          `[data-loader] Token ${t.symbol} references unknown rail: ${r}`,
        );
      }
    }
  }
}
