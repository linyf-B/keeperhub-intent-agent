# KeeperHub onboarding feedback (hackathon bounty)

Collected while shipping a zero→first-tx agent for the [Agents Onchain hackathon](https://dorahacks.io/hackathon/agents-onchain).

**Evidence in this repo:** `src/bootstrap.ts` · `docs/QUICKSTART_HACKATHON.md` · `docs/BOUNTY_PITCH.md`

---

## What worked

- Headless SIWE path (`/api/auth/siwe/*`) avoids Turnstile on email signup — critical for agents and CI.
- Direct Execution `simulate: true` then broadcast with `Idempotency-Key` is a clear safe sequence.
- Base Sepolia + `amount: "0"` self-transfer gets a real hash without faucets when sponsorship is on.
- Docs call out that org wallet ≠ login wallet — easy to miss, well documented once found.

---

## Friction for new builders (with repro + fix)

### 1. Two hosts in old examples

| | |
|--|--|
| **Impact** | First hour lost to NXDOMAIN / wrong env; agents copy stale snippets. |
| **Repro** | Search older gists or issues for `api.keeperhub.com`; `curl` returns NXDOMAIN. Live API is `app.keeperhub.com`. |
| **Suggested fix** | Single canonical base URL in every code sample and error message; redirect or 301 note in docs header. |
| **Our mitigation** | `KEEPERHUB_BASE` defaults to `https://app.keeperhub.com` in `src/config.ts`; quickstart calls this out. |

### 2. Empty-wallet simulate error

| | |
|--|--|
| **Impact** | New org tries non-zero transfer before funding; simulation fails with opaque `CALL_EXCEPTION` / missing revert data. |
| **Repro** | Fresh `kh_` key → `POST /api/execute/transfer` simulate with `amount: "0.001"` to any address on 84532 without faucet. |
| **Suggested fix** | Return structured JSON: `{ "code": "insufficient_funds", "from": "0x...", "hint": "use amount 0 self-transfer on testnet" }`. |
| **Our mitigation** | README + quickstart recommend amount `0` self-transfer; bootstrap uses zero-value proof. |

### 3. Checksum strictness

| | |
|--|--|
| **Impact** | LLM copies wrong EIP-55 casing; API rejects valid hex. |
| **Repro** | Send `recipientAddress` with one wrong checksum character; compare with all-lowercase same address. |
| **Suggested fix** | Accept lowercase hex and normalize server-side, or error text: “invalid checksum, try lowercase 0x…”. |
| **Our mitigation** | `stableIdempotencyKey` lowercases addresses; document in quickstart. |

### 4. MCP vs REST field names

| | |
|--|--|
| **Impact** | Agents mixing MCP tool payloads with REST body shapes get 400s. |
| **Repro** | Compare MCP `execute_transfer` schema vs REST `chainId` / `recipientAddress` / `amount`. |
| **Suggested fix** | One-page **agent field map** table (MCP snake_case ↔ REST camelCase). |
| **Our mitigation** | Local MCP server (`src/mcp-server.ts`) wraps REST with explicit camelCase params matching Direct Execution API. |

### 5. First-run wallet null

| | |
|--|--|
| **Impact** | Scripts assume `GET /api/user` returns wallet immediately after SIWE; race causes null deref. |
| **Repro** | Complete SIWE → immediately call `/api/user`; sometimes `walletAddress: null` for several seconds. |
| **Suggested fix** | Document poll loop in main quickstart (not only headless onboarding page): retry every 2s up to 60s. |
| **Our mitigation** | `src/bootstrap.ts` polls until `walletAddress` is set before first transfer. |

---

## Suggested quickstart one-pager (for KeeperHub docs)

```
1. SIWE or dashboard → kh_ key
2. Poll /api/user until walletAddress
3. simulate transfer amount 0 to self on 84532
4. execute + Idempotency-Key
5. poll status → transactionLink
```

Full version: [`docs/QUICKSTART_HACKATHON.md`](./QUICKSTART_HACKATHON.md)

---

Happy to expand any item into a PR against [KeeperHub public docs](https://docs.keeperhub.com/).
