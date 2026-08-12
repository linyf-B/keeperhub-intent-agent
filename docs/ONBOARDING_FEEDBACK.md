# KeeperHub onboarding feedback (hackathon bounty)

Collected while shipping a zero→first-tx agent for the Agents Onchain hackathon.

## What worked

- Headless SIWE path (`/api/auth/siwe/*`) avoids Turnstile on email signup — critical for agents.
- Direct Execution `simulate: true` then broadcast with `Idempotency-Key` is a clear safe sequence.
- Base Sepolia + `amount: "0"` self-transfer gets a real hash without faucets when sponsorship is on.
- Docs call out that org wallet ≠ login wallet — easy to miss, well documented once found.

## Friction for new builders

1. **Two hosts in old examples** — some older snippets mentioned `api.keeperhub.com` (NXDOMAIN). Live host is `app.keeperhub.com`. A single canonical base URL in every code sample would save the first hour.
2. **Empty-wallet simulate error** — non-zero amount on a fresh org wallet fails simulation with a generic `CALL_EXCEPTION` / missing revert data. Suggest returning an explicit `insufficient_funds` + `from` address in the JSON error.
3. **Checksum strictness** — mixed-case wrong EIP-55 rejects even when hex is right. Auto-normalizing to lowercase in the API (or clearer error text) would help LLM agents that copy checksummed strings incorrectly.
4. **MCP vs REST parity** — MCP `execute_transfer` and REST `/api/execute/transfer` field names (`chain_id` vs `chainId`) differ. A one-page “agent field map” would reduce wrong payloads from LLMs.
5. **First-run wallet null** — `GET /api/user` can return `walletAddress: null` for a few seconds after SIWE. Documenting the poll loop in the quickstart (not only headless page) would help.

## Suggested quickstart one-pager for hackers

```
1. SIWE or dashboard → kh_ key
2. Poll /api/user until walletAddress
3. simulate transfer amount 0 to self on 84532
4. execute + Idempotency-Key
5. poll status → transactionLink
```

Happy to expand any of these into a PR against the public docs if useful.
