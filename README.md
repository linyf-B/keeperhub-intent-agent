# KeeperHub Intent Agent

Natural-language agent that turns instructions into **real onchain transactions** through [KeeperHub](https://keeperhub.com) — built for the [Agents Onchain Hackathon](https://dorahacks.io/hackathon/agents-onchain).

> Hackathon rule: land real transactions via KeeperHub. This project covers **Direct Execution REST**, **Workflows API**, **hosted MCP**, **audit trails**, and **x402/MPP** integration paths.

## KeeperHub surfaces (judging checklist)

| Surface | Status |
|---------|--------|
| Direct Execution (simulate → execute → poll) | ✅ |
| Workflows API (create / execute / wait) | ✅ |
| Official hosted MCP (`app.keeperhub.com/mcp`) | ✅ bridge |
| Local MCP stdio tools (14 tools) | ✅ `npm run mcp` |
| Audit trail (`receipts`, `transactionHashes`) | ✅ |
| x402 / MPP paid workflows | ✅ detect + wallet path |
| Headless onboarding bootstrap | ✅ |

Details: [`docs/KEEPERHUB_SURFACES.md`](./docs/KEEPERHUB_SURFACES.md) · [`docs/FAILURE_MODES.md`](./docs/FAILURE_MODES.md) · [`docs/X402_MPP.md`](./docs/X402_MPP.md)

## Onboarding contribution (bounty)

| Asset | Purpose |
|-------|---------|
| [`npm run bootstrap`](./src/bootstrap.ts) | SIWE headless signup → `kh_` key + proof tx |
| [`docs/QUICKSTART_HACKATHON.md`](./docs/QUICKSTART_HACKATHON.md) | 5-step one-pager |
| [`docs/ONBOARDING_FEEDBACK.md`](./docs/ONBOARDING_FEEDBACK.md) | Reproducible friction + fixes |
| [`contributions/keeperhub-docs-quickstart-pr.md`](./contributions/keeperhub-docs-quickstart-pr.md) | Ready-to-open docs PR |
| [`docs/BOUNTY_PITCH.md`](./docs/BOUNTY_PITCH.md) | Executive summary for judges |

## Architecture

```
Natural language (CLI)
        │
        ▼
  Intent parser + planner (treasury scenario)
        │
        ├─► Direct Execution REST ──► simulate → execute → poll → receipts
        ├─► Workflows API ──────────► check-balance workflow → wait → audit
        ├─► Local MCP (stdio) ──────► 14 tools for Cursor/Claude
        └─► Official MCP (HTTP) ────► search/call workflows, x402-aware
```

## Quick start

### Option A — existing `kh_` key

```bash
npm install
cp .env.example .env   # set KEEPERHUB_API_KEY
npm run demo           # treasury scenario + tx link
npm start              # interactive
```

### Option B — headless bootstrap

```bash
ETH_PRIVATE_KEY=0x... npm run bootstrap
npm run demo
```

## Example commands

```bash
scenario treasury 0xYourOrgWallet on 84532   # balance → transfer → audit
transfer 0 to 0xYourOrgWallet
audit direct_abc123
workflows
setup workflow on 84532
run workflow wf_...
mcp tools
search workflows mcp-test
```

## MCP configuration

**Local wrapper** (REST + bridge):

```json
{
  "mcpServers": {
    "keeperhub-intent-agent": {
      "command": "npx",
      "args": ["tsx", "src/mcp-server.ts"],
      "cwd": "/absolute/path/to/keeperhub-intent-agent",
      "env": { "KEEPERHUB_API_KEY": "kh_..." }
    }
  }
}
```

**Official hosted MCP** (recommended by KeeperHub):

```json
{
  "mcpServers": {
    "keeperhub-official": {
      "url": "https://app.keeperhub.com/mcp",
      "headers": { "Authorization": "Bearer kh_..." }
    }
  }
}
```

## Tests

```bash
npm test
npm run typecheck
```

## Hackathon proof

| Item | Link |
|------|------|
| Demo video | [`docs/demo.mp4`](./docs/demo.mp4) |
| Onchain tx | [Base Sepolia](https://sepolia.basescan.org/tx/0xebf18e68005f5ffdc75188a116100b9461a789ebf890bb7d7a983ead19504ff5) |

## Security

- Never commit `.env` or private keys  
- Use throwaway EOA for bootstrap only  
- Amount `0` self-transfer for first proof on testnet

## Docs

- [KeeperHub MCP](https://docs.keeperhub.com/ai-tools/mcp-server)
- [Direct Execution API](https://docs.keeperhub.com/api/direct-execution)
- [Agentic Wallets / x402](https://docs.keeperhub.com/ai-tools/agentic-wallet)
