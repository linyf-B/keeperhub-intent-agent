#!/usr/bin/env node
/**
 * Thin MCP server over KeeperHub Direct Execution REST API.
 * Tools: simulate → execute → get_status (same layer as CLI agent).
 */
import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { DEFAULT_CHAIN_ID, requireApiKey } from "./config.js";
import {
  executeTransfer,
  getExecutionStatus,
  newTaskId,
  simulateTransfer,
  stableIdempotencyKey,
} from "./keeperhub.js";

const server = new McpServer({
  name: "keeperhub-intent-agent",
  version: "1.0.0",
});

function jsonText(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

server.registerTool(
  "keeperhub_simulate_transfer",
  {
    description:
      "Simulate a KeeperHub transfer (POST /api/execute/transfer with simulate:true). No broadcast.",
    inputSchema: {
      recipientAddress: z.string().describe("Recipient 0x address"),
      amount: z.string().describe('Transfer amount, e.g. "0" for proof self-transfer'),
      chainId: z
        .number()
        .optional()
        .describe(`Chain id (default ${DEFAULT_CHAIN_ID} Base Sepolia)`),
      tokenAddress: z.string().optional().describe("Optional ERC-20 token address"),
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
      "Broadcast a KeeperHub transfer after a clean simulation. Requires Idempotency-Key (auto-derived from taskId).",
    inputSchema: {
      recipientAddress: z.string(),
      amount: z.string(),
      chainId: z.number().optional(),
      tokenAddress: z.string().optional(),
      taskId: z
        .string()
        .optional()
        .describe("Stable task id for idempotency; auto-generated if omitted"),
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
    description: "Poll KeeperHub execution status (GET /api/execute/{executionId}/status).",
    inputSchema: {
      executionId: z.string().describe("executionId from execute response"),
    },
  },
  async ({ executionId }) => {
    const apiKey = requireApiKey();
    const res = await getExecutionStatus(apiKey, executionId);
    return jsonText({ httpStatus: res.status, body: res.body });
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
