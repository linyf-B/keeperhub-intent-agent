import { VISION } from "./pitch.js";

export type TransferIntent = {
  kind: "transfer";
  to: string;
  amount: string;
  chainId?: number;
  note?: string;
};

export type HelpIntent = { kind: "help" };
export type WhoamiIntent = { kind: "whoami" };

export type BalanceIntent = {
  kind: "balance";
  address: string;
  chainId?: number;
};

export type AuditIntent = {
  kind: "audit";
  executionId: string;
  source?: "direct" | "workflow" | "auto";
};

export type WorkflowsIntent = { kind: "workflows" };

export type WorkflowSetupIntent = {
  kind: "workflow_setup";
  chainId?: number;
};

export type WorkflowRunIntent = {
  kind: "workflow_run";
  workflowId: string;
};

export type ScenarioIntent = {
  kind: "scenario";
  name: "treasury";
  address: string;
  amount?: string;
  chainId?: number;
};

export type McpSearchIntent = {
  kind: "mcp_search";
  query: string;
};

export type McpToolsIntent = { kind: "mcp_tools" };

export type Intent =
  | TransferIntent
  | HelpIntent
  | WhoamiIntent
  | BalanceIntent
  | AuditIntent
  | WorkflowsIntent
  | WorkflowSetupIntent
  | WorkflowRunIntent
  | ScenarioIntent
  | McpSearchIntent
  | McpToolsIntent;

const ADDR = /0x[a-fA-F0-9]{40}/;
const AMOUNT = /(\d+(?:\.\d+)?)/;
const EXEC_ID = /(?:direct_|exec_)[a-zA-Z0-9_-]+/;
const WF_ID = /wf_[a-zA-Z0-9_-]+/;

/**
 * Deterministic NL + structured commands for CLI / MCP agent.
 */
export function parseIntent(input: string): Intent {
  const text = input.trim();
  const lower = text.toLowerCase();

  if (!text || lower === "help" || lower === "?" || lower === "h") {
    return { kind: "help" };
  }
  if (lower === "whoami" || lower === "me" || lower === "wallet") {
    return { kind: "whoami" };
  }
  if (/^(list\s+)?workflows?$/.test(lower)) {
    return { kind: "workflows" };
  }
  if (/^mcp\s+tools?$/.test(lower)) {
    return { kind: "mcp_tools" };
  }
  if (/^setup\s+workflow/.test(lower)) {
    const chainMatch = text.match(/(?:on|chain(?:Id)?)\s*[:=]?\s*(\d+)/i);
    return { kind: "workflow_setup", chainId: chainMatch ? Number(chainMatch[1]) : undefined };
  }
  if (/^run\s+workflow\s+/i.test(text)) {
    const m = text.match(WF_ID);
    if (!m) throw new Error("Usage: run workflow wf_...");
    return { kind: "workflow_run", workflowId: m[0] };
  }
  if (/^audit\s+/i.test(text) || /^show\s+audit/i.test(text)) {
    const m = text.match(EXEC_ID);
    if (!m) throw new Error("Usage: audit direct_... or audit exec_...");
    const id = m[0];
    const source = id.startsWith("exec_") ? "workflow" : "direct";
    return { kind: "audit", executionId: id, source };
  }
  if (/^balance\s+/i.test(text) || /^check\s+balance/i.test(text)) {
    const addrMatch = text.match(ADDR);
    if (!addrMatch) throw new Error("Usage: balance 0xAddress on 84532");
    const chainMatch = text.match(/(?:on|chain(?:Id)?)\s*[:=]?\s*(\d+)/i);
    return {
      kind: "balance",
      address: addrMatch[0].toLowerCase(),
      chainId: chainMatch ? Number(chainMatch[1]) : undefined,
    };
  }
  if (/^search\s+workflows?\s+/i.test(text) || /^mcp\s+search\s+/i.test(text)) {
    const q = text.replace(/^(search\s+workflows?|mcp\s+search)\s+/i, "").trim();
    if (!q) throw new Error("Usage: search workflows <query>");
    return { kind: "mcp_search", query: q };
  }
  if (/^scenario\s+treasury/i.test(text) || /treasury\s+proof/i.test(text)) {
    const addrMatch = text.match(ADDR);
    if (!addrMatch) throw new Error("Usage: scenario treasury 0xOrgWallet");
    const chainMatch = text.match(/(?:on|chain(?:Id)?)\s*[:=]?\s*(\d+)/i);
    let amount = "0";
    const am = text.match(AMOUNT);
    if (am?.[1]) amount = am[1];
    return {
      kind: "scenario",
      name: "treasury",
      address: addrMatch[0].toLowerCase(),
      amount,
      chainId: chainMatch ? Number(chainMatch[1]) : undefined,
    };
  }

  const addrMatch = text.match(ADDR);
  if (!addrMatch) {
    throw new Error(
      `Could not parse: "${text}". Try: transfer 0 to 0x... | balance 0x... | scenario treasury 0x...`,
    );
  }
  const to = addrMatch[0].toLowerCase();

  let amount = "0";
  const amountPatterns = [
    /(?:transfer|send|pay)\s+(\d+(?:\.\d+)?)/i,
    /(\d+(?:\.\d+)?)\s*(?:eth|wei)?\s+(?:to|→|->)/i,
    new RegExp(`${ADDR.source}\\s+${AMOUNT.source}`, "i"),
    /amount\s*[:=]?\s*(\d+(?:\.\d+)?)/i,
  ];
  for (const re of amountPatterns) {
    const m = text.match(re);
    if (m?.[1]) {
      amount = m[1];
      break;
    }
  }

  let chainId: number | undefined;
  const chainMatch = text.match(/(?:on|chain(?:Id)?)\s*[:=]?\s*(\d+)/i);
  if (chainMatch) chainId = Number(chainMatch[1]);

  return {
    kind: "transfer",
    to,
    amount,
    chainId,
    note: text,
  };
}

export const HELP_TEXT = `KeeperHub Intent Agent
${VISION}

Three pillars:
  1) Self-registering Agent     → npm run bootstrap (headless SIWE → kh_ key)
  2) Audit-first Last Mile      → scenario treasury 0xOrgWallet (simulate→audit)
  3) Dual MCP Execution Layer   → npm run mcp + docs/mcp-dual.json.example

Commands:
  help | whoami
  transfer 0 to 0x... | audit direct_...
  scenario treasury 0xOrgWallet on 84532
  workflows | setup workflow | run workflow wf_...
  mcp tools | search workflows <query>

Docs: docs/SELF_ONBOARDING_AGENT.md · docs/AUDIT_FIRST.md · docs/DUAL_MCP.md
Default chain: Base Sepolia (84532). Set KEEPERHUB_API_KEY=kh_... in .env
`;
