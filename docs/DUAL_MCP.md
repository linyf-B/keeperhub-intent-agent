# Pillar 3 — Dual MCP Execution Layer

One repo, **two MCP surfaces** — copy-paste into Cursor / Claude Code:

| Layer | URL / command | Best for |
|-------|---------------|----------|
| **Local stdio** | `npm run mcp` | REST Direct Execution, Workflows API, thin wrappers |
| **Official hosted** | `https://app.keeperhub.com/mcp` | Marketplace `search_workflows` / `call_workflow`, x402, 30+ tools |

Local server **bridges** to official MCP via `keeperhub_official_mcp_*` tools — one agent session, both layers.

## Copy-paste config

See [`docs/mcp-dual.json.example`](./mcp-dual.json.example) — merge into `.cursor/mcp.json` or Claude global MCP settings.

Replace:

- `/absolute/path/to/keeperhub-intent-agent` → your clone path
- `kh_...` → your org API key (never commit)

## Local tools (14)

Run `npm run mcp` — tools include:

- REST: `keeperhub_simulate_transfer`, `keeperhub_execute_transfer`, `keeperhub_get_status`, `keeperhub_poll_until_done`
- Workflows: `keeperhub_list_workflows`, `keeperhub_execute_workflow`, …
- Official bridge: `keeperhub_official_mcp_call`, `keeperhub_search_marketplace_workflows`, …

Full list: [`src/pitch.ts`](../src/pitch.ts) (`LOCAL_MCP_TOOLS`)

## Official hosted (recommended by KeeperHub)

```bash
# Claude Code example
claude mcp add --transport http --scope user keeperhub https://app.keeperhub.com/mcp \
  --header "Authorization: Bearer kh_..."
```

Paid workflows return x402 challenges — see [`X402_MPP.md`](./X402_MPP.md).

## Verify dual setup

```bash
npm start
# then:
mcp tools                    # lists official hosted tools
```

With local MCP connected in Cursor, both inventories appear in the agent tool list.
