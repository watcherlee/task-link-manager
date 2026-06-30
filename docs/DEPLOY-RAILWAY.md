# Railway 云部署指南（任务与链接管理器）

> 适合长期在线、手机/多设备访问。预计 **Hobby 方案约 $5/月（≈36 元）**。

---

## 一、费用说明（2026 年 Railway 官方定价）

### 是否需要付费？

**长期在线：基本需要。** 可以零成本「试用」，但试用期结束后要长期稳定运行，建议选 **Hobby（$5/月）**。

| 方案 | 月费 | 包含资源额度 | 适合本项目的程度 |
|------|------|--------------|------------------|
| **Trial 试用** | $0（30 天） | 一次性 **$5** 试用金 | ✅ 足够完成部署验证 |
| **Free 免费** | $0 | 每月 **$1** 额度 | ⚠️ 很紧张（0.5GB 内存 + 0.5GB 卷），可能跑不动或易休眠 |
| **Hobby 推荐** | **$5/月** | 含 **$5** 资源额度 | ✅ 个人日常够用，长期在线 |
| Pro | $20/月 | 含 $20 资源额度 | 团队/生产，个人不必 |

### 本项目大概花多少钱？

个人轻度使用（只有你一个人、任务量不大）：

| 资源 | 估算 |
|------|------|
| Next.js 服务（约 0.5GB 内存常驻） | 约 $2.5–4 / 月 |
| Volume 持久卷 0.5GB（SQLite 数据） | 约 $0.08 / 月 |
| 出站流量（偶尔手机访问） | 通常 < $0.5 / 月 |
| **合计资源用量** | 多数情况 **≤ $5 / 月** |

**Hobby 计划规则：** 月费 $5，其中已含 $5 资源额度。

- 资源用量 ≤ $5 → 账单 **就是 $5**（最常见）
- 资源用量 > $5 → 账单 = **$5 + 超出部分**

官方定价页：https://railway.com/pricing  
详细计费：https://docs.railway.com/pricing/plans

### 试用怎么算？

1. 新账号注册 → **30 天 + $5 试用金**（通常无需绑卡即可开始）
2. 试用期内可完整体验 Hobby 级别能力
3. 试用结束或 $5 用完 → 降为 Free（$1/月）或升级 Hobby

---

## 二、部署前准备（本地已完成）

项目已包含：

- `Dockerfile` — Railway 自动构建
- `railway.toml` / `railway.json` — 部署配置
- 环境变量 `TASKS_DB_PATH=/data/tasks.db` — SQLite 路径

---

## 三、一步步部署（约 15 分钟）

### 步骤 1：代码推到 GitHub

在项目目录打开终端：

```powershell
cd "D:\个人任务管理系统\task-link-manager"

# 首次提交（若尚未提交）
git add .
git commit -m "准备 Railway 云部署"

# 在 GitHub 网页新建空仓库，例如：task-link-manager（不要勾选 README）
# 然后执行（把 YOUR_USERNAME 换成你的 GitHub 用户名）：
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/task-link-manager.git
git push -u origin main
```

> 没有 GitHub 账号？先注册：https://github.com/signup

---

### 步骤 2：Railway 导入仓库

1. 打开 https://railway.com/new
2. 用 **GitHub 登录** 并授权 Railway
3. 选择 **Deploy from GitHub repo**
4. 选中刚推送的 `task-link-manager` 仓库
5. Railway 会自动检测 `Dockerfile` 并开始构建（约 3–8 分钟）

---

### 步骤 3：挂载 Volume（SQLite 持久化，必做）

不挂载卷的话，**重启后任务数据会丢失**。

1. 在 Railway 项目画布中，**右键空白处** → **Add Volume**（或按 `Ctrl+K` 搜索 “Volume”）
2. 选择刚创建的应用 **Service**
3. **Mount Path** 填：`/data`
4. 容量：先用 **0.5 GB**（个人够用，可后续扩容）

---

### 步骤 4：设置环境变量

进入 Service → **Variables** 标签，添加：

| 变量名 | 值 |
|--------|-----|
| `TASKS_DB_PATH` | `/data/tasks.db` |
| `CRON_SECRET` | 随便一串随机字符（可选，用于定时滚存接口） |

保存后 Railway 会自动重新部署。

---

### 步骤 5：生成公网域名

1. Service → **Settings** → **Networking**
2. 点击 **Generate Domain**
3. 得到类似：`task-link-manager-production-xxxx.up.railway.app`

访问：**https://你的域名/zh**

---

### 步骤 6：验证

- [ ] 首页能打开
- [ ] 添加一条任务，刷新后仍在
- [ ] 右上角「分享」显示 **已上线**，可复制链接
- [ ] 设置页 Bookmarklet 的 API 地址改为 Railway 域名

---

## 四、部署后维护

| 操作 | 方法 |
|------|------|
| 更新代码 | `git push` → Railway 自动重新部署 |
| 查看日志 | Railway Dashboard → Deployments → View Logs |
| 备份数据 | 下载 Volume 内 `/data/tasks.db`（Railway CLI 或 Volume 文件浏览） |
| 控制费用 | Dashboard → Usage，设置 Spending Limit |

---

## 五、常见问题

**Q：构建失败，提示 better-sqlite3？**  
A：项目 Dockerfile 已包含编译依赖，确保 Railway 使用 Dockerfile 构建（非 Nixpacks 纯 Node）。

**Q：数据丢了？**  
A：检查 Volume 是否挂载到 `/data`，且 `TASKS_DB_PATH=/data/tasks.db`。

**Q：Free 计划能一直免费用吗？**  
A：每月只有 $1 额度，对本 Next.js 应用通常不够稳定；个人长期使用建议 Hobby $5/月。

**Q：不想用了怎么停费？**  
A：Railway 项目 → Settings → Delete Project，或降级/取消订阅。

---

## 六、我能帮你远程完成的部分

以下步骤 **必须你本人操作**（涉及账号登录）：

- [ ] GitHub 创建仓库并 push
- [ ] Railway 注册 / GitHub 授权
- [ ] 绑卡升级 Hobby（试用结束后若要长期在线）

本地代码、Docker、Volume 配置、环境变量说明均已就绪。按本文操作即可上线。

如有报错，把 Railway 构建日志截图发我，我可以帮你排查。
