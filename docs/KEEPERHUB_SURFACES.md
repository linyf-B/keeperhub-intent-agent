# KeeperHub surfaces used by this project

Maps hackathon judging criteria **“Use of KeeperHub surfaces”** to concrete code.

| Surface | How we use it | Entry point |
|---------|---------------|-------------|
| **Direct Execution REST** | simulate → execute → poll; receipts audit | `src/keeperhub.ts`, CLI `transfer` |
| **Workflows API** | create balance-check workflow; execute + wait | `src/keeperhub-workflows.ts`, CLI `setup workflow` |
| **Hosted MCP server** | list/call official tools; search/call marketplace | `src/keeperhub-mcp-client.ts`, MCP bridge tools |
| **Local MCP wrapper** | 14 stdio tools for Cursor/Claude | `npm run mcp` |
| **Audit trail** | `receipts[]`, workflow `transactionHashes[]` | `src/audit.ts`, CLI `audit` |
| **x402 / MPP** | challenge parse + wallet install path | `src/x402.ts`, `docs/X402_MPP.md` |
| **Headless onboarding** | SIWE bootstrap → `kh_` key | `npm run bootstrap` |

## Dual MCP architecture

```
Agent (Cursor / Claude)
    │
    ├─► npm run mcp  (local stdio)
    │       ├─ keeperhub_* REST tools
    │       └─ keeperhub_official_mcp_* bridge
    │
    └─► https://app.keeperhub.com/mcp  (remote HTTP, recommended by KeeperHub)
            ├─ execute_transfer / execute_workflow / …
            ├─ search_workflows / call_workflow (x402)
            └─ get_execution / list_executions (audit)
```

Configure **both** in `.cursor/mcp.json` for maximum coverage — see README.

## Treasury scenario (originality)

`scenario treasury 0xOrgWallet` runs a **multi-step plan**:

1. Balance read via **Workflow** (`web3/check-balance`) — no local RPC  
2. Transfer via **Direct Execution** with simulation gate  
3. **Audit trail** dump from status receipts  

This demonstrates “agent decides → KeeperHub executes → observable outcome” beyond a single zero-value proof.

## CLI quick reference

```bash
npm run demo          # whoami + treasury scenario + MCP tool count
npm start             # interactive
transfer 0 to 0x...   # one-shot
audit direct_...      # receipts
mcp tools             # official tool list
search workflows test # marketplace (x402-aware errors)
```
