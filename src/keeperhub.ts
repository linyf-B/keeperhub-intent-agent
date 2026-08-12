import { createHash, randomUUID } from "node:crypto";
import { KEEPERHUB_BASE } from "./config.js";

import { withRetry } from "./retry.js";

export type ApiResult<T = unknown> = {
  status: number;
  body: T;
  headers: Headers;
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function keeperhubFetch<T = any>(
  path: string,
  init: RequestInit & { apiKey?: string } = {},
): Promise<ApiResult<T>> {
  const { apiKey, headers: extra, ...rest } = init;
  const headers = new Headers(extra);
  if (!headers.has("Content-Type") && rest.body) {
    headers.set("Content-Type", "application/json");
  }
  if (apiKey) {
    headers.set("Authorization", `Bearer ${apiKey}`);
  }

  const res = await withRetry(
    async () => {
      const r = await fetch(`${KEEPERHUB_BASE}${path}`, { ...rest, headers });
      const text = await r.text();
      let body: any;
      try {
        body = text ? JSON.parse(text) : {};
      } catch {
        body = { error: text.slice(0, 500) };
      }
      return { status: r.status, body, headers: r.headers };
    },
    { label: path },
  );
  return res as ApiResult<T>;
}

export function mustOk<T>(res: ApiResult<T>, what: string): T {
  if (res.status >= 400) {
    throw new Error(`${what}: HTTP ${res.status} ${JSON.stringify(res.body)}`);
  }
  return res.body;
}

/** Canonical amount string for stable idempotency keys (KeeperHub rules). */
export function canonicalizeAmount(amount: string): string {
  let a = amount.trim();
  if (a.startsWith("+") || a.startsWith("-")) {
    throw new Error(`amount must not have a sign: ${amount}`);
  }
  if (a.includes("e") || a.includes("E")) {
    throw new Error(`amount must not use exponent notation: ${amount}`);
  }
  if (a.startsWith(".")) a = `0${a}`;
  if (a.includes(".")) {
    const [i, f = ""] = a.split(".");
    const intPart = i.replace(/^0+(?=\d)/, "") || "0";
    const frac = f.replace(/0+$/, "");
    a = frac ? `${intPart}.${frac}` : intPart;
  } else {
    a = a.replace(/^0+(?=\d)/, "") || "0";
  }
  return a || "0";
}

export function stableIdempotencyKey(parts: {
  taskId: string;
  chainId: number | string;
  recipientAddress: string;
  amount: string;
  tokenAddress?: string;
}): string {
  const enc = (s: string) =>
    s.trim().replace(/%/g, "%25").replace(/\|/g, "%7C");
  const joined = [
    enc(parts.taskId),
    String(Number(parts.chainId)),
    parts.recipientAddress.toLowerCase(),
    canonicalizeAmount(parts.amount),
    (parts.tokenAddress || "").toLowerCase(),
  ].join("|");
  return createHash("sha256").update(joined, "utf8").digest("hex");
}

export type TransferBody = {
  chainId: number;
  recipientAddress: string;
  amount: string;
  tokenAddress?: string;
  simulate?: boolean;
};

export async function simulateTransfer(apiKey: string, transfer: TransferBody) {
  const { simulate: _s, ...body } = transfer;
  return keeperhubFetch("/api/execute/transfer", {
    method: "POST",
    apiKey,
    body: JSON.stringify({ ...body, simulate: true }),
  });
}

export async function executeTransfer(
  apiKey: string,
  transfer: TransferBody,
  idempotencyKey: string,
) {
  const { simulate: _s, ...body } = transfer;
  return keeperhubFetch("/api/execute/transfer", {
    method: "POST",
    apiKey,
    headers: { "Idempotency-Key": idempotencyKey },
    body: JSON.stringify(body),
  });
}

export async function getExecutionStatus(apiKey: string, executionId: string) {
  return keeperhubFetch(`/api/execute/${executionId}/status`, {
    method: "GET",
    apiKey,
  });
}

export async function pollExecutionStatus(
  apiKey: string,
  executionId: string,
  opts: { maxAttempts?: number; defaultIntervalMs?: number } = {},
) {
  const maxAttempts = opts.maxAttempts ?? 40;
  let interval = opts.defaultIntervalMs ?? 2000;

  for (let i = 0; i < maxAttempts; i++) {
    const res = await getExecutionStatus(apiKey, executionId);
    const body: any = res.body;
    const status = body?.status as string | undefined;
    const hint = res.headers.get("X-Poll-Interval-Hint");
    if (hint && Number(hint) > 0) interval = Number(hint) * 1000;

    if (status === "completed" || status === "failed") {
      return mustOk(res, "execution status");
    }
    if (res.status >= 400) {
      throw new Error(`status poll failed: ${res.status} ${JSON.stringify(body)}`);
    }
    await sleep(interval);
  }
  throw new Error(`execution ${executionId} did not settle in time`);
}

export async function getUser(apiKey: string) {
  return mustOk(await keeperhubFetch("/api/user", { apiKey }), "get user");
}

export async function listEnabledTestnets(apiKey: string) {
  const chains = mustOk(
    await keeperhubFetch("/api/chains", { apiKey }),
    "list chains",
  ) as any;
  const list = Array.isArray(chains) ? chains : chains?.chains || [];
  return list.filter((c: any) => c.isEnabled && c.isTestnet);
}

export function newTaskId(prefix = "agent"): string {
  return `${prefix}-${randomUUID()}`;
}

export type ContractCallBody = {
  chainId: number;
  contractAddress: string;
  functionName: string;
  functionArgs?: string;
  abi?: string;
  simulate?: boolean;
};

export async function contractCall(apiKey: string, body: ContractCallBody) {
  const { simulate, ...rest } = body;
  const payload = simulate ? { ...rest, simulate: true } : rest;
  return keeperhubFetch("/api/execute/contract-call", {
    method: "POST",
    apiKey,
    body: JSON.stringify(payload),
  });
}

/** Read native ETH balance via workflow engine (web3/check-balance) — no local RPC. */
export async function checkBalanceViaWorkflow(
  apiKey: string,
  address: string,
  chainId: number,
): Promise<{ workflowId: string; executionId: string; output: any; audit: any }> {
  const { createBalanceCheckWorkflow, executeWorkflow, waitForWorkflowExecution } =
    await import("./keeperhub-workflows.js");
  const wf = await createBalanceCheckWorkflow(apiKey, address, chainId);
  const run = await executeWorkflow(apiKey, wf.id, { address });
  const receipt = await waitForWorkflowExecution(apiKey, run.executionId);
  return {
    workflowId: wf.id,
    executionId: run.executionId,
    output: receipt.output,
    audit: receipt,
  };
}

/** Safe direct write: simulate → execute → poll with full audit trail. */
export async function safeDirectTransfer(
  apiKey: string,
  transfer: TransferBody,
  taskIdPrefix = "safe-transfer",
) {
  const sim = await simulateTransfer(apiKey, transfer);
  const simBody: any = sim.body;
  if (sim.status >= 400 || !simBody?.success || simBody?.wouldRevert) {
    throw new Error(`Simulation failed: ${JSON.stringify(simBody)}`);
  }

  const taskId = newTaskId(taskIdPrefix);
  const idem = stableIdempotencyKey({
    taskId,
    chainId: transfer.chainId,
    recipientAddress: transfer.recipientAddress,
    amount: transfer.amount,
    tokenAddress: transfer.tokenAddress,
  });

  let execRes = await executeTransfer(apiKey, transfer, idem);
  if (execRes.status >= 400) {
    const body: any = execRes.body;
    if (body?.originalExecutionId) {
      const status = await pollExecutionStatus(apiKey, body.originalExecutionId);
      return { taskId, idempotencyKey: idem, simulation: simBody, status, executionId: body.originalExecutionId };
    }
    throw new Error(`Execute failed: HTTP ${execRes.status} ${JSON.stringify(body)}`);
  }

  const execBody: any = execRes.body;
  const executionId = execBody.executionId;
  if (!executionId) {
    throw new Error(`No executionId: ${JSON.stringify(execBody)}`);
  }

  const status = await pollExecutionStatus(apiKey, executionId);
  return { taskId, idempotencyKey: idem, simulation: simBody, status, executionId };
}
