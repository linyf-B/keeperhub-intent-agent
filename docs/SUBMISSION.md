# DoraHacks BUIDL — draft copy

**Project name:** KeeperHub Intent Agent

**One-liner:** A natural-language agent that decides a transfer intent and lands the transaction onchain through KeeperHub’s Direct Execution API (simulate → idempotent execute → status proof).

**Tracks / stack:** AI Agents · MCP-compatible KeeperHub API · Base Sepolia · TypeScript / Node 20

## Description (paste)

Most agent demos stop at “the model decided something clever.” This hackathon asks for the last mile: the decision must become a real transaction.

KeeperHub Intent Agent:

1. Parses a plain-English instruction (`transfer 0 to 0x…`, `send 0.0001 to 0x… on 84532`).
2. Calls KeeperHub `POST /api/execute/transfer` with `simulate: true`.
3. On a clean simulation, broadcasts once with a stable `Idempotency-Key`.
4. Polls `GET /api/execute/{executionId}/status` and surfaces `transactionHash` / `transactionLink`.

The agent never signs with a local hot wallet for execution — KeeperHub’s organization wallet / sponsored path is the execution layer. That matches the hackathon’s single hard rule: **use KeeperHub for onchain execution**.

Optional bootstrap (`npm run bootstrap`) uses KeeperHub’s SIWE headless onboarding so a throwaway EOA can mint a `kh_` org API key without solving a signup captcha — useful for agents and CI.

## Links to fill before submit

| Field | Value |
|-------|-------|
| GitHub | https://github.com/linyf-B/keeperhub-intent-agent |
| Demo video | _YouTube / Loom_ |
| Transaction proof | https://sepolia.basescan.org/tx/0xebf18e68005f5ffdc75188a116100b9461a789ebf890bb7d7a983ead19504ff5 |

（备用证明 tx：https://sepolia.basescan.org/tx/0x93c6ae1ef7aa425d33acfd022e2b12065cc2b9edd891217774ccb4bdf6fbc611 ）

## How judges can reproduce

```bash
git clone <repo>
cd keeperhub-hackathon
cp .env.example .env   # set KEEPERHUB_API_KEY=kh_...
npm install
npm run demo
```

## Team

Solo / _your DoraHacks name_

## Contact

_email or Discord_
