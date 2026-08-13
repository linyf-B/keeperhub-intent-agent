# Pillar 2 — Audit-first Last Mile

**Principle:** The model (or regex parser) may *decide* — KeeperHub *proves* what landed onchain.

Every fund-moving path in this repo follows the same gate:

```
intent → simulate (refuse if wouldRevert) → execute + Idempotency-Key → poll → audit trail
```

## Direct Execution audit

`GET /api/execute/{id}/status` returns authoritative evidence:

- `receipts[].verified` + `receiptStatus` — re-fetched from chain before `completed`
- `sponsored` — gas-sponsored path flag
- `transactionLink` — explorer proof
- `idempotentReplay` — cached replay (not a new tx)

CLI:

```bash
transfer 0 to 0xOrgWallet
audit direct_abc123
```

Implementation: [`src/audit.ts`](../src/audit.ts) · [`src/keeperhub.ts`](../src/keeperhub.ts) (`safeDirectTransfer`)

## Workflow audit

Workflow runs expose verified hashes:

```bash
setup workflow on 84532
run workflow wf_...
```

Uses `GET .../executions/{id}/wait` and `transactionHashes[].verified`.

## Demo scenario (all gates in one command)

```bash
scenario treasury 0xOrgWallet on 84532
```

Plan: **balance (workflow read) → transfer (direct execution) → audit (receipts dump)**

See [`src/planner.ts`](../src/planner.ts) · `npm run demo`

## Reliability

- Bounded retry on 429 / 5xx / `idempotency_in_progress` — [`src/retry.ts`](../src/retry.ts)
- Failure catalogue — [`FAILURE_MODES.md`](./FAILURE_MODES.md)
- Tests — `npm test`
