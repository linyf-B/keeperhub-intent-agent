# DoraHacks BUIDL 粘贴清单（最终）

截止：**2026-08-13 12:00（UTC+2）** ≈ 北京时间当日 18:00 前。

## 字段

| 字段 | 粘贴值 |
|------|--------|
| Project name | KeeperHub Intent Agent |
| GitHub | https://github.com/linyf-B/keeperhub-intent-agent |
| Demo video | https://litter.catbox.moe/0dfp6u.mp4 |
| Transaction | https://sepolia.basescan.org/tx/0xebf18e68005f5ffdc75188a116100b9461a789ebf890bb7d7a983ead19504ff5 |

> Demo 说明：当前为可播放直链（已验证 200 / video/mp4）。Litterbox **约 72 小时过期**；推仓库后可改用  
> `https://github.com/linyf-B/keeperhub-intent-agent/raw/main/docs/demo.mp4`  
> 或 YouTube/Loom 未列出链接（更稳）。

## Description（整段粘贴）

Most agent demos stop at “the model decided something clever.” This hackathon asks for the last mile: the decision must become a real transaction.

KeeperHub Intent Agent:

1. Parses a plain-English instruction (`transfer 0 to 0x…`, `send 0.0001 to 0x… on 84532`).
2. Calls KeeperHub `POST /api/execute/transfer` with `simulate: true`.
3. On a clean simulation, broadcasts once with a stable `Idempotency-Key`.
4. Polls `GET /api/execute/{executionId}/status` and surfaces `transactionHash` / `transactionLink`.

The agent never signs with a local hot wallet for execution — KeeperHub’s organization wallet / sponsored path is the execution layer. That matches the hackathon’s single hard rule: **use KeeperHub for onchain execution**.

Optional bootstrap (`npm run bootstrap`) uses KeeperHub’s SIWE headless onboarding so a throwaway EOA can mint a `kh_` org API key without solving a signup captcha — useful for agents and CI.

## 提交入口

https://dorahacks.io/hackathon/agents-onchain → **Log in（GitHub）** → **Submit BUIDL**
