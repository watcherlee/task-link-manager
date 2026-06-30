# 任务与链接管理器

轻量级个人任务与链接管理：收集箱 → 本周任务 → 今日待办。

## 功能

- 双模式：**任务** / **收藏**（收藏仅留收集箱）
- 粘贴链接自动识别标题（B站、微信、飞书、小红书、YouTube 等）
- 三栏看板，拖拽迁移，移动端 Tab 切换
- 标签（预设 + 自定义）、备注
- 已完成归档、全局搜索
- 智能滚存（每日 / 每周一 Asia/Shanghai）
- Bookmarklet 一键收藏当前页
- 中英双语

## 启动

```bash
cd task-link-manager
npm install
npm run dev
```

打开 http://localhost:3000/zh

## 部署与分享

### 固定链接分享（推荐，免费）

部署到 **Vercel + Turso** 后获得永久 HTTPS 链接（如 `https://xxx.vercel.app/zh`），24/7 在线，随时分享、无需本机开机。

详见 `docs/DEPLOY-VERCEL-TURSO.md` 或应用内 **分享 → 部署指南**。

### 临时演示（本机隧道）

```powershell
# 终端 1
npm run dev

# 终端 2
npm run share
```

将输出的 `https://xxx.loca.lt/zh` 发给朋友。**链接不固定**，关电脑即失效。

### Docker 本地（可选）

```bash
npm run deploy:docker
```

## 环境变量

| 变量 | 说明 |
|------|------|
| `TASKS_DB_PATH` | 本地 SQLite 路径（默认 `./data/tasks.db`） |
| `TURSO_DATABASE_URL` | 生产 Turso 数据库 URL |
| `TURSO_AUTH_TOKEN` | 生产 Turso 认证 Token |
| `CRON_SECRET` | 生产环境 cron 接口密钥（可选） |

## 数据

- 本地：`data/tasks.db`（自动创建）
- 生产：Turso 云数据库（Vercel 环境变量配置）

## Bookmarklet

1. 打开 **设置** 页配置 API 地址
2. 复制 Bookmarklet 代码到浏览器书签
3. 在任意页面点击书签即可收藏到收集箱

## 滚存

- 开发：`npm run rollover`
- 打开应用时会自动尝试补偿执行
- 生产：Vercel Cron 访问 `/api/cron/rollover`（配置 `CRON_SECRET`）

## 测试

```bash
npm test
```

## 链接识别限制

微信公众号、小红书等可能有反爬，失败时可手动编辑标题，URL 仍会保存。

## 技术栈

Next.js 16, SQLite (libSQL / Turso), Tailwind, next-intl, @dnd-kit
