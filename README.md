# EdgeX Intent Layer Demo

> 一张页面讲清 **任意链任意 Token → EdgeX 核心资产路径** 的 Intent Layer 编排演示。

## 核心能力

- **Sankey Diagram**：Source Chain → Asset Class → Protocol Rail → EdgeX Ledger 四层流动
- **Token / Chain Selector**：按链筛选可用 Token，自动推导资产分类与 Rail
- **Swap Interface**：展示型 Swap 框，演示 Deposit / Withdraw Intent
- **Deposit / Withdraw Toggle**：切换方向后 Sankey 反向，Withdraw 模式支持 Stock OK / Low 切换展示 fallback 路径
- **Path Detail Card**：完整路径步骤（含 fallback 提示）

Demo 不执行真实交易，所有金额基于 mock 价格估算。

## 技术栈

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS（Glassmorphism + Dark Mode）
- Apache ECharts（Sankey series）
- Lucide Icons

## 本地运行

```bash
npm install
npm run dev
# 访问 http://localhost:3000
```

## 构建

```bash
npm run build
npm run start
```

## 部署到 Vercel

项目已开箱即用支持 Vercel 部署：

### 方式 1：Vercel CLI

```bash
npm i -g vercel
vercel
# 首次部署跟随提示；后续可用 vercel --prod
```

### 方式 2：Vercel Dashboard

1. 将本目录推到 Git 仓库（GitHub / GitLab / Bitbucket）
2. 在 [vercel.com](https://vercel.com) 点击 **Add New Project**
3. Import 该仓库，Framework Preset 会自动识别为 **Next.js**
4. 默认配置即可部署（`next build`，无环境变量）

### 方式 3：从 monorepo 子目录部署

若本 demo 位于更大 monorepo 子目录：

```bash
vercel --cwd repos/edgex-intent-layer-demo
```

或在 Vercel Project Settings 中设置 **Root Directory** 为 `repos/edgex-intent-layer-demo`。

## 项目结构

```
edgex-intent-layer-demo/
├── app/
│   ├── layout.tsx         # 字体与全局布局
│   ├── page.tsx           # 主页面（左右双区布局）
│   └── globals.css        # Tailwind + Glassmorphism
├── components/
│   ├── Header.tsx         # 顶部导航 + Deposit/Withdraw Toggle
│   ├── TokenChainSelector.tsx
│   ├── SwapInterface.tsx  # Swap 框（展示型）
│   ├── SankeyDiagram.tsx  # ECharts Sankey
│   └── PathDetailCard.tsx # 路径步骤明细
├── lib/
│   ├── types.ts
│   ├── route-planner.ts   # Token+Chain+Direction -> RoutePlan
│   └── data/
│       ├── chains.ts      # 11 条链
│       ├── tokens.ts      # 15 个 token + 7 类 asset classification
│       ├── rails.ts       # 6 条 protocol rail 元信息
│       └── sankey-data.ts # 动态生成 Sankey nodes/links
├── tailwind.config.ts
├── tsconfig.json
└── vercel.json
```

## 扩展点

- 新增 Chain：编辑 `lib/data/chains.ts`
- 新增 Token：编辑 `lib/data/tokens.ts`
- 新增 Rail：编辑 `lib/data/rails.ts` + `lib/route-planner.ts` 的 switch 分支
- 调整 Sankey 层级或权重：编辑 `lib/data/sankey-data.ts` 的 `buildSankeyData`

## 设计参考

- 风格：Glassmorphism + Dark Mode（参考 Uniswap Interface v3 / Jupiter）
- 色板：Slate 深色背景 + Green (#22C55E) 主 accent + 按 Rail 分色
- 字体：Space Grotesk（标题）+ Inter（正文）+ JetBrains Mono（数据）
- Sankey 交互：Hover 节点高亮 adjacency；左侧改变 Token/Chain 自动高亮对应路径
