# 国际站草稿：后台准备与授权后接入

当前交付是 KELIKULI 后台与共用接口，**尚未联通国际站**。没有验证店铺权限、
没有创建 PS01 草稿、没有启用自动同步。本次不修改线上数据库或部署配置。
实际连接适配器需要在确认自有应用或服务商后实现和验收。

## 已实现的后台行为

- 产品页填写独立唯一 SKU、国际站末级类目、尺寸和按个或套计价的 USD 阶梯价。
  同步读取产品英文标题、图片、国际站 MOQ、交期、包装及英文详情，不推测实际价格、尺寸或类目。
- 勾选“产品资料已审核通过”保存当前资料的指纹。同步字段改变后审核失效；
  网站 Active 状态不代表国际站资料已审核。Custom Lab 凭证也不能批准国际站同步。
- “保存并同步国际站草稿”先保存产品，再调用共用同步服务。新产品在本站保持草稿；
  已有产品保留最近一次保存的本站上下架状态。
- 勾选“同步到国际站草稿”且资料审核通过后，每次后台保存都会尝试自动同步，
  但还需部署端总开关已开启。不运行定时任务；失败或修正配置后可再次保存或手动同步。
- 本地缺项直接返回；连接服务校验类目缺项后才允许创建。只接受与店铺、SKU、
  幂等请求键匹配且状态为 draft 的草稿编号。
- 数据库唯一记录防并发重复。已有草稿只返回原编号，不更新或新建；资料改变时提示核对。
  超时、进程退出、无法确认的响应进入待核对状态；重复 POST 只查回结果，不重建。
- 有同步记录的产品禁止修改 SKU 或删除，以保留去重依据；可将本站产品设为 Draft。
  草稿即使已在 My Alibaba 删除，也不会自行重建，需人工核对记录。

## 部署数据库

在目标 PostgreSQL 数据库的备份和常规发布流程中执行新增字段脚本，再发布代码：

```sh
npx prisma db execute --file prisma/updates/20261112-alibaba-drafts.sql --schema prisma/schema.prisma
npx prisma db execute --file prisma/updates/20261112-alibaba-listing.sql --schema prisma/schema.prisma
npx prisma generate
npm test
npm run build
```

SQL 可重复执行，旧产品 SKU 为空、审核为空、同步默认关闭。部署时必须先执行 SQL，
否则 Prisma 对 Product 的查询会因缺少新字段失败。本地测试使用模拟数据库和连接服务。

## 服务器配置

以下配置均是服务器私密环境变量，不能加 NEXT_PUBLIC_ 前缀。密钥至少 32 字符，
使用独立随机值。阿里 AppSecret、Session/Refresh Token 由授权连接服务的密钥管理保存，
不进入产品记录、浏览器或 GPT。这里的 gateway token 也不是阿里授权凭证。

```text
KELIKULI_ACTIONS_KEY=<独立的 GPT Actions 调用密钥>
ALIBABA_DRAFT_GATEWAY_URL=https://<已验证的授权连接服务>/kelikuli
ALIBABA_DRAFT_GATEWAY_TOKEN=<连接服务专用密钥>
ALIBABA_SHOP_ID=<已授权店铺的稳定标识>
ALIBABA_DRAFT_ENABLED=false
ALIBABA_AUTO_SYNC_ENABLED=false
```

未配置或总开关关闭时不发出外部请求。仅填环境变量不能证明店铺权限已经通过。
保持两个开关关闭，直到管理员确认草稿权限与连接服务契约。接通后先开启
ALIBABA_DRAFT_ENABLED；PS01 在 My Alibaba 验收完成后再开启 ALIBABA_AUTO_SYNC_ENABLED。

## 待实现/验证：授权连接服务契约

`lib/alibaba-gateway.ts` 是连接服务客户端。下面是 **KELIKULI 自定义契约**，
不是阿里原生 API，也不是任何现有服务商已经支持的接口。不要把淘宝网关地址填入
ALIBABA_DRAFT_GATEWAY_URL。后续由自有应用适配器或已获授权服务商实现这些端点。

