# Hackathon quickstart — zero to first onchain tx

Target: **Base Sepolia (`84532`)** · **KeeperHub Direct Execution** · ~10 minutes.

## Prerequisites

- Node 20+
- A **throwaway** EOA private key (`ETH_PRIVATE_KEY`) for signup only — never a funded mainnet wallet
- Or an existing `kh_` org API key from [app.keeperhub.com](https://app.keeperhub.com)

## Path A — Already have `kh_` key

```bash
git clone https://github.com/linyf-B/keeperhub-intent-agent.git
cd keeperhub-intent-agent
cp .env.example .env
# edit .env → KEEPERHUB_API_KEY=kh_...
npm install
npm run demo
```

Copy the printed `transactionLink` / explorer hash for your BUIDL.

## Path B — Headless signup (no email captcha)

```bash
git clone https://github.com/linyf-B/keeperhub-intent-agent.git
cd keeperhub-intent-agent
npm install
ETH_PRIVATE_KEY=0xYOUR_THROWAWAY_KEY npm run bootstrap
npm run demo
```

`bootstrap` writes `.env` with your `kh_` key and org wallet, then proves execution with amount `0` self-transfer.

## The five steps (what bootstrap + demo do)

| Step | Action | API |
|------|--------|-----|
| 1 | Sign up / SIWE or dashboard | `POST /api/auth/siwe/*` or UI |
| 2 | Poll until org wallet exists | `GET /api/user` until `walletAddress` non-null |
| 3 | Simulate safe transfer | `POST /api/execute/transfer` + `"simulate": true` |
| 4 | Execute once | same endpoint + `Idempotency-Key` header |
| 5 | Poll proof | `GET /api/execute/{executionId}/status` → `transactionLink` |

## Recommended first command

Use **amount `0`** to your **org wallet** on **84532** — works with sponsored gas even when the org wallet has no balance:

```
transfer 0 to 0xYourOrgWalletFromWhoami
```

CLI: `npm start` → `whoami` → paste address into transfer.

## MCP (Cursor / Claude)

See README **MCP server** section — `npm run mcp` exposes simulate / execute / status tools over stdio.

## If something breaks

See `docs/ONBOARDING_FEEDBACK.md` and `docs/FAILURE_MODES.md` (if present).

## Canonical base URL

Always use **`https://app.keeperhub.com`** — not legacy `api.keeperhub.com`.
