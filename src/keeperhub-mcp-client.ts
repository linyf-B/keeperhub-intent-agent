/**
 * Minimal HTTP client for KeeperHub's hosted MCP server (https://app.keeperhub.com/mcp).
 * Uses Streamable HTTP JSON-RPC — same surface as Claude Code / Cursor remote MCP.
 */
import { KEEPERHUB_BASE } from "./config.js";

type JsonRpcResponse = {
  jsonrpc: "2.0";
  id?: number | string;
  result?: any;
  error?: { code: number; message: string; data?: any };
};

let nextId = 1;

export async function callOfficialMcpTool(
  apiKey: string,
  toolName: string,
  args: Record<string, unknown> = {},
): Promise<{ ok: boolean; text: string; raw?: any; isError?: boolean }> {
  const url = `${KEEPERHUB_BASE}/mcp`;
  const payload = {
    jsonrpc: "2.0" as const,
    id: nextId++,
    method: "tools/call",
    params: { name: toolName, arguments: args },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  if (!res.ok) {
    return {
      ok: false,
      text: `Official MCP HTTP ${res.status}: ${text.slice(0, 800)}`,
    };
  }

  // Streamable HTTP may return SSE or plain JSON
  const jsonLine = text
    .split("\n")
    .map((l) => l.replace(/^data:\s*/, "").trim())
    .find((l) => l.startsWith("{"));
  const parsed: JsonRpcResponse = jsonLine ? JSON.parse(jsonLine) : JSON.parse(text);

  if (parsed.error) {
    return {
      ok: false,
      text: `MCP error ${parsed.error.code}: ${parsed.error.message}`,
      raw: parsed.error,
    };
  }

  const content = parsed.result?.content;
  const isError = parsed.result?.isError === true;
  const bodyText =
    Array.isArray(content) && content[0]?.text
      ? content.map((c: any) => c.text).join("\n")
      : JSON.stringify(parsed.result, null, 2);

  return { ok: !isError, text: bodyText, raw: parsed.result, isError };
}

export async function listOfficialMcpTools(apiKey: string): Promise<string[]> {
  const url = `${KEEPERHUB_BASE}/mcp`;
  const payload = {
    jsonrpc: "2.0" as const,
    id: nextId++,
    method: "tools/list",
    params: {},
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  const jsonLine = text
    .split("\n")
    .map((l) => l.replace(/^data:\s*/, "").trim())
    .find((l) => l.startsWith("{"));
  const parsed: JsonRpcResponse = jsonLine ? JSON.parse(jsonLine) : JSON.parse(text);
  const tools = parsed.result?.tools ?? [];
  return tools.map((t: any) => t.name as string);
}

/** Preflight a transfer via official MCP execute_transfer(simulate:true). */
export async function officialSimulateTransfer(
  apiKey: string,
  chainId: number,
  toAddress: string,
  amount: string,
) {
  return callOfficialMcpTool(apiKey, "execute_transfer", {
    chain_id: String(chainId),
    to_address: toAddress,
    amount,
    simulate: true,
  });
}

/** Search marketplace workflows (may return x402 402 in paid listings). */
export async function officialSearchWorkflows(apiKey: string, query: string) {
  return callOfficialMcpTool(apiKey, "search_workflows", { query });
}

/** Call a listed workflow slug via official MCP. */
export async function officialCallWorkflow(
  apiKey: string,
  slug: string,
  inputs: Record<string, unknown> = {},
) {
  return callOfficialMcpTool(apiKey, "call_workflow", { slug, inputs });
}

/** Read combined workflow/direct execution audit via official MCP. */
export async function officialGetExecution(apiKey: string, executionId: string) {
  return callOfficialMcpTool(apiKey, "get_execution", { execution_id: executionId });
}

export async function officialListExecutions(apiKey: string, limit = 10) {
  return callOfficialMcpTool(apiKey, "list_executions", { limit });
}

export const OFFICIAL_MCP_DOC = "https://docs.keeperhub.com/ai-tools/mcp-server";
