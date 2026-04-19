# data/ — Intent Layer Metadata

本目录是 Demo 的**单一事实源**（Single Source of Truth）。所有业务数据以 JSON 形式存放，代码层只负责加载与展示。

## 文件清单

| 文件 | 内容 | 类型契约 |
|------|------|---------|
| `chains.json` | 支持的 Chain 列表 | `Chain[]`（见 `lib/types.ts`） |
| `tokens.json` | 支持的 Token 列表 + 资产分类 + Rail 选择 + 终态账户 | `Token[]` |
| `rails.json` | Protocol Rail 元信息（label / color / 描述） | `Record<Rail, { label, color, description }>` |

## 如何扩展

### 新增一条链

编辑 `chains.json`，追加：

```json
{
  "id": "scroll",
  "name": "Scroll",
  "color": "#FFEEDA",
  "family": "evm",
  "shortCode": "SCR"
}
```

`family` 只能是 `"evm"` 或 `"non-evm"`。`color` 建议用链的官方品牌色。

### 新增一个 Token

编辑 `tokens.json`，追加：

```json
{
  "symbol": "ARB",
  "name": "Arbitrum",
  "assetClass": "routable",
  "chains": ["arbitrum"],
  "commitment": "extended",
  "finalAccount": "self",
  "rails": ["vault", "intent-layer"],
  "description": "..."
}
```

枚举取值见 `lib/types.ts`：

- `assetClass`: `canonical | native | omnichain | yield | routable | source-only | long-tail`
- `commitment`: `core | extended | source-only | display-only`
- `finalAccount`: `USDC | ETH | SOL | self`（`self` 表示保留原 Token 语义）
- `rails[]`: `cctp | vault | intent-layer | layerzero | wormhole | direct`

### 新增一条 Rail

1. 编辑 `rails.json` 追加 Rail key + 元信息
2. **必须**同步更新 `lib/types.ts` 的 `Rail` union type
3. **必须**同步更新 `lib/route-planner.ts` 的 `switch(rail)` 分支
4. 可选：更新 `tailwind.config.ts` 的 `colors.rail.*`

## 注意事项

- JSON 不支持注释，说明文字请写在本 README 或 `description` 字段
- `chains[]` 里的 `id` 必须与 `chains.json` 的 `id` 对应，否则 UI 会忽略该 Token
- 修改后无需重启 `next dev`，Next.js 会自动热更新
- **不要**在 JSON 中放样式元信息（颜色、字体等 UI 专属属性）；纯样式常量放在 `lib/asset-class-meta.ts`
