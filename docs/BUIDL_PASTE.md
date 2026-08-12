# DoraHacks BUIDL 粘贴清单（最终）

截止：**2026-08-13 12:00（UTC+2）** ≈ 北京时间当日 18:00 前。

## 字段

| 字段 | 粘贴值 |
|------|--------|
| Project name | KeeperHub Intent Agent |
| GitHub | https://github.com/linyf-B/keeperhub-intent-agent |
| Demo video | https://github.com/linyf-B/keeperhub-intent-agent/raw/main/docs/demo.mp4 |
| Transaction | https://sepolia.basescan.org/tx/0xebf18e68005f5ffdc75188a116100b9461a789ebf890bb7d7a983ead19504ff5 |

## Profile

| 字段 | 填什么 |
|------|--------|
| BUIDL name | KeeperHub Intent Agent |
| Logo | `docs/buidl-logo.png` |
| Vision | Headless onboarding template + intent CLI/MCP agent that lands real transfers via KeeperHub on Base Sepolia. |
| Category | **Crypto / Web3** |

## Description（整段粘贴 — 管理投稿更新）

This repo ships two things for the hackathon:

1. **Zero→first-tx bootstrap** (`npm run bootstrap`) — SIWE headless onboarding mints a `kh_` org API key without email captcha; polls until org wallet is ready; proves execution with amount-0 self-transfer on Base Sepolia.
2. **Execution agent** (CLI + MCP) — parses transfer intents and completes simulate → execute → poll via KeeperHub Direct Execution REST. MCP tools: `keeperhub_simulate_transfer`, `keeperhub_execute_transfer`, `keeperhub_get_status`.

Most agent demos stop at “the model decided something clever.” This hackathon asks for the last mile: the decision must become a real transaction.

KeeperHub Intent Agent:

1. Parses a plain-English instruction (`transfer 0 to 0x…`, `send 0.0001 to 0x… on 84532`).
2. Calls KeeperHub `POST /api/execute/transfer` with `simulate: true`.
3. On a clean simulation, broadcasts once with a stable `Idempotency-Key`.
4. Polls `GET /api/execute/{executionId}/status` and surfaces `transactionHash` / `transactionLink`.

The agent never signs with a local hot wallet for execution — KeeperHub’s organization wallet / sponsored path is the execution layer.

**Onboarding UX bounty:** `docs/BOUNTY_PITCH.md` · `docs/ONBOARDING_FEEDBACK.md` · `docs/QUICKSTART_HACKATHON.md`

## Submission 附加题

**Q1 — KeeperHub 界面：**

```
KeeperHub Direct Execution REST API + MCP server (simulate/execute/status tools). Not using workflow builder, x402, or MPP in this repo.
```

**Q2 — 交易链接：**

```
https://sepolia.basescan.org/tx/0xebf18e68005f5ffdc75188a116100b9461a789ebf890bb7d7a983ead19504ff5
```

**Q3 — Testnet / Mainnet：** Testnet（Base Sepolia 84532）

**Q4 — 诚实缺口：**

```
Transfer-only scope; deterministic regex intent parser (not LLM). Testnet proof on Base Sepolia. MCP layer for Cursor/Claude. No x402/MPP/workflow builder yet.
```

## Bounty

活动页 **Bounties** 标签 → 确认 Onboarding UX 是否需单独 Apply → 粘贴 `docs/BOUNTY_PITCH.md` 摘要 + 上述 doc 链接。

## 提交入口

https://dorahacks.io/hackathon/agents-onchain → **管理投稿**
