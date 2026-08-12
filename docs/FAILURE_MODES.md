# Failure modes & reliability — KeeperHub Intent Agent

How this agent handles the failure categories called out in the [Direct Execution API](https://docs.keeperhub.com/api/direct-execution) and hackathon judging criteria.

## Safe first-write sequence

Every fund-moving path follows:

1. `simulate: true` — refuse broadcast if `wouldRevert` or HTTP ≥ 400  
2. Stable `Idempotency-Key` (SHA-256 of `taskId|chainId|recipient|amount|token`)  
3. Single broadcast  
4. Poll `GET /api/execute/{id}/status` honoring `X-Poll-Interval-Hint`  
5. Surface **audit trail**: `receipts[]`, `sponsored`, `transactionLink`

Implemented in: `src/keeperhub.ts` (`safeDirectTransfer`), `src/agent.ts`, MCP tools.

## Idempotency conflicts

| Code | Agent behaviour |
|------|-----------------|
| `idempotency_in_progress` | Retry with **same key** (bounded backoff via `withRetry`) |
| `idempotency_conflict` + `originalExecutionId` | Poll original execution — do **not** rotate key |
| `idempotentReplay: true` | Logged in audit output — cached outcome, not a new tx |

## Rate limits (429)

`keeperhubFetch` wraps calls with `withRetry` (max 4 attempts, respects `Retry-After` header).

## Simulation failures

| Symptom | Mitigation in this repo |
|---------|-------------------------|
| Empty wallet / CALL_EXCEPTION on non-zero amount | README + bootstrap use amount `"0"` self-transfer on Base Sepolia |
| Bad checksum | Addresses lowercased in idempotency; docs in `ONBOARDING_FEEDBACK.md` |
| Wrong API host | `KEEPERHUB_BASE` defaults to `app.keeperhub.com` |

## Workflow executions

- Use `GET .../wait?timeoutMs=` instead of blind polling loops  
- Read `transactionHashes[].verified` + `receiptStatus` — authoritative audit  
- Per-step logs via `GET .../logs` for debugging

## Official MCP cold start

Official MCP `create_workflow` may return `upstream_cold_start` — retry with same `idempotency_key` (documented in KeeperHub MCP docs). Our bridge tool `keeperhub_official_mcp_call` surfaces raw errors for agent retry.

## x402 / MPP (paid workflows)

Paid marketplace workflows return HTTP 402 / MCP tool errors. This repo:

- Parses challenge via `src/x402.ts`  
- Prints install steps for `@keeperhub/wallet`  
- Does **not** auto-pay without wallet installed (by design — safety)

See [`X402_MPP.md`](./X402_MPP.md).

## Tests

```bash
npm test
```

Covers: intent parsing, idempotency canonicalization, retry classification, planner.
