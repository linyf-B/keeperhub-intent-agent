/** Hackathon pitch — three pillars (used in CLI, bootstrap, demo, docs). */

export const VISION =
  "The agent that onboard itself — then executes onchain via KeeperHub.";

export const PILLARS = {
  selfOnboard: {
    id: "self-onboard",
    title: "Self-registering Agent",
    tagline: "Headless SIWE → kh_ key → first tx (no browser, no captcha)",
    command: "ETH_PRIVATE_KEY=0x... npm run bootstrap",
    doc: "docs/SELF_ONBOARDING_AGENT.md",
  },
  auditFirst: {
    id: "audit-first",
    title: "Audit-first Last Mile",
    tagline: "simulate gate → execute → receipts / verified transactionHashes",
    command: "scenario treasury 0xOrgWallet on 84532",
    doc: "docs/AUDIT_FIRST.md",
  },
  dualMcp: {
    id: "dual-mcp",
    title: "Dual MCP Execution Layer",
    tagline: "Local REST/workflow tools + official app.keeperhub.com/mcp bridge",
    command: "npm run mcp  +  docs/mcp-dual.json.example",
    doc: "docs/DUAL_MCP.md",
  },
} as const;

export const LOCAL_MCP_TOOLS = [
  "keeperhub_simulate_transfer",
  "keeperhub_execute_transfer",
  "keeperhub_get_status",
  "keeperhub_poll_until_done",
  "keeperhub_list_workflows",
  "keeperhub_create_balance_workflow",
  "keeperhub_execute_workflow",
  "keeperhub_workflow_status",
  "keeperhub_official_mcp_list_tools",
  "keeperhub_official_mcp_call",
  "keeperhub_search_marketplace_workflows",
  "keeperhub_call_marketplace_workflow",
  "keeperhub_official_get_execution",
  "keeperhub_whoami",
] as const;

export function printPitchBanner() {
  const lines = [
    "╔══════════════════════════════════════════════════════════════╗",
    "║  KeeperHub Intent Agent — three pillars                      ║",
    "╠══════════════════════════════════════════════════════════════╣",
    `║  1) ${PILLARS.selfOnboard.title.padEnd(52)}║`,
    `║     ${PILLARS.selfOnboard.tagline.slice(0, 52).padEnd(52)}║`,
    `║  2) ${PILLARS.auditFirst.title.padEnd(52)}║`,
    `║     ${PILLARS.auditFirst.tagline.slice(0, 52).padEnd(52)}║`,
    `║  3) ${PILLARS.dualMcp.title.padEnd(52)}║`,
    `║     ${PILLARS.dualMcp.tagline.slice(0, 52).padEnd(52)}║`,
    "╚══════════════════════════════════════════════════════════════╝",
    VISION,
    "",
  ];
  return lines.join("\n");
}
