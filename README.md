# KeeperHub Intent Agent

Natural-language agent that turns a transfer instruction into a **real onchain transaction** executed through [KeeperHub](https://keeperhub.com) (MCP-compatible Direct Execution API).

Built for the [KeeperHub Agents Onchain Hackathon](https://dorahacks.io/hackathon/agents-onchain) on DoraHacks.

> One rule of the hackathon: land real transactions via KeeperHub — not mocks. This project does exactly that: **simulate → execute → poll status → explorer link**.

## Onboarding contribution (bounty)

This repo is also a **zero→first-tx starter template** for new KeeperHub builders:

| Asset | Purpose |
|-------|---------|
| [`npm run bootstrap`](./src/bootstrap.ts) | Headless SIWE signup → `kh_` key + `.env` + proof transfer (no email captcha) |
| [`docs/QUICKSTART_HACKATHON.md`](./docs/QUICKSTART_HACKATHON.md) | 5-step hacker one-pager |
| [`docs/ONBOARDING_FEEDBACK.md`](./docs/ONBOARDING_FEEDBACK.md) | Reproducible UX friction + suggested doc/API fixes |
| [`docs/BOUNTY_PITCH.md`](./docs/BOUNTY_PITCH.md) | Executive summary for onboarding bounty judges |

## What it does

```
you> transfer 0 to 0xYourOrgWallet
        │
        ▼
  Intent parser (deterministic NL)
        │
        ▼
  KeeperHub POST /api/execute/transfer  (simulate: true)
        │
        ▼
  KeeperHub POST /api/execute/transfer  + Idempotency-Key
        │
        ▼
  Poll GET /api/execute/{id}/status
        │
        ▼
  transactionLink (Base Sepolia / explorer)
```

Why KeeperHub: the agent reasons; KeeperHub handles retries, gas sponsorship on supported chains, and an auditable execution trail.

## Quick start

### Option A — You already have a KeeperHub `kh_` key

1. Copy `.env.example` → `.env` and set `KEEPERHUB_API_KEY`
2. `npm install`
3. `npm start` then try `whoami` and `transfer 0 to <org wallet>`
4. Or one-shot demo: `npm run demo`

### Option B — Headless signup (no browser captcha)

Needs a **throwaway** EOA private key (never use a funded mainnet key):

```bash
npm install
ETH_PRIVATE_KEY=0x... npm run bootstrap
# writes .env with kh_ key, org wallet, and a zero-value proof transfer
npm run demo
```

Default chain: **Base Sepolia (`84532`)**. Zero-value self-transfer works even when the org wallet has no balance (gas sponsored).

## Commands

| Input | Effect |
|-------|--------|
| `help` | Show help |
| `whoami` | Print org wallet / user |
| `transfer 0 to 0x...` | Execute via KeeperHub |
| `send 0.0001 to 0x... on 84532` | Same, with amount + chain |

Proofs are saved under `proofs/`.

## MCP server (Cursor / Claude)

Expose KeeperHub simulate / execute / status as MCP tools over stdio:

```bash
npm run mcp
```

**Cursor** — add to `.cursor/mcp.json` (or global MCP settings):

```json
{
  "mcpServers": {
    "keeperhub-intent-agent": {
      "command": "npx",
      "args": ["tsx", "src/mcp-server.ts"],
      "cwd": "/absolute/path/to/keeperhub-intent-agent",
      "env": {
        "KEEPERHUB_API_KEY": "kh_..."
      }
    }
  }
}
```

Tools: `keeperhub_simulate_transfer` · `keeperhub_execute_transfer` · `keeperhub_get_status`

Requires `KEEPERHUB_API_KEY` in env (or `.env` when run from repo root).

## Hackathon submission checklist

- [ ] Public GitHub repo (this project)
- [ ] Demo video (see `docs/DEMO_SCRIPT.md`)
- [ ] Explorer / KeeperHub `transactionLink` from a successful run
- [ ] Paste text from `docs/SUBMISSION.md` into DoraHacks BUIDL form

## Security

- Never commit `.env` or private keys
- Prefer amount `0` self-transfer for the first proof
- Use a throwaway key for bootstrap only

## Docs

- KeeperHub MCP: https://docs.keeperhub.com/ai-tools/mcp-server
- Direct Execution API: https://docs.keeperhub.com/api/direct-execution
- Headless onboarding: https://docs.keeperhub.com/api/headless-onboarding
