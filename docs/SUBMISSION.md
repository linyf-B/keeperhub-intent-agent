# DoraHacks BUIDL — draft copy

**Project name:** KeeperHub Intent Agent

**One-liner:** Headless onboarding template + intent CLI/MCP agent that lands real transfers via KeeperHub on Base Sepolia.

**Tracks / stack:** AI Agents · KeeperHub REST + MCP · Base Sepolia · TypeScript / Node 20

## Description (paste)

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

**Onboarding UX:** see `docs/ONBOARDING_FEEDBACK.md`, `docs/QUICKSTART_HACKATHON.md`, `docs/BOUNTY_PITCH.md`.

## Links

| Field | Value |
|-------|-------|
| GitHub | https://github.com/linyf-B/keeperhub-intent-agent |
| Demo video | https://github.com/linyf-B/keeperhub-intent-agent/raw/main/docs/demo.mp4 |
| Transaction proof | https://sepolia.basescan.org/tx/0xebf18e68005f5ffdc75188a116100b9461a789ebf890bb7d7a983ead19504ff5 |

（备用证明 tx：https://sepolia.basescan.org/tx/0x93c6ae1ef7aa425d33acfd022e2b12065cc2b9edd891217774ccb4bdf6fbc611 ）

## How judges can reproduce

```bash
git clone https://github.com/linyf-B/keeperhub-intent-agent.git
cd keeperhub-intent-agent
cp .env.example .env   # set KEEPERHUB_API_KEY=kh_...
npm install
npm run demo
```

Or headless signup: `ETH_PRIVATE_KEY=0x... npm run bootstrap` then `npm run demo`.

## Submission Q1 (KeeperHub surfaces)

```
KeeperHub Direct Execution REST API + MCP server (simulate/execute/status tools). Not using workflow builder, x402, or MPP in this repo.
```

## Submission Q4 (honest gaps)

```
Transfer-only scope; deterministic regex intent parser (not LLM). Testnet proof on Base Sepolia. MCP layer for Cursor/Claude. No x402/MPP/workflow builder yet.
```

## Team

Solo

## Contact

See DoraHacks BUIDL profile
