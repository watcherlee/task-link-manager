# 固定链接部署指南（Vercel + Turso）

一次部署，获得 **24/7 在线** 的固定 HTTPS 链接（如 `https://task-link-manager.vercel.app/zh`），无需本机开机，随时发给朋友体验。

**费用：$0**（Vercel Hobby + Turso 免费额度对个人小范围测试足够）

---

## 你需要准备

- GitHub 账号（免费）
- [Turso](https://turso.tech) 账号（免费）
- [Vercel](https://vercel.com) 账号（免费，可用 GitHub 登录）

---

## 第一步：把代码推到 GitHub

在项目目录 `task-link-manager` 内：

```bash
git add .
git commit -m "准备 Vercel 部署"
git branch -M main
git remote add origin https://github.com/你的用户名/task-link-manager.git
git push -u origin main
```

若还没有 GitHub 仓库，先在 github.com 新建空仓库再 push。

---

## 第二步：创建 Turso 云数据库

1. 登录 [Turso Console](https://turso.tech/app)
2. 点击 **Create Database**，名称例如 `task-link-manager`
3. 进入该数据库 → **Connect** → 复制：
   - **Database URL**（形如 `libsql://xxx.turso.io`）
   - **Auth Token**（点击 Create Token）

4. （可选）用 Turso CLI 初始化表结构：

```bash
# 安装 CLI：https://docs.turso.tech/cli
turso db shell task-link-manager < lib/db/schema.sql
```

> 不手动执行也行：应用 **首次访问** 时会自动建表并写入预设标签。

---

## 第三步：部署到 Vercel

1. 打开 [vercel.com/new](https://vercel.com/new)
2. **Import** 你的 GitHub 仓库 `task-link-manager`
3. Framework 应自动识别为 **Next.js**，保持默认即可
4. 展开 **Environment Variables**，添加：

| 名称 | 值 |
|------|-----|
| `TURSO_DATABASE_URL` | 第二步复制的 Database URL |
| `TURSO_AUTH_TOKEN` | 第二步复制的 Auth Token |
| `CRON_SECRET` | 任意随机字符串（可选，保护滚存接口） |

5. 点击 **Deploy**，等待约 2–3 分钟

---

## 第四步：分享固定链接

部署成功后 Vercel 会给出域名，例如：

```
https://task-link-manager.vercel.app/zh
```

- 把 **`/zh`** 或 **`/en`** 链接发给测试者即可
- 使用文档：`https://你的域名.vercel.app/zh/guide`
- 可在 Vercel → Project → Settings → Domains 绑定自定义域名

---

## 本地开发 vs 线上

| 环境 | 数据库 |
|------|--------|
| 本地 `npm run dev` | `./data/tasks.db`（文件，与线上一致逻辑） |
| Vercel 生产 | Turso 云库（通过环境变量连接） |

本地数据 **不会** 自动同步到 Turso；若要把本地数据迁到云端，可用 Turso CLI 导入 SQLite 文件。

---

## 临时分享（本机隧道）

若尚未部署、只想快速演示，仍可用：

```bash
npm run dev    # 终端 1
npm run share  # 终端 2，复制 loca.lt 链接
```

注意：隧道链接 **不固定**，关电脑即失效。正式对外分享请用本指南的 Vercel 方案。

---

## 常见问题

**Q：部署后打开页面报错？**  
检查 Vercel 环境变量 `TURSO_DATABASE_URL` 和 `TURSO_AUTH_TOKEN` 是否填对，然后 Redeploy。

**Q：Bookmarklet 收藏到线上？**  
在设置页把 API 地址改为你的 Vercel 域名（如 `https://xxx.vercel.app`）。

**Q：免费额度够用吗？**  
Turso 免费约 5GB 存储、5 亿读/月；个人任务管理小范围测试完全够用。
