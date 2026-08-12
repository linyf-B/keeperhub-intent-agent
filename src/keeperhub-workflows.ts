import { KEEPERHUB_BASE } from "./config.js";
import { keeperhubFetch, mustOk } from "./keeperhub.js";
import { withRetry } from "./retry.js";

export type WorkflowSummary = {
  id: string;
  name: string;
  description?: string;
};

export async function listWorkflows(apiKey: string): Promise<WorkflowSummary[]> {
  const res = await withRetry(
    () => keeperhubFetch("/api/workflows", { apiKey }),
    { label: "listWorkflows" },
  );
  const body = mustOk(res, "list workflows") as any;
  const list = Array.isArray(body) ? body : body?.workflows ?? [];
  return list.map((w: any) => ({ id: w.id, name: w.name, description: w.description }));
}

export async function createBalanceCheckWorkflow(
  apiKey: string,
  address: string,
  chainId: number,
  name?: string,
) {
  const wfName = name ?? `agent-balance-check-${Date.now()}`;
  const network = String(chainId);
  const body = {
    name: wfName,
    description: "Created by KeeperHub Intent Agent — read org wallet balance before transfers.",
    enabled: false,
    nodes: [
      {
        id: "trigger-1",
        type: "trigger",
        data: {
          label: "Manual",
          config: { triggerType: "Manual" },
        },
      },
      {
        id: "check-balance",
        type: "action",
        data: {
          label: "Check Balance",
          config: {
            actionType: "web3/check-balance",
            network,
            address,
          },
        },
      },
    ],
    edges: [{ id: "e1", source: "trigger-1", target: "check-balance" }],
  };

  const res = await withRetry(
    () =>
      keeperhubFetch("/api/workflows/create", {
        method: "POST",
        apiKey,
        body: JSON.stringify(body),
      }),
    { label: "createWorkflow" },
  );
  return mustOk(res, "create workflow") as any;
}

export async function executeWorkflow(apiKey: string, workflowId: string, input: Record<string, unknown> = {}) {
  const res = await withRetry(
    () =>
      keeperhubFetch(`/api/workflows/${workflowId}/execute`, {
        method: "POST",
        apiKey,
        body: JSON.stringify({ input }),
      }),
    { label: "executeWorkflow" },
  );
  return mustOk(res, "execute workflow") as any;
}

export async function waitForWorkflowExecution(
  apiKey: string,
  executionId: string,
  timeoutMs = 30000,
) {
  const res = await withRetry(
    () =>
      keeperhubFetch(
        `/api/workflows/executions/${executionId}/wait?timeoutMs=${timeoutMs}`,
        { apiKey },
      ),
    { label: "waitWorkflowExecution" },
  );
  return mustOk(res, "wait workflow execution") as any;
}

export async function getWorkflowExecutionStatus(apiKey: string, executionId: string) {
  const res = await withRetry(
    () =>
      keeperhubFetch(`/api/workflows/executions/${executionId}/status`, { apiKey }),
    { label: "getWorkflowExecutionStatus" },
  );
  return mustOk(res, "workflow execution status") as any;
}

export async function getWorkflowExecutionLogs(apiKey: string, executionId: string) {
  const res = await withRetry(
    () =>
      keeperhubFetch(`/api/workflows/executions/${executionId}/logs`, { apiKey }),
    { label: "getWorkflowExecutionLogs" },
  );
  return mustOk(res, "workflow execution logs") as any;
}

export async function listWorkflowExecutions(apiKey: string, workflowId: string) {
  const res = await withRetry(
    () => keeperhubFetch(`/api/workflows/${workflowId}/executions`, { apiKey }),
    { label: "listWorkflowExecutions" },
  );
  return mustOk(res, "list workflow executions") as any[];
}

export function officialMcpUrl() {
  return `${KEEPERHUB_BASE}/mcp`;
}