服务端固定发送 `method: alibaba.icbu.product.schema.add.draft`、`draftOnly: true` 和
`shopId`，使用 HTTPS POST + Bearer token，拒绝重定向。单次请求超时 25 秒，
整个路由最多 90 秒。连接服务必须把结果和幂等键持久化，支持请求方断线后的查询。
若未来改为长任务服务，应先扩展为队列/回执流程，不可通过盲目重试创建解决超时。

所有响应必须回传同一个 `shopId` 和精确的 `method`。响应只能包含契约字段、
公开的资料缺项信息，不能回显密钥、原始请求或授权 URL。

### POST /validate

请求的 `product` 包含 productId、sku、title、categoryId、language=en_US、currency=USD、
images、dimensions、moq、priceTiers（minQuantity/unitPrice）、description、leadTime。
本站相对图片路径在连接层转为 https://kelikuli.com/...。

连接服务需要检查授权，读取该店铺、该类目的最新 Schema，校验条件必填项、
物流/包装、属性枚举及图片规则，按要求导入图片银行并保存 fileId；必要的额外字段
应作为 missingFields 返回，后续按真实类目扩展后台录入。图片下载必须防止 SSRF，
校验解析后的 IP、每次重定向和文件大小/类型。这里的 URL 基础检查不替代下载安全检查。
该端点不得创建商品草稿或发布商品。

成功示例（仅为契约示例，不代表真实店铺或类目）：

```json
{
  "shopId": "authorized-shop",
  "method": "alibaba.icbu.product.schema.add.draft",
  "valid": true,
  "missingFields": [],
  "validationToken": "opaque-server-side-snapshot-token"
}
```

token 必须绑定店铺、SKU、完整校验资料、最新类目规则和已准备的图片，设置有效期。
缺项时返回 valid=false 和 `[{"field":"material","message":"请选择材质。"}]`。

### POST /drafts

请求增加 `sku`、`idempotencyKey`、`validationToken`。连接服务验证 token 与店铺/SKU，
通过 `alibaba.icbu.product.schema.add.draft` 保存草稿，不能调用正式发布接口。
相同店铺/SKU/幂等键必须复用结果；在阿里请求结果不明时禁止第二次创建。

```json
{
  "shopId": "authorized-shop",
  "method": "alibaba.icbu.product.schema.add.draft",
  "status": "draft",
  "sku": "PS01",
  "idempotencyKey": "same-request-key",
  "draftId": "actual-draft-id-returned-by-alibaba"
}
```

draftId 必须为字符串，保留大整数精度，不得把任意请求流水号当作草稿编号。

### POST /drafts/lookup

按 shopId、sku、idempotencyKey 查询持久化结果，并核对真实草稿归属和状态。
找到后返回与 /drafts 相同结构。找不到返回 status=not_found；不确定返回
status=pending。KELIKULI 在这两种情况下均保持 uncertain，不再次创建。
崩溃遗留的 syncing 记录超过两分钟也只进入查询流程。

