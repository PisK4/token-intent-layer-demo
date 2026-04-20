import { CHAIN_MAP, TOKEN_MAP, RAIL_META } from "./data-loader";
import { ASSET_CLASS_META } from "./asset-class-meta";
import type { Direction, PathStep, Rail, RoutePlan } from "./types";

// Omnichain (LayerZero OFT / Adapter) 提现走 Burn→Mint 或 Lock→Mint，
// 目标链流动性按需生成，不存在"目标链库存是否充足"的概念，因此跳过 Liquidity Check。
function needsLiquidityCheck(rail: Rail): boolean {
  return rail !== "layerzero";
}

export function planRoute(
  tokenSymbol: string,
  chainId: string,
  direction: Direction,
  stockSufficient: boolean,
): RoutePlan | null {
  const token = TOKEN_MAP[tokenSymbol];
  const chain = CHAIN_MAP[chainId];
  if (!token || !chain) return null;
  if (!token.chains.includes(chainId)) return null;

  const rail: Rail = token.rails[0];
  const assetMeta = ASSET_CLASS_META[token.assetClass];
  const railMeta = RAIL_META[rail];

  const steps: PathStep[] = [];
  let targetAccount = "";
  let note: string | undefined;

  if (direction === "deposit") {
    steps.push({
      label: `用户在 ${chain.name} 发起充值`,
      detail: `资产：${token.symbol} · 分类：${assetMeta.label}`,
    });

    switch (rail) {
      case "cctp":
        steps.push({
          label: "CCTP 规范跨链",
          protocol: "Circle CCTP",
          detail: "Burn on source → Attestation → Mint on Edge Chain",
        });
        targetAccount = "USDC @ EdgeX";
        break;
      case "vault":
        steps.push({
          label: "源链 Vault 合约存入",
          protocol: "EdgeX Vault",
          detail: "链下 Server 监听 Deposit 事件并入账",
        });
        targetAccount =
          token.finalAccount === "ETH"
            ? "ETH @ EdgeX"
            : `${token.symbol} @ EdgeX`;
        break;
      case "intent-layer":
        if (token.finalAccount === "SOL") {
          steps.push({
            label: "Intent Layer 归一化换汇",
            protocol: "Jupiter",
            detail: `源链 swap ${token.symbol} → SOL`,
          });
          steps.push({
            label: "Wormhole 桥接到 EVM",
            protocol: "Wormhole",
            detail: `SOL@${chain.name} → wrapped on EVM chain`,
          });
          steps.push({
            label: "EVM 链 Vault 存入",
            protocol: "EdgeX Vault",
            detail: "链下 Server 监听 Deposit 事件并入账",
          });
          targetAccount = "SOL @ EdgeX";
        } else if (token.finalAccount === "USDC") {
          steps.push({
            label: "Intent Layer 归一化换汇",
            protocol: "UniswapX / CoW / 1inch",
            detail: `源链 swap ${token.symbol} → USDC`,
          });
          steps.push({
            label: "CCTP 交付",
            protocol: "CCTP",
            detail: "USDC 跨链到 Edge Chain",
          });
          targetAccount = "USDC @ EdgeX";
        } else {
          steps.push({
            label: "Intent Layer 归一化换汇",
            protocol: "UniswapX / CoW / 1inch",
            detail: `源链 swap ${token.symbol} → ETH`,
          });
          steps.push({
            label: "Vault 交付",
            protocol: "Vault",
            detail: "ETH 入 Vault 合约",
          });
          targetAccount = "ETH @ EdgeX";
        }
        break;
      case "layerzero":
        steps.push({
          label: "LayerZero OFT 跨链",
          protocol: "LayerZero",
          detail: "Omnichain 标准互通，保留原 Token 语义",
        });
        targetAccount = `${token.symbol} @ EdgeX`;
        break;
      case "wormhole":
        steps.push({
          label: "Wormhole 桥接到 EVM",
          protocol: "Wormhole",
          detail: `${token.symbol}@${chain.name} → wrapped on EVM chain`,
        });
        steps.push({
          label: "EVM 链 Vault 存入",
          protocol: "EdgeX Vault",
          detail: "链下 Server 监听 Deposit 事件并入账",
        });
        targetAccount = `${token.symbol} @ EdgeX`;
        break;
      case "direct":
        steps.push({
          label: "源链 Vault 直接存入",
          protocol: "EdgeX Vault (源链)",
          detail: "源链闭环，仅源链入金，将来仅源链提现",
        });
        targetAccount = `${token.symbol} @ EdgeX`;
        note = "Source-only 资产：入金链 = 提现链，库存 = 入金累积";
        break;
    }

    steps.push({
      label: "EdgeX Ledger 入账",
      detail: `交易与风控以 ${targetAccount} 作为可用余额`,
    });
  } else {
    // Withdraw
    targetAccount = `${token.symbol} @ ${chain.name}`;
    steps.push({
      label: "用户发起提现",
      detail: `目标：${targetAccount}`,
    });

    // Liquidity Check 决策节点：按资产类型分流
    // - LayerZero OFT/Adapter：目标链流动性按需 Mint，跳过该步骤
    // - source-only：检查的是源链 Vault 入金累积库存（而非目标链库存）
    // - 其他：检查目标链库存是否充足
    if (needsLiquidityCheck(rail)) {
      const isSourceOnly = token.commitment === "source-only";
      steps.push({
        label: isSourceOnly
          ? "Stock Check · 源链入金累积库存判定"
          : "Liquidity Check · 目标链库存判定",
        detail: isSourceOnly
          ? `检查源链 ${chain.name} 上 ${token.symbol} 的 Vault 入金累积库存`
          : `检查目标链 ${chain.name} 上 ${token.symbol} 的库存是否充足`,
        status: "decision",
      });
    }

    if (token.commitment === "source-only") {
      steps.push({
        label: "源链 Vault 直接交付原 Token",
        protocol: "EdgeX Vault (源链)",
        detail: "库存 = 历史入金累积，无 solver 补位",
        status: stockSufficient ? "normal" : "fallback",
      });
      if (!stockSufficient) {
        note = "Source-only 资产库存不足时无法兜底，此路径不可用。";
      }
    } else if (rail === "cctp") {
      steps.push({
        label: "CCTP canonical 交付",
        protocol: "Circle CCTP",
        detail: "USDC 规范跨链到目标链",
        status: stockSufficient ? "normal" : "fallback",
      });
      if (!stockSufficient) {
        note = "库存极端不足时才由 solver 兜底，此处保留 canonical 承诺";
      }
    } else if (rail === "vault") {
      if (stockSufficient) {
        steps.push({
          label: "目标链 Vault 直接交付",
          protocol: "EdgeX Vault",
          detail: `${token.symbol} 同资产交付，无需跨链调度`,
          status: "normal",
        });
      } else if (token.assetClass === "routable") {
        steps.push({
          label: "Solver 网络跨链调度",
          protocol: "UniswapX / CoW / 1inch",
          detail: `从库存充裕链（如 Base）调度 ${token.symbol}，solver 在 ${chain.name} DEX 完成交付`,
          status: "fallback",
        });
        note = "Routable Asset 库存不足时 solver 在任意支持链买入并跨链交付，用户仍收到原 Token";
      } else {
        // Native Asset（ETH / SOL / AVAX / POL / BNB / HYPE / APT / SUI / SEI）
        steps.push({
          label: "Solver 网络跨链调度",
          protocol: "UniswapX / CoW / 1inch",
          detail: `从其他 EVM 链（如 Base）调度 ${token.symbol} 到 ${chain.name} 交付用户`,
          status: "fallback",
        });
        note = "Native Asset 库存不足时 solver 跨链 fill，用户仍收到原资产";
      }
    } else if (rail === "layerzero") {
      // Omnichain 资产直接走 Burn/Mint（原生 OFT）或 Lock/Mint（Adapter），
      // 目标链按需生成流动性，因此没有 stockSufficient 概念，也没有 fallback。
      steps.push({
        label: "LayerZero OFT 跨链交付",
        protocol: "LayerZero OFT / Adapter",
        detail:
          "原生 OFT: Burn on source → Mint on target；" +
          "Adapter: Lock on source → Mint on target。" +
          "目标链流动性按需生成，无需 Liquidity Check。",
        status: "normal",
      });
      note =
        "Omnichain-standard Asset 通过 Burn/Mint 或 Lock/Mint 在目标链按需产生流动性，不走 Solver 网络、不做库存判定。";
    } else if (rail === "intent-layer") {
      steps.push({
        label: "Intent Layer solver 交付",
        protocol: "CoW / UniswapX / 1inch",
        detail:
          token.finalAccount === "USDC" ||
          token.finalAccount === "ETH" ||
          token.finalAccount === "SOL"
            ? "按核心资产路径交付"
            : `solver 在 ${chain.name} 买入原 Token 交付`,
        status: stockSufficient ? "normal" : "fallback",
      });
    } else if (rail === "wormhole") {
      steps.push({
        label: "EVM → Solana/Aptos/Sui 桥接",
        protocol: "Wormhole",
        detail: "经 EVM 链 Vault 解押后 Wormhole 桥接回目标链",
        status: stockSufficient ? "normal" : "fallback",
      });
    } else {
      steps.push({
        label: "Direct 交付",
        protocol: railMeta.label,
        detail: "原资产原链交付",
        status: "normal",
      });
    }
  }

  return {
    direction,
    sourceChain: chain,
    sourceToken: token,
    targetAccount,
    rail,
    steps,
    commitment: token.commitment,
    note,
  };
}
