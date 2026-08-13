#!/usr/bin/env node
/**
 * MCP server: local REST wrappers + bridge to official KeeperHub hosted MCP.
 */
import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { formatAuditTrail, formatWorkflowAudit } from "./audit.js";
import { DEFAULT_CHAIN_ID, requireApiKey } from "./config.js";
import {
  callOfficialMcpTool,
  listOfficialMcpTools,
  officialCallWorkflow,
  officialGetExecution,
  officialSearchWorkflows,
} from "./keeperhub-mcp-client.js";
import {
  createBalanceCheckWorkflow,
  executeWorkflow,
  getWorkflowExecutionStatus,
  listWorkflows,
  waitForWorkflowExecution,
} from "./keeperhub-workflows.js";
import {
  executeTransfer,
  getExecutionStatus,
  getUser,
  newTaskId,
  pollExecutionStatus,
  simulateTransfer,
  stableIdempotencyKey,
} from "./keeperhub.js";
import { formatX402Instructions, parseMcpPaymentError } from "./x402.js";

const server = new McpServer({
  name: "keeperhub-intent-agent",
  version: "2.1.0",
  description:
    "Dual MCP layer: local REST/workflow tools + bridge to official app.keeperhub.com/mcp. See docs/DUAL_MCP.md",
});

