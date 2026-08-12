import { DEFAULT_CHAIN_ID } from "./config.js";
import { formatAuditTrail, formatWorkflowAudit } from "./audit.js";
import { HELP_TEXT, parseIntent, type Intent } from "./intent.js";
import {
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
  checkBalanceViaWorkflow,
  getExecutionStatus,
  getUser,
  safeDirectTransfer,
  type TransferBody,
} from "./keeperhub.js";
import { buildPlan, summarizePlan } from "./planner.js";
import { formatX402Instructions, parseMcpPaymentError } from "./x402.js";

export type AgentResult = {
  ok: boolean;
  intent: Intent | { kind: "error"; message: string };
  message: string;
  executionId?: string;
  transactionHash?: string;
  transactionLink?: string;
  status?: any;
  simulation?: any;
  plan?: string;
  auditTrail?: string;
};

export class KeeperHubIntentAgent {
  constructor(private readonly apiKey: string) {}

  async handle(raw: string): Promise<AgentResult> {
    let intent: Intent;
    try {
      intent = parseIntent(raw);
    } catch (e: any) {
      return {
        ok: false,
        intent: { kind: "error", message: e.message },
        message: e.message,
      };
    }

    if (intent.kind === "help") {
      return { ok: true, intent, message: HELP_TEXT };
    }

    if (intent.kind === "whoami") {
      const user: any = await getUser(this.apiKey);
      const msg = [
        `userId: ${user.id}`,
        `email: ${user.email}`,
        `org wallet (fund/send-from): ${user.walletAddress}`,
        `provider: ${user.providerId || "n/a"}`,
      ].join("\n");
      return { ok: true, intent, message: msg };
    }

    const plan = buildPlan(raw, intent);
    if (plan) {
      console.error("[agent] executing plan:", plan.name);
      return this.executePlan(intent, plan);
    }

    switch (intent.kind) {
      case "balance":
        return this.handleBalance(intent);
      case "audit":
        return this.handleAudit(intent);
      case "workflows":
        return this.handleListWorkflows(intent);
      case "workflow_setup":
        return this.handleWorkflowSetup(intent);
      case "workflow_run":
        return this.handleWorkflowRun(intent);
      case "mcp_search":
        return this.handleMcpSearch(intent);
      case "mcp_tools":
        return this.handleMcpTools(intent);
      case "transfer":
        return this.executeTransferIntent(intent);
      default:
        return { ok: false, intent, message: "Unhandled intent" };
    }
  }

  private async executePlan(
    intent: Intent,
    plan: ReturnType<typeof buildPlan> & object,
  ): Promise<AgentResult> {
    const header = summarizePlan(plan!) + "\n";
    const parts: string[] = [header];
    let lastResult: AgentResult | undefined;

    for (const step of plan!.steps) {
      if (step.step === "balance") {
        const r = await this.handleBalance({
          kind: "balance",
          address: step.address,
          chainId: step.chainId,
        });
        parts.push(`\n[balance]\n${r.message}`);
        lastResult = r;
        if (!r.ok) {
          return { ...r, message: parts.join("\n"), plan: plan!.name };
        }
      } else if (step.step === "transfer") {
        const r = await this.executeTransferIntent({
          kind: "transfer",
          to: step.to,
          amount: step.amount,
          chainId: step.chainId,
        });
        parts.push(`\n[transfer]\n${r.message}`);
        lastResult = r;
        if (!r.ok) {
          return { ...r, message: parts.join("\n"), plan: plan!.name };
        }
        if (r.executionId) {
          const audit = await this.handleAudit({
            kind: "audit",
            executionId: r.executionId,
            source: "direct",
          });
          parts.push(`\n[audit]\n${audit.message}`);
        }
      } else if (step.step === "workflow_setup") {
        const r = await this.handleWorkflowSetup({
          kind: "workflow_setup",
          chainId: step.chainId,
        });
        parts.push(`\n[workflow_setup]\n${r.message}`);
        lastResult = r;
      } else if (step.step === "workflow_run") {
        const r = await this.handleWorkflowRun({
          kind: "workflow_run",
          workflowId: step.workflowId,
        });
        parts.push(`\n[workflow_run]\n${r.message}`);
        lastResult = r;
      }
    }

    return {
      ok: lastResult?.ok ?? true,
      intent,
      message: parts.join("\n"),
      plan: plan!.name,
      executionId: lastResult?.executionId,
      transactionHash: lastResult?.transactionHash,
      transactionLink: lastResult?.transactionLink,
      status: lastResult?.status,
    };
  }

