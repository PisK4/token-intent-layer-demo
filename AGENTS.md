<coding_guidelines>
# EdgeX Intent Layer Demo

用于 **对内评审 / BD 演示** 的 Intent Layer 路径编排可视化前端 Demo。**非生产实现**，仅展示方案叙事：任意链任意 Token → EdgeX 核心资产路径。

## 仓库边界

- **是什么**：方案演示前端，用 Sankey 图 + Bubble Universe + Swap 界面一次讲清 Intent Layer 的能力覆盖面、Token 支持宽度与路径编排
- **不是什么**：不是生产服务、不连真实链、不执行真实交易、不消费真实 API
- **目标观众**：团队内评审、合作方/BD 路演、方案汇报
- **不承诺**：协议已上线、Token/链已全量接入、链上/链下联动真实跑通

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 14 (App Router) |
| 语言 | TypeScript 5 (strict) |
| 样式 | Tailwind CSS + 自研 Glassmorphism 卡片 |
| 图表 | Apache ECharts（Sankey + Graph/Force 布局）via `echarts-for-react` |
| 图标 | `lucide-react`（禁止用 emoji 当图标） |
| 字体 | Space Grotesk（标题）+ Inter（正文）+ JetBrains Mono（数据） |
| 部署 | Vercel（已提供 `vercel.json`） |

## 常用命令

```bash
npm install            # 安装依赖
npm run dev            # 本地开发（默认 http://localhost:3000）
npm run build          # 生产构建
npm run start          # 运行生产构建
npm run lint           # ESLint (next lint)
npx tsc --noEmit       # TypeScript 类型检查
```

**交付前必须过三关**：`tsc --noEmit` 零错误 + `next build` 成功 + `next lint` 零 warning。

## 项目结构

```
edgex-intent-layer-demo/
├── data/                       # [META DATA] 单一事实源（JSON）
│   ├── chains.json             # 11 条链
│   ├── tokens.json             # 15 个 Token
│   ├── rails.json              # 6 条 Protocol Rail
│   └── README.md               # 扩展指南
├── app/
│   ├── layout.tsx              # 字体与全局布局
│   ├── page.tsx                # 主页面（左右双区布局）
│   └── globals.css             # Tailwind + Glassmorphism
├── components/
│   ├── Header.tsx              # 顶部导航 + Deposit/Withdraw Toggle
│   ├── TokenChainSelector.tsx  # Chain + Token dropdown（Direction-aware 标签与过滤）
│   ├── SwapInterface.tsx       # 展示型 Swap 框（mock 价格）
│   ├── SankeyDiagram.tsx       # ECharts Sankey 图（Direction-aware depth + 方向 banner）
│   ├── BubbleUniverse.tsx      # Token 支持全景：ECharts graph + force 布局
│   └── PathDetailCard.tsx      # 路径步骤明细
├── lib/
│   ├── types.ts                # 所有核心类型定义
│   ├── data-loader.ts          # 加载 data/*.json + CHAIN_MAP/TOKEN_MAP + isWithdrawable 工具 + dev 校验
│   ├── asset-class-meta.ts     # 资产分类的 UI 样式元信息（颜色/标签）
│   ├── sankey-data.ts          # 派生：tokens × chains × rails → Sankey nodes/links（含方向感知 depth）
│   └── route-planner.ts        # 派生：(token, chain, direction) → RoutePlan
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
├── vercel.json
└── README.md
```

## 数据模型

**数据分两层**：

### 第 1 层：`data/` 根目录（业务数据，JSON）

这是**单一事实源**，所有 Chain / Token / Rail 的增删改都应该在这里做。

| 文件 | 职责 | 类型契约 |
|------|------|---------|
| `data/chains.json` | 支持的链列表 + 品牌色 + EVM/Non-EVM 分类 | `Chain[]`（`lib/types.ts`） |
| `data/tokens.json` | Token 清单 + 资产分类 + 承诺强度 + 入账终态 + Rail 偏好 | `Token[]` |
| `data/rails.json` | 6 条 Rail 的 label / color / 描述 | `Record<Rail, ...>` |

详细扩展指南见 `data/README.md`。

### 第 2 层：`lib/` 运行时逻辑（TS）

