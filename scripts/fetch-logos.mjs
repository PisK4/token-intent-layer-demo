#!/usr/bin/env node
/**
 * Fetch chain / token logo URLs from LI.FI public API and persist them back
 * into data/chains.json and data/tokens.json as a new `logoUrl` field.
 *
 * Data sources (as documented in
 *   repos/edgex-liquidity-research/Intent-layer-chain-token-support-report.md):
 *   - https://li.quest/v1/chains   → chain logoURI
 *   - https://li.quest/v1/tokens   → token logoURI (grouped by chainId)
 *
 * LI.FI logos cover the vast majority of EVM / non-EVM chains and mainstream
 * tokens; anything it can't resolve falls back to a manually curated map
 * below (e.g. EDGE, MARU, ASTER, some Solana / Sui ecosystem tokens).
 *
 * Usage:
 *   node scripts/fetch-logos.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "..", "data");

// Our chain id → LI.FI chain name (only needed when our `name` doesn't match
// LI.FI `name` exactly)
const CHAIN_NAME_OVERRIDES = {
  bsc: "BSC",
  "bnb chain": "BSC",
  optimism: "OP Mainnet",
};

// Manually curated fallbacks for chains LI.FI doesn't cover (e.g. Aptos, EDGE)
const MANUAL_CHAIN_LOGOS = {
  edge: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/ethereum.svg",
  aptos:
    "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/aptos/info/logo.png",
};

const MANUAL_TOKEN_LOGOS = {
  EDGE: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x18aAA7115705e8be94bfFEBDE57Af9BFc265B998/logo.png",
  MARU: "",
  ASTER: "",
  BGB: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/assets/BGB/logo.png",
  cbBTC: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf/logo.png",
  jitoSOL: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/assets/J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn/logo.png",
  mSOL: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/assets/mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So/logo.png",
  WLD: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x163f8C2467924be0ae7B5347228CABF260318753/logo.png",
  JUP: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/assets/JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN/logo.png",
  PYTH: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/assets/HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3/logo.png",
  JTO: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/assets/jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL/logo.png",
  RAY: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/assets/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R/logo.png",
  BONK: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/assets/DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263/logo.png",
  WIF: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/assets/EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm/logo.png",
  DEEP: "",
  CETUS: "",
  MOG: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xaaeE1A9723aaDB7afA2810263653A34bA2C21C7a/logo.png",
  HYPE: "",
  APT: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/aptos/info/logo.png",
  SUI: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/sui/info/logo.png",
  SEI: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/sei/info/logo.png",
  sUSDe: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x9D39A5DE30e57443BfF2A8307A4256c8797A3497/logo.png",
  weETH: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee/logo.png",
};

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: ${res.status} ${res.statusText}`);
  return res.json();
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n");
}

async function main() {
  const chainsPath = path.join(DATA_DIR, "chains.json");
  const tokensPath = path.join(DATA_DIR, "tokens.json");

  const chains = readJson(chainsPath);
  const tokens = readJson(tokensPath);

  // chainTypes must include SVM/MVM/UTXO to surface Solana / Sui / Bitcoin
  const chainsUrl =
    "https://li.quest/v1/chains?chainTypes=EVM%2CSVM%2CUTXO%2CMVM";
  console.log(`[fetch-logos] GET ${chainsUrl}`);
  const lifiChains = (await fetchJson(chainsUrl)).chains;
  const lifiChainByName = new Map(
    lifiChains.map((c) => [c.name.toLowerCase(), c]),
  );

  let chainHits = 0;
  for (const chain of chains) {
    const overrideName = CHAIN_NAME_OVERRIDES[chain.id];
    const lookupName = (overrideName ?? chain.name).toLowerCase();
    const li = lifiChainByName.get(lookupName);
    if (li?.logoURI) {
      chain.logoUrl = li.logoURI;
      chainHits += 1;
      continue;
    }
    const manual = MANUAL_CHAIN_LOGOS[chain.id];
    if (manual) {
      chain.logoUrl = manual;
      console.log(`  [chain] manual fallback: ${chain.id} → ${manual}`);
      continue;
    }
    console.warn(`  [chain] NO MATCH: ${chain.id} / ${chain.name}`);
  }
  console.log(`[fetch-logos] chain logos: ${chainHits}/${chains.length} via LI.FI`);

  // Also widen tokens fetch to SVM/MVM/UTXO so Solana / Sui tokens are in pool
  const tokensUrl =
    "https://li.quest/v1/tokens?chainTypes=EVM%2CSVM%2CUTXO%2CMVM";
  console.log(`[fetch-logos] GET ${tokensUrl}`);
  const lifiTokens = (await fetchJson(tokensUrl)).tokens;

  // Build a symbol → logoURI map. LI.FI lists tokens per chainId; we iterate
  // in a deterministic chain priority order so well-known chains win first.
  const CHAIN_PRIORITY = [
    "1", // Ethereum
    "42161", // Arbitrum
    "10", // OP
    "8453", // Base
    "137", // Polygon
    "56", // BSC
    "43114", // Avalanche
    "59144", // Linea
    "1399811149", // Solana
  ];
  const chainIdsSorted = [
    ...CHAIN_PRIORITY.filter((id) => lifiTokens[id]),
    ...Object.keys(lifiTokens).filter((id) => !CHAIN_PRIORITY.includes(id)),
  ];

  const tokenLogoBySymbol = new Map();
  for (const chainId of chainIdsSorted) {
    for (const tok of lifiTokens[chainId]) {
      if (!tok.symbol || !tok.logoURI) continue;
      const key = tok.symbol.toUpperCase();
      if (!tokenLogoBySymbol.has(key)) {
        tokenLogoBySymbol.set(key, tok.logoURI);
      }
    }
  }

  let tokenHits = 0;
  const unresolved = [];
  for (const t of tokens) {
    const viaLifi = tokenLogoBySymbol.get(t.symbol.toUpperCase());
    if (viaLifi) {
      t.logoUrl = viaLifi;
      tokenHits += 1;
      continue;
    }
    const manual = MANUAL_TOKEN_LOGOS[t.symbol];
    if (manual) {
      t.logoUrl = manual;
      console.log(`  [token] manual fallback: ${t.symbol}`);
      continue;
    }
    unresolved.push(t.symbol);
  }
  console.log(`[fetch-logos] token logos: ${tokenHits}/${tokens.length} via LI.FI`);
  if (unresolved.length) {
    console.warn(
      `  [token] ${unresolved.length} unresolved (no LI.FI match, no manual fallback): ${unresolved.join(", ")}`,
    );
  }

  writeJson(chainsPath, chains);
  writeJson(tokensPath, tokens);
  console.log("[fetch-logos] done");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