阿里官方要求先读取商品 Schema 再提交，草稿和正式发布接口分离：
[商品接口变动说明](https://developer.alibaba.com/docs/doc.htm?articleId=119212&docType=1&treeId=456)、
[商品发布接入文档](https://developer.alibaba.com/docs/doc.htm?articleId=119213&docType=1&treeId=456)。
实际参数、返回结构、图片入库与授权刷新需按获批应用可见文档完成适配和实测。

## GPT Actions 配置

部署后导入 `/openapi/alibaba-drafts.json`（仓库同名文件也可直接复制）。
如部署域名不同，修改 servers.url。Authentication 选择 API Key / Bearer，
设置 KELIKULI_ACTIONS_KEY；该密钥只用于这两个接口，不能使用管理后台登录密钥、
Custom Lab 密钥或阿里凭证。先完成私有 GPT 的访问限制再配置密钥。
参考 [Actions 入门](https://developers.openai.com/api/docs/actions/getting-started) 和
[Actions 身份验证](https://developers.openai.com/api/docs/actions/authentication)。

接口：GET /api/integrations/alibaba/drafts?sku=PS01 检查；
POST /api/integrations/alibaba/drafts，JSON 只能包含 `{"sku":"PS01"}`。
后台管理员可使用已有会话调用。返回 422 表示缺项，202 表示同步中，409 表示待核对；
只有 status=draft 且有 draftId 才能报成功。GET 只读本地状态，不验证在线权限。

可用于专用 GPT 的指令：

```text
仅操作 KELIKULI 已保存、已审核的产品草稿。用户指定 SKU 后先调用
getAlibabaDraftStatus。缺少资料或授权时列出 missingFields，不编造价格、类目或图片。
用户要求保存国际站草稿时调用 saveAlibabaDraft，只传 SKU。
只有返回 status=draft 且存在 draftId 时，告诉用户草稿编号。
existing=true 时说明已存在；changedSinceSync=true 时说明资料改变未同步到已有草稿。
syncing 表示处理中，uncertain 表示需要核对，不能当作失败后无限重建。
本接口不能审核资料、修改产品、更新已有草稿或正式发布。
不索取或展示阿里授权密钥。
```

## PS01 验收前缺项

1. 主账号管理员确认商品 API 权限，指定自有应用或服务商，并确认支持草稿接口。
2. 完成上述连接服务与 OAuth/凭证刷新、店铺绑定及幂等结果存储。
3. 在后台找到真实 PS01 产品，确认唯一 SKU、英文内容、图片、类目、尺寸、MOQ、
   阶梯价及该类目额外必填项。仓库未提供可核实的 PS01 完整资料，不自动创建产品或填价。
4. 执行数据库升级、部署；开启手动同步，用真实授权跑一单。
5. 在 My Alibaba 核对图片、SKU、MOQ、价格和草稿状态，之后才能开启自动同步。

## 2026-11-12：包装与整套销售资料

新增 `Product.alibabaListing`（JSON 字符串），必须执行
`prisma/updates/20261112-alibaba-listing.sql`。管理后台和 Custom Lab 接收接口
共用校验规则；GPT 接收协议见 `public/openapi/custom-lab-products.json`。

- `salesUnit`: `piece` 或 `set`，未确定为空字符串。
- `piecesPerUnit`: 每个销售单位包含数量；个为 1，套至少 2。
- `minimumOrderQuantity`: 国际站起订量，独立于官网的 `moq`。
- `leadTimeMinDays`、`leadTimeMaxDays`: 已确认的交期天数。
- `packaging`: `lengthCm`、`widthCm`、`heightCm`、`grossWeightKg`、`confirmed`。
  按套销售填写整套含运输包装数据；未知数值保持 null，确认状态为 false。
- `attributes`: 材质、特征、工艺、图案、产品类型、风格、用途、原产国的英文值。
  1720 类目必填项已按实时 schema 收集；其他类目仍需远端 schema 校验。
- `alibabaPriceTiers`: 最多 4 档，USD 单价两位小数，计价单位与 salesUnit 相同。

网关 `product` 请求现在包含完整 `listing`，`moq` 使用国际站数量，
`websiteMoq` 仅用于保留来源语义。网关必须消费 `listing` 并映射到原生接口；
不能继续假设 `USD/piece`，也不能忽略包装或类目属性。结构资料纳入审核哈希。

Custom Lab 接口可保存这些事实，但不能传 `alibabaApprove`、
`alibabaApprovalHash` 或 `alibabaSyncEnabled` 来批准/触发国际站发布。
返回 `alibabaReadiness` 区分资料齐全和需要后续审核；官网发布不等于国际站发布。

### 本次交付状态

- Custom Lab 已通过 Sites 发布版本 42（2026-11-12），部署状态 `succeeded`。
  线上入口：<https://custom.kelikuli.com/admin/products>。
  源码提交：`5fec2c201eda1bb991c135b22abc6c31a550c800`。
  已在实际后台核对新增销售单位、MOQ、交期、包装、阶梯价、类目属性和缺项提示。
  GPT 建品工具使用相同结构，保存未知数据时保持空值。
- 主官网本地代码、类型检查、41 项测试和生产构建已完成；尚未部署到云服务器，
  也未执行生产数据库更新。部署前须确认服务器管理入口、项目目录及现有启动方式。
- Custom Lab 在提交到主官网前检查 `/api/custom-lab/products` 的能力版本。
  若主官网尚未升级，明确提示升级后再提交，不创建会丢失新字段的产品。
- 新增数据库字段是追加变更，旧数据不回填包装估算值；保留原服务器环境变量、
  上传目录及私有附件。发布后应检查后台旧产品可打开、新字段可保存并重新读取，
  再验证 Custom Lab 到主官网的完整数据传递。