| 文件 | 职责 |
|------|------|
| `lib/types.ts` | 所有 TS 类型（`Chain / Token / Rail / AssetClass / Commitment / Direction / RoutePlan`） |
| `lib/data-loader.ts` | 加载 JSON → `CHAINS / TOKENS / CHAIN_MAP / TOKEN_MAP / RAIL_META`；导出 `isWithdrawable(token)` 判定；dev 环境会校验 chain/rail 引用是否存在 |
| `lib/asset-class-meta.ts` | 7 类资产分类的 UI 样式元信息（label / color / description）——**不是业务数据**，因此仍然保留 TS |
| `lib/sankey-data.ts` | 派生：组装 Sankey nodes/links；`depthOf()` 按 direction 翻转节点分层；`weightFor` 控制流量比例 |
| `lib/route-planner.ts` | 派生：生成分步路径（含 `normal` / `fallback` 状态） |

### Direction-aware 渲染规则

Deposit / Withdraw 方向切换会级联影响 UI 多处，**新增组件或修改现有组件时必须保持语义一致**：

| 维度 | Deposit | Withdraw |
|------|---------|----------|
| Sankey 节点分层（`depthOf`） | Chain(0) → AssetClass(1) → Rail(2) → Ledger(3) | Ledger(0) → Rail(1) → AssetClass(2) → Chain(3) |
| Selector 卡片标题 | Select Source | Select Target |
| Selector Chain / Token 字段 | Source Chain / Source Token | Target Chain / Withdraw Token |
| Token 过滤规则 | 全部 15 个 Token 可选 | 仅 `isWithdrawable` 为真（`finalAccount === "self" \|\| symbol === finalAccount`） |
| Sankey 标题区 banner | 绿色 `→ DEPOSIT` pill + `Source Chain → EdgeX Ledger` | 琥珀色 `← WITHDRAW` pill + `EdgeX Ledger ← Target Chain` |
| BubbleUniverse 可见 Token | 全部 15 个 | 过滤掉非可提现 Token（stETH / wstETH / aUSDC / MOG 等） |

切换方向时 `app/page.tsx` 的 `useEffect` 会在当前 Token 不可提现时自动 fallback 到同链首个可提现 Token（优先 USDC），极端情况下回退到 Ethereum + USDC。

### Bubble Universe 联动

- 点击泡泡 → `onSelectTokenFromBubble(symbol)` → 更新 `tokenSymbol`；若当前 `chainId` 不在该 Token 的 `chains` 列表，自动切到该 Token 的第一个支持链
- 同步触发 `highlightVersion++` → Sankey 对该 Token 的路径做一次脉冲高亮
- 泡泡尺寸规则：`log2(chainCount + 1) × 22 + 32`；颜色复用 `ASSET_CLASS_META[t.assetClass].color`
- 布局使用 ECharts `graph` + `force`，`roam: false`、`draggable: true`；不使用 edges，保持"浮岛"视觉

### 核心类型

- `AssetClass`：`canonical / native / omnichain / yield / routable / source-only / long-tail`
- `Rail`：`cctp / vault / intent-layer / layerzero / wormhole / direct`
- `Commitment`：`core / extended / source-only / display-only`
- `Direction`：`deposit / withdraw`

### Route Planner

`lib/route-planner.ts` 将 `(tokenSymbol, chainId, direction, stockSufficient)` 转为 `RoutePlan`，包含：
- `sourceChain` / `sourceToken` / `targetAccount` / `rail`
- `steps[]`：分步路径（含 `normal` / `fallback` 状态）
- `note`：特殊说明（如 Source-only 资产无 solver 补位）

新增 Rail 或资产分类时，需**同步**更新 `route-planner.ts` 的 `switch(rail)` 分支。

## 设计系统

| 维度 | 规范 |
|------|------|
| 背景 | `#0B1120`（slate-900 基调）+ 双层 radial gradient |
| 卡片 | `.glass-card`（backdrop-blur + inner border glow） |
| Accent | `#22C55E`（green-500）+ rail-based 分色 |
| Rail 色板 | CCTP `#3B82F6`、Vault `#22C55E`、Intent `#A855F7`、LZ `#F59E0B`、Wormhole `#F97316`、Direct `#14B8A6` |
| 字体 | Space Grotesk（显示类）/ Inter（正文）/ JetBrains Mono（数据/金额） |
| 圆角 | 卡片 `rounded-2xl`、控件 `rounded-xl`、pill `rounded-full` |
| 阴影 | `shadow-card`（卡片）/ `shadow-glow`（accent hover） |
| 动效 | 150-300ms 过渡；尊重 `prefers-reduced-motion` |