  private async handleBalance(intent: Extract<Intent, { kind: "balance" }>): Promise<AgentResult> {
    const chainId = intent.chainId ?? DEFAULT_CHAIN_ID;
    console.error("[agent] balance via Workflows API (web3/check-balance)", {
      address: intent.address,
      chainId,
    });
    try {
      const result = await checkBalanceViaWorkflow(this.apiKey, intent.address, chainId);
      const auditText = formatWorkflowAudit({
        executionId: result.executionId,
        status: result.audit.status,
        completed: result.audit.completed,
        transactionHashes: result.audit.transactionHashes,
      });
      return {
        ok: true,
        intent,
        message: [
          `✓ Balance check via KeeperHub Workflow (read path, no local RPC)`,
          `workflowId: ${result.workflowId}`,
          `executionId: ${result.executionId}`,
          `output: ${JSON.stringify(result.output, null, 2)}`,
          auditText,
        ].join("\n"),
        executionId: result.executionId,
        auditTrail: auditText,
        status: result.audit,
      };
    } catch (e: any) {
      return { ok: false, intent, message: `Balance check failed: ${e.message}` };
    }
  }

  private async handleAudit(intent: Extract<Intent, { kind: "audit" }>): Promise<AgentResult> {
    const id = intent.executionId;
    if (intent.source === "workflow" || id.startsWith("exec_")) {
      const status = await getWorkflowExecutionStatus(this.apiKey, id);
      const auditText = formatWorkflowAudit({
        executionId: id,
        status: status.status,
        transactionHashes: status.transactionHashes,
      });
      return {
        ok: status.status === "success" || status.status === "completed",
        intent,
        message: auditText,
        executionId: id,
        auditTrail: auditText,
        status,
      };
    }

    const res = await getExecutionStatus(this.apiKey, id);
    const body: any = res.body;
    if (res.status >= 400) {
      return { ok: false, intent, message: `Audit fetch failed: HTTP ${res.status} ${JSON.stringify(body)}` };
    }
    const auditText = formatAuditTrail(body);
    return {
      ok: body?.status === "completed",
      intent,
      message: auditText,
      executionId: id,
      transactionHash: body?.transactionHash,
      transactionLink: body?.transactionLink,
      auditTrail: auditText,
      status: body,
    };
  }

  private async handleListWorkflows(
    intent: Extract<Intent, { kind: "workflows" }>,
  ): Promise<AgentResult> {
    const list = await listWorkflows(this.apiKey);
    const lines = list.length
      ? list.map((w) => `- ${w.id}  ${w.name}${w.description ? ` — ${w.description}` : ""}`)
      : ["(no workflows yet — try: setup workflow on 84532)"];
    return {
      ok: true,
      intent,
      message: ["Org workflows:", ...lines].join("\n"),
    };
  }

  private async handleWorkflowSetup(
    intent: Extract<Intent, { kind: "workflow_setup" }>,
  ): Promise<AgentResult> {
    const user: any = await getUser(this.apiKey);
    if (!user.walletAddress) {
      return { ok: false, intent, message: "Org wallet not ready" };
    }
    const chainId = intent.chainId ?? DEFAULT_CHAIN_ID;
    const wf = await createBalanceCheckWorkflow(
      this.apiKey,
      user.walletAddress.toLowerCase(),
      chainId,
    );
    return {
      ok: true,
      intent,
      message: [
        "✓ Created workflow via POST /api/workflows/create",
        `workflowId: ${wf.id}`,
        `name: ${wf.name}`,
        `Run: run workflow ${wf.id}`,
      ].join("\n"),
    };
  }

  private async handleWorkflowRun(
    intent: Extract<Intent, { kind: "workflow_run" }>,
  ): Promise<AgentResult> {
    const run = await executeWorkflow(this.apiKey, intent.workflowId, {});
    const receipt = await waitForWorkflowExecution(this.apiKey, run.executionId);
    const auditText = formatWorkflowAudit({
      executionId: run.executionId,
      status: receipt.status,
      completed: receipt.completed,
      transactionHashes: receipt.transactionHashes,
      gasUsedWei: receipt.gasUsedWei,
      error: receipt.error,
    });
    return {
      ok: receipt.status === "success",
      intent,
      message: [auditText, receipt.output ? `output: ${JSON.stringify(receipt.output)}` : ""]
        .filter(Boolean)
        .join("\n"),
      executionId: run.executionId,
      auditTrail: auditText,
      status: receipt,
    };
  }

