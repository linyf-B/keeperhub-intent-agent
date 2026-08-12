# x402 / MPP integration

KeeperHub paid marketplace workflows settle via **x402** (Base USDC) or **MPP** (Tempo USDC.e). This agent integrates at three levels:

## 1. Detection (always on)

When `call_workflow` or `search_workflows` hits a paid listing:

- Official MCP returns a tool error with 402 challenge JSON  
- `src/x402.ts` parses the challenge  
- CLI / MCP respond with install instructions — **no silent failure**

```bash
search workflows my-paid-workflow
# → prints x402 amount, payTo, and wallet setup steps
```

## 2. Autopay (optional — requires wallet)

Install KeeperHub agentic wallet (Turnkey custody, no key on disk):

```bash
npx -p @keeperhub/wallet keeperhub-wallet skill install
npx -p @keeperhub/wallet keeperhub-wallet add
```

Then configure **official hosted MCP** in your agent:

```json
{
  "mcpServers": {
    "keeperhub-official": {
      "url": "https://app.keeperhub.com/mcp",
      "headers": { "Authorization": "Bearer kh_..." }
    }
  }
}
```

The wallet `PreToolUse` hook intercepts 402, signs payment, retries `call_workflow`.

Safety tiers (`~/.keeperhub/safety.json`):

| Tier | Default |
|------|---------|
| auto | ≤ $5 USDC |
| ask | ≤ $100 |
| block | > $100 |

## 3. MCP bridge tools in this repo

| Tool | Purpose |
|------|---------|
| `keeperhub_search_marketplace_workflows` | Discover paid/free listings |
| `keeperhub_call_marketplace_workflow` | Invoke slug; surfaces x402 if unpaid |
| `keeperhub_official_mcp_call` | Generic passthrough to any official tool |

## MPP vs x402

- **x402**: EIP-712 payment on Base — default wallet path  
- **MPP**: Tempo USDC.e — used when workflow is MPP-only  

Dual-protocol routing is handled by KeeperHub + wallet; this repo documents both and does not implement signing (delegated to `@keeperhub/wallet`).

## References

- [Agentic Wallets](https://docs.keeperhub.com/ai-tools/agentic-wallet)  
- [MCP Server — paid workflows](https://docs.keeperhub.com/ai-tools/mcp-server)  
- [x402scan](https://x402scan.com) — indexed payments