**禁止**：
- 用 emoji 做 icon（改用 `lucide-react`）
- 硬编码颜色 hex（优先用 Tailwind token / CSS 变量）
- 在 Server Component 里用 ECharts（ECharts 依赖 `window`，必须 `dynamic import` + `ssr: false`）

## 编码约定

- **语言**：代码英文；注释、文档、对话中文；业务术语可保留英文（CCTP / Rail / Solver 等）
- **文件/目录**：组件 `PascalCase.tsx`；非组件 `camelCase.ts`；目录 `kebab-case`（与根工作区一致）
- **Client vs Server**：交互组件必须标 `"use client"`；纯展示可留 Server Component
- **ECharts**：只在 `SankeyDiagram.tsx` 与 `BubbleUniverse.tsx` 内使用；其他组件不直接引入 echarts；务必 `dynamic import` + `ssr: false`
- **Direction 状态**：`direction` 从 `app/page.tsx` 顶层下发，任何消费 Token/Chain 的新组件都应该接受 `direction` prop 并遵循上表「Direction-aware 渲染规则」
- **状态**：目前全部通过 `useState` 在 `app/page.tsx` 顶层管理；除非需求复杂化，否则**不引入** Redux / Zustand

## Vercel 部署

已内置零配置部署，三种方式：

```bash
# 方式 1：CLI（在本目录）
vercel

# 方式 2：从 monorepo 根目录指定子目录
vercel --cwd repos/edgex-intent-layer-demo

# 方式 3：Vercel Dashboard
# Import 仓库后将 Root Directory 设为 repos/edgex-intent-layer-demo
```

Framework Preset 会自动识别为 Next.js，无需环境变量。

## Agent 工作规则

- 对话语言使用**简体中文**；术语可保留英文
- 修改代码前，先用 Grep/Read 定位影响面，避免全量重构
- **修改代码后不要自动 commit**，除非用户明确要求
- **修改代码后不要自动 push**，`git push` 必须用户显式授权
- 交付前必须跑：`tsc --noEmit` + `next build` + `next lint`，全部通过后再报告完成
- 任何数据模型变更（新增 chain / token / rail），必须同步更新：`data/*.json` + `lib/types.ts`（若涉及 Rail union）+ `lib/route-planner.ts`（若涉及 rail）+ 可能的 UI 文案
- 改动影响 Direction 语义时（Sankey 节点分层 / Selector 标签 / Token 过滤 / Ledger 命名），必须三处一起改并自测两个方向

## 常见扩展任务

| 任务 | 改动文件 |
|------|---------|
| 新增一条链 | `data/chains.json` |
| 新增一个 Token | `data/tokens.json`（自动进入 Sankey / Selector / BubbleUniverse） |
| 新增一条 Rail | `data/rails.json` + `lib/types.ts` 的 `Rail` union + `lib/route-planner.ts` 加 case |
| 调整 Sankey 流量权重 | `lib/sankey-data.ts` 中的 `weightFor` |
| 调整 Sankey 节点分层（方向语义） | `lib/sankey-data.ts` 中的 `depthOf()` |
| 调整"可提现"判定规则 | `lib/data-loader.ts` 中的 `isWithdrawable()` |
| 调整 Bubble 尺寸/力布局 | `components/BubbleUniverse.tsx` 中的 `sizeFor()` 与 `series[0].force` |
| 调整 Swap 框的 mock 价格 | `components/SwapInterface.tsx` 的 `UNIT_PRICE` |
| 修改资产分类颜色/标签 | `lib/asset-class-meta.ts` |
| 修改主题色/字体 | `tailwind.config.ts` + `app/globals.css` |
| 修改默认选中 Chain/Token | `app/page.tsx` 的 `useState` 初始值 |
| 修改 EdgeX Ledger 账户显示名 | `lib/sankey-data.ts` 的 `LEDGER_ACCOUNTS` / `FINAL_LEDGER_MAP` + `components/SankeyDiagram.tsx` 同步 |

## 参考文档

- 方案说明：`../../architecture/方案设计/流动性扩展方案/fancy-demo/edgex-intent-layer-brief.md`
- 完整 Demo 方案：`../../architecture/方案设计/流动性扩展方案/fancy-demo/edgex-intent-layer-fancy-demo.md`
- 流动性协议调研：`../edgex-liquidity-research/2026-04-17-liquidity-protocol-chain-token-support-report.md`
</coding_guidelines>
