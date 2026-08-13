# Agent instructions — KeeperHub Intent Agent

You are working on a hackathon project with **three pillars**. Prefer these flows when helping the user.

## Vision

**The agent that onboard itself — then executes onchain via KeeperHub.**

## Pillar 1 — Self-registering Agent

If `KEEPERHUB_API_KEY` is missing:

```bash
ETH_PRIVATE_KEY=0x... npm run bootstrap
```

Never use a funded mainnet key. Read [`docs/SELF_ONBOARDING_AGENT.md`](docs/SELF_ONBOARDING_AGENT.md).

## Pillar 2 — Audit-first Last Mile

Never skip simulation before broadcast. After execute, always surface audit trail (`receipts` or `transactionHashes`).

```bash
npm run demo
# or: scenario treasury 0xOrgWallet on 84532
```

Read [`docs/AUDIT_FIRST.md`](docs/AUDIT_FIRST.md).

## Pillar 3 — Dual MCP

Configure both servers from [`docs/mcp-dual.json.example`](docs/mcp-dual.json.example). Run `npm run mcp` for local tools; official at `https://app.keeperhub.com/mcp`.

Read [`docs/DUAL_MCP.md`](docs/DUAL_MCP.md).

## Proof requirements (hackathon)

- Real tx via KeeperHub (not mocks)
- Demo: `docs/demo.mp4` or re-record `npm run demo`
- GitHub: public repo with README
