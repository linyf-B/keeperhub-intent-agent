---
title: "Agents Onchain hackathon — zero to first transaction"
description: "Headless onboarding and safe first write for the Agents Onchain hackathon."
---

# Agents Onchain hackathon — zero to first transaction

Contributed from the [KeeperHub Intent Agent](https://github.com/linyf-B/keeperhub-intent-agent) hackathon project (DoraHacks Agents Onchain).

## 1. Headless API key (no email captcha)

Use SIWE against `POST /api/auth/siwe/nonce` + `/verify`, then create an org key.

Reference implementation: https://github.com/linyf-B/keeperhub-intent-agent/blob/main/src/bootstrap.ts

```bash
ETH_PRIVATE_KEY=0x... npm run bootstrap
```

Use a throwaway EOA only — never a funded mainnet wallet.

## 2. Pick a testnet

`GET /api/chains` — choose a chain where `isEnabled` and `isTestnet` are both `true` (Base Sepolia `84532` recommended).

## 3. Safe first write

1. `POST /api/execute/transfer` with `"simulate": true`
2. Continue only if `success: true` and `wouldRevert: false`
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

## Further reading

- Onboarding feedback (repro + fixes): https://github.com/linyf-B/keeperhub-intent-agent/blob/main/docs/ONBOARDING_FEEDBACK.md
- Self-onboarding agent: https://github.com/linyf-B/keeperhub-intent-agent/blob/main/docs/SELF_ONBOARDING_AGENT.md
