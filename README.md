# KeeperHub Intent Agent

**Vision:** *The agent that onboard itself — then executes onchain via KeeperHub.*

Built for the [Agents Onchain Hackathon](https://dorahacks.io/hackathon/agents-onchain).

## Three pillars

| Pillar | What | Try it |
|--------|------|--------|
| **1. Self-registering Agent** | Headless SIWE → `kh_` key → first tx (no captcha) | `npm run bootstrap` |
| **2. Audit-first Last Mile** | simulate gate → execute → `receipts` / verified hashes | `npm run demo` |
| **3. Dual MCP Layer** | Local REST/workflow MCP + official `app.keeperhub.com/mcp` | [`docs/mcp-dual.json.example`](./docs/mcp-dual.json.example) |

Full pitch: [`docs/PITCH_THREE_PILLARS.md`](./docs/PITCH_THREE_PILLARS.md) · [`AGENTS.md`](./AGENTS.md)

## Quick start

```bash
npm install
cp .env.example .env          # or: ETH_PRIVATE_KEY=0x... npm run bootstrap
npm run demo                  # pillars 2+3 (needs kh_ key)
npm start                     # interactive CLI
```

## KeeperHub surfaces

| Surface | Status |
|---------|--------|
| Direct Execution REST | ✅ |
| Workflows API | ✅ |
| Official hosted MCP | ✅ bridge |
| Local MCP (14 tools) | ✅ `npm run mcp` |
| Audit trail | ✅ |
| x402 / MPP | ✅ detect + wallet path |
| Headless bootstrap | ✅ Pillar 1 |

Details: [`docs/KEEPERHUB_SURFACES.md`](./docs/KEEPERHUB_SURFACES.md)

## Onboarding bounty

| Asset | Link |
|-------|------|
| Bootstrap | [`src/bootstrap.ts`](./src/bootstrap.ts) |
| Self-onboarding story | [`docs/SELF_ONBOARDING_AGENT.md`](./docs/SELF_ONBOARDING_AGENT.md) |
| Feedback | [`docs/ONBOARDING_FEEDBACK.md`](./docs/ONBOARDING_FEEDBACK.md) |
| Docs PR draft | [`contributions/keeperhub-docs-quickstart-pr.md`](./contributions/keeperhub-docs-quickstart-pr.md) |
| Bounty pitch | [`docs/BOUNTY_PITCH.md`](./docs/BOUNTY_PITCH.md) |

## Architecture

```
Pillar 1: bootstrap (SIWE → kh_ → proof tx)
        │
        ▼
Pillar 2: intent + planner → simulate → execute → audit trail
        │
        ▼
Pillar 3: npm run mcp (local) + app.keeperhub.com/mcp (official)
```

## Commands

```bash
scenario treasury 0xOrgWallet on 84532
transfer 0 to 0xOrgWallet
audit direct_abc123
mcp tools
```

## MCP — dual config

Copy [`docs/mcp-dual.json.example`](./docs/mcp-dual.json.example) → `.cursor/mcp.json`. See [`docs/DUAL_MCP.md`](./docs/DUAL_MCP.md).

## Tests & proof

```bash
npm test && npm run typecheck
```

| Item | Link |
|------|------|
| Demo video | [`docs/demo.mp4`](./docs/demo.mp4) |
| Proof tx | [Base Sepolia](https://sepolia.basescan.org/tx/0xebf18e68005f5ffdc75188a116100b9461a789ebf890bb7d7a983ead19504ff5) |

## Docs

- [KeeperHub MCP](https://docs.keeperhub.com/ai-tools/mcp-server)
- [Direct Execution API](https://docs.keeperhub.com/api/direct-execution)
- [Agentic Wallets](https://docs.keeperhub.com/ai-tools/agentic-wallet)
