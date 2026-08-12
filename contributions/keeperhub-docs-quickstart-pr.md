# PR proposal: Hackathon quickstart one-pager for KeeperHub docs

> Copy this file into a PR against https://github.com/KeeperHub/keeperhub (docs site).
> Source: [keeperhub-intent-agent](https://github.com/linyf-B/keeperhub-intent-agent)

---

## Suggested path

`docs/hackathon/quickstart-agents-onchain.md`

## Content

```markdown
# Agents Onchain hackathon — zero to first transaction

## 1. Headless API key (no email captcha)

Use SIWE against `POST /api/auth/siwe/nonce` + `/verify`, then create an org key:

Reference implementation: https://github.com/linyf-B/keeperhub-intent-agent/blob/main/src/bootstrap.ts

## 2. Pick a testnet

`GET /api/chains` — choose `isEnabled && isTestnet` (Base Sepolia `84532` recommended).

## 3. Safe first write

1. `POST /api/execute/transfer` with `"simulate": true`
2. Continue only if `success: true` && `wouldRevert: false`
3. Same body, add `Idempotency-Key`, omit `simulate`
4. Poll `GET /api/execute/{executionId}/status` — honor `X-Poll-Interval-Hint`

First proof: amount `"0"` self-transfer to your org wallet on Base Sepolia.

## 4. MCP (recommended)

Remote: `https://app.keeperhub.com/mcp` with `Authorization: Bearer kh_...`

Tools: `execute_transfer`, `get_direct_execution_status`, `search_workflows`, `call_workflow`.

## 5. Field map (MCP ↔ REST)

| MCP | REST |
|-----|------|
| `chain_id` | `chainId` |
| `to_address` | `recipientAddress` |
| `simulate: true` | `"simulate": true` |
| `idempotency_key` | `Idempotency-Key` header |

Full feedback: https://github.com/linyf-B/keeperhub-intent-agent/blob/main/docs/ONBOARDING_FEEDBACK.md
```

## Why merge

- Reduces first-hour friction reported by multiple hackathon builders  
- Canonical host + simulate-first sequence in one page  
- Links to runnable bootstrap script judges can verify in <10 minutes
