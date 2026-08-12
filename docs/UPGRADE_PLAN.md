# 冲奖改造清单（Cursor 逐项执行）

> 目标：提高拿 **Onboarding Bounty（~$500）** 或 **主赛道第 3（$800）** 的概率。  
> 不保证获奖。BUIDL 已提交，硬规则已满足。  
> 用法：对 Cursor 说「做清单 #N」或「从 P0 开始全部做」。

---

## 赛道 A — Onboarding Bounty（主线，优先）

| # | 任务 | 产出文件 / 改动 |
|---|------|-----------------|
| A1 | 写 bounty 英文 pitch（200 词：问题→方案→证据链接） | `docs/BOUNTY_PITCH.md` |
| A2 | 扩写 onboarding 反馈：每条加 **复现步骤 + 建议改法 + 影响** | `docs/ONBOARDING_FEEDBACK.md` |
| A3 | 黑客松一页纸 quickstart（5 步零→tx） | `docs/QUICKSTART_HACKATHON.md` |
| A4 | README 顶部加 **Onboarding contribution** 小节，链到 bootstrap + 上述 docs | `README.md` |
| A5 | 修文档：`SUBMISSION.md` 里 `cd keeperhub-hackathon` → `keeperhub-intent-agent` | `docs/SUBMISSION.md` |
| A6 | 修 `BUIDL_PASTE.md` Description 截断 + 加 bounty 首段叙事 | `docs/BUIDL_PASTE.md` |
| A7 | `HANDOFF.md` 更新为「BUIDL 已交 + 冲奖改造中」 | `docs/HANDOFF.md` |
| A8 | push 全部改动到 GitHub | git commit + push |

**BUIDL 侧（你在网页做，Cursor 给文案）：**

| # | 任务 | 粘贴位置 |
|---|------|----------|
| A9 | Description 首段强调 bootstrap 模板 + onboarding 反馈 | 管理投稿 → Description |
| A10 | 活动页 **Bounties** 标签确认是否需单独 Apply；若要则提交 | DoraHacks 网页 |

---

## 赛道 B — 主赛道抬分（副线，补 MCP）

| # | 任务 | 产出文件 / 改动 |
|---|------|-----------------|
| B1 | 新增 MCP server，复用 `keeperhub.ts` | `src/mcp-server.ts` |
| B2 | tools：`keeperhub_simulate_transfer` / `keeperhub_execute_transfer` / `keeperhub_get_status` | 同上 |
| B3 | 依赖 `@modelcontextprotocol/sdk` + script `"mcp": "tsx src/mcp-server.ts"` | `package.json` |
| B4 | README **MCP** 小节 + Cursor `mcp.json` 配置示例 | `README.md` |
| B5 | 可选：`docs/MCP_SETUP.md` 逐步说明 | `docs/MCP_SETUP.md` |
| B6 | BUIDL Submission **Q1** 文案改为 REST + MCP（管理投稿若可改） | 给用户粘贴文本 |

---

## 赛道 C — 可靠性 / 诚实加分（可选）

| # | 任务 | 产出文件 / 改动 |
|---|------|-----------------|
| C1 | `intent.ts` 单元测试（5 条：transfer/send/whoami/非法输入/带 chainId） | `src/intent.test.ts` + `package.json` test script |
| C2 | 失败场景文档（空钱包 simulate、checksum、poll 超时、idempotency 冲突） | `docs/FAILURE_MODES.md` |
| C3 | `keeperhub.ts` simulate 失败时打印友好 hint（对应 feedback #2） | `src/keeperhub.ts` |
| C4 | BUIDL **Q4** 诚实文案更新（regex agent、无 x402、MCP 若已做则写上） | 给用户粘贴文本 |

---

## 不做（Cursor 别碰）

- 重写成 LangChain / Eliza / 大框架
- 主网大额转账
- 重录 90s 全片 Demo（除非单独录 30s MCP 附录）
- workflow builder / x402 / MPP 深集成
- 虚假 LLM agent 叙事

---

## 统一对外口径（改完沿用）

**Vision / 一句话：**

```
Headless onboarding template + intent CLI/MCP agent that lands real transfers via KeeperHub on Base Sepolia.
```

**Description 首段（管理投稿）：**

```
This repo ships two things: (1) zero→first-tx bootstrap (`npm run bootstrap`) via SIWE headless onboarding—no email captcha; (2) an execution agent (CLI + MCP) with simulate → execute → poll via KeeperHub REST. See docs/ONBOARDING_FEEDBACK.md and docs/QUICKSTART_HACKATHON.md.
```

**Submission Q1（B 完成后）：**

```
KeeperHub Direct Execution REST API + MCP server (simulate/execute/status tools). Not using workflow builder, x402, or MPP in this repo.
```

**Submission Q4（诚实）：**

```
Transfer-only scope; deterministic regex intent parser (not LLM). Testnet proof on Base Sepolia. MCP optional layer. No x402/MPP/workflow builder yet.
```

---

## 自检（做完勾）

**Bounty 最低集：** A1–A8 + A9  
**主赛道补强：** + B1–B4  
**专业感：** + C1–C2  

---

## Cursor 开场指令（复制即用）

```text
按 docs/UPGRADE_PLAN.md 从 P0 开始执行：
先做 A1→A8 全部改完并 push，再做 B1→B4。
每项改完简要说明改了什么。BUIDL 网页文案列出来给我粘贴。
```

或单条：

```text
执行 UPGRADE_PLAN 清单 #A3
```

```text
执行 UPGRADE_PLAN 清单 B1–B4
```
