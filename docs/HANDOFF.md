# KeeperHub 黑客松交接上下文（给新对话窗口用）

> 更新时间：2026-08-12  
> 目标：DoraHacks「KeeperHub - Agents Onchain Hackathon」从 0 到提交 BUIDL

---

## 1. 比赛信息

| 项 | 内容 |
|----|------|
| 活动 | KeeperHub - Agents Onchain Hackathon |
| 页面 | https://dorahacks.io/hackathon/agents-onchain |
| 硬性规则 | 必须经 **KeeperHub** 发出**真实链上交易**（mock 不算） |
| 交付物 | ① GitHub 源码 ② Demo 视频 ③ 交易 tx 链接 |
| 截止 | 约 **2026-08-13 12:00**（以活动页为准，尽快交） |
| 参赛账号 | DoraHacks 已用 GitHub 登录并 **Register as Hacker**（Solo，不要队友） |

---

## 2. 项目是什么

**名称：** KeeperHub Intent Agent  

**一句话：** 自然语言解析转账意图 → KeeperHub Direct Execution API（simulate → execute → 轮询 status）→ 拿到 Base Sepolia 真实交易证明。

**技术栈：** TypeScript / Node 20 · KeeperHub REST（`kh_` org key）· 默认链 Base Sepolia `84532`

**远程开发目录（Linux）：** `/root/linyf/keeperhub-hackathon`  
**本地目录（Windows）：** `D:\_A\MeDOCS\Project\web3\keeperhub-intent-agent`  
**GitHub：** https://github.com/linyf-B/keeperhub-intent-agent  

---

## 3. 已完成

- [x] DoraHacks 报名（Solo）
- [x] 项目代码写好（agent / bootstrap / demo / README / 提交文案）
- [x] KeeperHub 用 **SIWE 钱包建号**（绕过邮箱验证码）
- [x] 跑通真实交易（sponsored）
- [x] 代码推到 GitHub（含 `docs/demo-record.html` 演示录制页）
- [x] 用户本地已打开项目

### 提交用的证明交易（主）

https://sepolia.basescan.org/tx/0xebf18e68005f5ffdc75188a116100b9461a789ebf890bb7d7a983ead19504ff5

### 备用证明交易

https://sepolia.basescan.org/tx/0x93c6ae1ef7aa425d33acfd022e2b12065cc2b9edd891217774ccb4bdf6fbc611

### KeeperHub 相关（远程 `.env`，勿提交到 Git）

- Org wallet：`0xada3b03c57242fbe60799ffce8d466f69dd2ddc9`
- API Key：在远程 `/root/linyf/keeperhub-hackathon/.env` 的 `KEEPERHUB_API_KEY`（`kh_` 开头）
- 登录用一次性 EOA 仅用于 bootstrap，勿当主钱包

---

## 4. 未完成（新窗口接着做）

1. [x] **录 Demo 视频**（本地 `8月12日.mp4` 已审过，可用）
2. [~] **Demo 链接**  
   - 临时直链（约 72h）：https://litter.catbox.moe/0dfp6u.mp4  
   - 仓库内：`docs/demo.mp4`（push 后可用 raw 持久链接）
3. [ ] **Submit BUIDL**（需你在浏览器 **Log in with GitHub**，自动化无法代登）  
   打开：https://dorahacks.io/hackathon/agents-onchain → Submit BUIDL  
   **照抄清单**：`docs/BUIDL_PASTE.md`

4. **安全收尾**
   - 删除聊天里发过的 GitHub PAT / 曾暴露的密码（务必已改密）
   - 勿把 `.env`、私钥提交进仓库

---

## 5. 关键文件

| 文件 | 用途 |
|------|------|
| `docs/DEMO_CUE.md` | 录 Demo 操作稿（不入镜） |
| `docs/demo-show.html` | 录 Demo 展示页（入镜） |
| `docs/demo-record.html` | 旧合并页（勿再入镜） |
| `docs/SUBMISSION.md` | DoraHacks 粘贴文案 |
| `docs/DEMO_SCRIPT.md` | 指向 CUE / show 的说明 |
| `docs/ONBOARDING_FEEDBACK.md` | 可选 $500 onboarding bounty |
| `src/agent.ts` | 核心：simulate → execute → poll |
| `src/bootstrap.ts` | SIWE 无验证码建号 |
| `npm run demo` | 一键再跑一笔证明（需 `kh_`） |

---

## 6. 已知坑

- DoraHacks / KeeperHub 有验证码；邮箱验证码 QQ 常收不到 → 已用钱包 SIWE 绕过
- GitHub 新网络登录易卡 2FA；`github.com` 从该 Linux 主机直连曾超时，**API `api.github.com` 可用**（曾用 Contents API 上传文件）
- **禁止**在聊天发 GitHub 登录密码；推送只用短效 PAT，用完 Revoke
- 本助手在远程 Linux，**不能直接写用户 Windows `D:\`**；本地靠 clone/pull

---

## 7. 新窗口开场提示词（可直接粘贴）

```text
继续 KeeperHub / DoraHacks 黑客松提交。
项目本地：D:\_A\MeDOCS\Project\web3\keeperhub-intent-agent
GitHub：https://github.com/linyf-B/keeperhub-intent-agent
已报名 Solo；真链 tx：
https://sepolia.basescan.org/tx/0xebf18e68005f5ffdc75188a116100b9461a789ebf890bb7d7a983ead19504ff5
当前待办：按 docs/demo-record.html 录 Demo → 上传拿链接 → 填 Submit BUIDL。
交接全文见：docs/HANDOFF.md
```