  private async handleMcpSearch(
    intent: Extract<Intent, { kind: "mcp_search" }>,
  ): Promise<AgentResult> {
    console.error("[agent] official MCP search_workflows", intent.query);
    const res = await officialSearchWorkflows(this.apiKey, intent.query);
    if (!res.ok && res.isError) {
      const challenge = parseMcpPaymentError(res.text);
      if (challenge) {
        return {
          ok: false,
          intent,
          message: formatX402Instructions(challenge, intent.query),
        };
      }
    }
    return {
      ok: res.ok,
      intent,
      message: res.ok
        ? `Official MCP search_workflows:\n${res.text}`
        : `MCP search failed:\n${res.text}`,
    };
  }

  private async handleMcpTools(intent: Extract<Intent, { kind: "mcp_tools" }>): Promise<AgentResult> {
    try {
      const tools = await listOfficialMcpTools(this.apiKey);
      return {
        ok: true,
        intent,
        message: [
          `Official KeeperHub MCP tools (${tools.length}):`,
          ...tools.slice(0, 40).map((t) => `  · ${t}`),
          tools.length > 40 ? `  … and ${tools.length - 40} more` : "",
        ]
          .filter(Boolean)
          .join("\n"),
      };
    } catch (e: any) {
      return {
        ok: false,
        intent,
        message: `Could not list official MCP tools: ${e.message}\nConfigure remote MCP: https://app.keeperhub.com/mcp`,
      };
    }
  }

  private async executeTransferIntent(
    intent: Extract<Intent, { kind: "transfer" }>,
  ): Promise<AgentResult> {
    const chainId = intent.chainId ?? DEFAULT_CHAIN_ID;
    const transfer: TransferBody = {
      chainId,
      recipientAddress: intent.to,
      amount: intent.amount,
    };

    console.error("[agent] safeDirectTransfer", transfer);
    try {
      const { status, simulation, executionId } = await safeDirectTransfer(
        this.apiKey,
        transfer,
        "nl-transfer",
      );
      return this.formatStatus(intent, executionId, status, simulation);
    } catch (e: any) {
      return {
        ok: false,
        intent,
        message: e.message,
      };
    }
  }

  private formatStatus(
    intent: Intent,
    executionId: string,
    status: any,
    simulation: any,
  ): AgentResult {
    const ok = status?.status === "completed";
    const link = status?.transactionLink;
    const hash = status?.transactionHash;
    const auditText = formatAuditTrail(status);
    const lines = [
      ok ? "✓ Onchain execution completed via KeeperHub Direct Execution" : `✗ Execution status: ${status?.status}`,
      `executionId: ${executionId}`,
      hash ? `transactionHash: ${hash}` : null,
      link ? `transactionLink: ${link}` : null,
      status?.sponsored != null ? `sponsored: ${status.sponsored}` : null,
      "",
      auditText,
    ].filter((x) => x !== null);

    return {
      ok,
      intent,
      message: lines.join("\n"),
      executionId,
      transactionHash: hash,
      transactionLink: link,
      status,
      simulation,
      auditTrail: auditText,
    };
  }
}

/** Call a marketplace workflow via official MCP (x402-aware error surfacing). */
export async function callMarketplaceWorkflow(
  apiKey: string,
  slug: string,
  inputs: Record<string, unknown> = {},
): Promise<AgentResult> {
  const res = await officialCallWorkflow(apiKey, slug, inputs);
  if (!res.ok) {
    const challenge = parseMcpPaymentError(res.text);
    if (challenge) {
      return {
        ok: false,
        intent: { kind: "mcp_search", query: slug },
        message: formatX402Instructions(challenge, slug),
      };
    }
  }
  return {
    ok: res.ok,
    intent: { kind: "mcp_search", query: slug },
    message: res.text,
  };
}

/** Fetch audit via official MCP get_execution (workflow + direct). */
export async function fetchOfficialExecutionAudit(
  apiKey: string,
  executionId: string,
): Promise<string> {
  const res = await officialGetExecution(apiKey, executionId);
  return res.text;
}