function jsonText(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

// ── Direct Execution (REST) ─────────────────────────────────────────────

server.registerTool(
  "keeperhub_simulate_transfer",
  {
    description:
      "Simulate a KeeperHub transfer (POST /api/execute/transfer with simulate:true). No broadcast.",
    inputSchema: {
      recipientAddress: z.string().describe("Recipient 0x address"),
      amount: z.string().describe('Transfer amount, e.g. "0" for proof self-transfer'),
      chainId: z.number().optional().describe(`Chain id (default ${DEFAULT_CHAIN_ID})`),
      tokenAddress: z.string().optional(),
    },
  },
  async ({ recipientAddress, amount, chainId, tokenAddress }) => {
    const apiKey = requireApiKey();
    const res = await simulateTransfer(apiKey, {
      chainId: chainId ?? DEFAULT_CHAIN_ID,
      recipientAddress,
      amount,
      tokenAddress,
    });
    return jsonText({ httpStatus: res.status, body: res.body });
  },
);

server.registerTool(
  "keeperhub_execute_transfer",
  {
    description:
      "Broadcast a KeeperHub transfer after simulation. Auto Idempotency-Key from taskId.",
    inputSchema: {
      recipientAddress: z.string(),
      amount: z.string(),
      chainId: z.number().optional(),
      tokenAddress: z.string().optional(),
      taskId: z.string().optional(),
    },
  },
  async ({ recipientAddress, amount, chainId, tokenAddress, taskId }) => {
    const apiKey = requireApiKey();
    const cid = chainId ?? DEFAULT_CHAIN_ID;
    const tid = taskId ?? newTaskId("mcp-transfer");
    const idem = stableIdempotencyKey({
      taskId: tid,
      chainId: cid,
      recipientAddress,
      amount,
      tokenAddress,
    });
    const res = await executeTransfer(
      apiKey,
      { chainId: cid, recipientAddress, amount, tokenAddress },
      idem,
    );
    return jsonText({
      httpStatus: res.status,
      taskId: tid,
      idempotencyKey: idem,
      body: res.body,
    });
  },
);

server.registerTool(
  "keeperhub_get_status",
  {
    description:
      "Poll direct execution status + audit trail (GET /api/execute/{id}/status). Returns receipts.",
    inputSchema: {
      executionId: z.string(),
    },
  },
  async ({ executionId }) => {
    const apiKey = requireApiKey();
    const res = await getExecutionStatus(apiKey, executionId);
    const body: any = res.body;
    return jsonText({
      httpStatus: res.status,
      auditTrail: formatAuditTrail(body),
      body,
    });
  },
);

server.registerTool(
  "keeperhub_poll_until_done",
  {
    description: "Poll direct execution until completed/failed (honors X-Poll-Interval-Hint).",
    inputSchema: { executionId: z.string() },
  },
  async ({ executionId }) => {
    const apiKey = requireApiKey();
    const status = await pollExecutionStatus(apiKey, executionId);
    return jsonText({
      auditTrail: formatAuditTrail(status),
      status,
    });
  },
);

// ── Workflows API ───────────────────────────────────────────────────────

server.registerTool(
  "keeperhub_list_workflows",
  {
    description: "List org workflows (GET /api/workflows).",
    inputSchema: {},
  },
  async () => {
    const apiKey = requireApiKey();
    const list = await listWorkflows(apiKey);
    return jsonText({ workflows: list });
  },
);

server.registerTool(
  "keeperhub_create_balance_workflow",
  {
    description: "Create Manual → web3/check-balance workflow for an address.",
    inputSchema: {
      address: z.string(),
      chainId: z.number().optional(),
    },
  },
  async ({ address, chainId }) => {
    const apiKey = requireApiKey();
    const wf = await createBalanceCheckWorkflow(apiKey, address, chainId ?? DEFAULT_CHAIN_ID);
    return jsonText({ workflow: wf });
  },
);

server.registerTool(
  "keeperhub_execute_workflow",
  {
    description: "Execute workflow and wait for audit trail (POST execute + GET wait).",
    inputSchema: {
      workflowId: z.string(),
      input: z.record(z.unknown()).optional(),
    },
  },
  async ({ workflowId, input }) => {
    const apiKey = requireApiKey();
    const run = await executeWorkflow(apiKey, workflowId, input ?? {});
    const receipt = await waitForWorkflowExecution(apiKey, run.executionId);
    return jsonText({
      executionId: run.executionId,
      auditTrail: formatWorkflowAudit({
        executionId: run.executionId,
        status: receipt.status,
        completed: receipt.completed,
        transactionHashes: receipt.transactionHashes,
      }),
      receipt,
    });
  },
);

server.registerTool(
  "keeperhub_workflow_status",
  {
    description: "Get workflow execution status + verified transactionHashes.",
    inputSchema: { executionId: z.string() },
  },
  async ({ executionId }) => {
    const apiKey = requireApiKey();
    const status = await getWorkflowExecutionStatus(apiKey, executionId);
    return jsonText({
      auditTrail: formatWorkflowAudit({
        executionId,
        status: status.status,
        transactionHashes: status.transactionHashes,
      }),
      status,
    });
  },
);

// ── Official KeeperHub hosted MCP bridge ─────────────────────────────────

server.registerTool(
  "keeperhub_official_mcp_list_tools",
  {
    description: "List tools on https://app.keeperhub.com/mcp (official hosted MCP server).",
    inputSchema: {},
  },
  async () => {
    const apiKey = requireApiKey();
    const tools = await listOfficialMcpTools(apiKey);
    return jsonText({ url: "https://app.keeperhub.com/mcp", toolCount: tools.length, tools });
  },
);

server.registerTool(
  "keeperhub_official_mcp_call",
  {
    description: "Call any tool on the official KeeperHub hosted MCP server.",
    inputSchema: {
      toolName: z.string(),
      arguments: z.record(z.unknown()).optional(),
    },
  },
  async ({ toolName, arguments: args }) => {
    const apiKey = requireApiKey();
    const res = await callOfficialMcpTool(apiKey, toolName, args ?? {});
    if (!res.ok) {
      const challenge = parseMcpPaymentError(res.text);
      if (challenge) {
        return jsonText({
          ok: false,
          x402: true,
          instructions: formatX402Instructions(challenge),
          error: res.text,
        });
      }
    }
    return jsonText({ ok: res.ok, text: res.text, raw: res.raw });
  },
);

server.registerTool(
  "keeperhub_search_marketplace_workflows",
  {
    description: "Search listed workflows via official MCP search_workflows (x402-aware).",
    inputSchema: { query: z.string() },
  },
  async ({ query }) => {
    const apiKey = requireApiKey();
    const res = await officialSearchWorkflows(apiKey, query);
    return jsonText({ ok: res.ok, query, result: res.text });
  },
);

server.registerTool(
  "keeperhub_call_marketplace_workflow",
  {
    description:
      "Invoke a listed workflow slug via official MCP call_workflow. Paid listings return x402 instructions.",
    inputSchema: {
      slug: z.string(),
      inputs: z.record(z.unknown()).optional(),
    },
  },
  async ({ slug, inputs }) => {
    const apiKey = requireApiKey();
    const res = await officialCallWorkflow(apiKey, slug, inputs ?? {});
    if (!res.ok) {
      const challenge = parseMcpPaymentError(res.text);
      if (challenge) {
        return jsonText({
          ok: false,
          slug,
          x402: true,
          instructions: formatX402Instructions(challenge, slug),
          error: res.text,
        });
      }
    }
    return jsonText({ ok: res.ok, slug, result: res.text });
  },
);

server.registerTool(
  "keeperhub_official_get_execution",
  {
    description: "Fetch combined execution audit via official MCP get_execution.",
    inputSchema: { executionId: z.string() },
  },
  async ({ executionId }) => {
    const apiKey = requireApiKey();
    const res = await officialGetExecution(apiKey, executionId);
    return jsonText({ ok: res.ok, executionId, result: res.text });
  },
);

server.registerTool(
  "keeperhub_whoami",
  {
    description: "Return org user + wallet address (GET /api/user).",
    inputSchema: {},
  },
  async () => {
    const apiKey = requireApiKey();
    const user = await getUser(apiKey);
    return jsonText(user);
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
