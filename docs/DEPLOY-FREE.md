# 免费部署方案（小范围测试）

> 适合个人首次产品、周边小范围试用。**全程 $0，无需信用卡。**

---

## 方案对比

| 方案 | 费用 | 24/7 在线 | 数据持久 | 改动量 | 推荐场景 |
|------|------|-----------|----------|--------|----------|
| **Cloudflare 隧道（推荐）** | **$0** | 电脑开机时 | ✅ 本地 SQLite | 无 | 小范围测试、给朋友试用 |
| Railway Hobby | ~$5/月 | ✅ | ✅ Volume | 无 | 长期正式运营 |
| Vercel + Turso | $0 | ✅ | ✅ 云数据库 | 需改数据库层 | 后续可升级 |

---

## 方案一：Cloudflare 快速隧道（最快，5 分钟）

无需注册，获得一个临时公网链接（形如 `https://xxx.trycloudflare.com`）。

### 步骤

**终端 1 — 启动应用：**
```powershell
cd "D:\个人任务管理系统\task-link-manager"
npm run dev
```

**终端 2 — 开启公网分享：**
```powershell
npm run share
```

终端会输出类似：
```
Your quick Tunnel has been created! Visit it at:
https://random-words.trycloudflare.com
```

把 **`https://xxx.trycloudflare.com/zh`** 发给测试的朋友即可。

### 说明

- ✅ 完全免费，无需 Cloudflare / GitHub 账号
- ✅ SQLite 数据仍在你的电脑上，不会丢
- ✅ 支持 HTTPS
- ⚠️ 链接在隧道关闭后会失效（重启 `npm run share` 会换地址）
- ⚠️ 你的电脑需保持开机且两个终端都在运行

---

## 方案二：Cloudflare 固定域名（免费账号，链接不变）

适合测试周期较长、希望链接固定的情况。

1. 免费注册 https://dash.cloudflare.com/sign-up
2. 安装 cloudflared：https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
3. 按官方文档创建 Named Tunnel，指向 `http://localhost:3000`

固定链接可重复使用，仍 **$0**（Cloudflare Zero Trust 免费层够用）。

---

## 方案三：Docker 本地 + 隧道（更接近「正式环境」）

```powershell
npm run deploy:docker   # 本地 Docker 启动
npm run share           # 另开终端，暴露到公网
```

---

## 费用说明

### Cloudflare 隧道：$0

- Quick Tunnel：免费，无额度限制（Fair Use）
- 固定隧道 + 免费 Cloudflare 账号：$0

### 若以后要上 24/7 免费云（可选）

| 服务 | 免费额度 | 对本项目 |
|------|----------|----------|
| **Vercel Hobby** | 100 万次函数调用/月 | 够用 |
| **Turso** | 5GB 存储、5 亿行读/月 | 够用 |
| 合计 | **$0** | 需将 SQLite 迁到 Turso（后续可做） |

小范围测试阶段 **不必现在做**，隧道方案足够。

---

## 测试 checklist

- [ ] 朋友能打开 `/zh` 页面
- [ ] 添加任务后刷新仍在
- [ ] 手机浏览器可访问
- [ ] 设置页 Bookmarklet API 地址改为隧道域名（若用收藏功能）

---

## 常见问题

**Q：链接打不开？**  
A：确认 `npm run dev` 和 `npm run share` 两个终端都在运行。

**Q：每次链接都变？**  
A：Quick Tunnel 特性。要固定链接用「方案二」Named Tunnel。

**Q：电脑关机后还能访问吗？**  
A：不能。小范围测试期间保持电脑运行，或以后升级 Turso+Vercel / Railway。

**Q：安全吗？**  
A：链接知道的人都能访问。仅适合可信的小范围测试，勿公开到社交媒体。
