import { DEFAULT_CHAIN_ID } from "./config.js";
import { HELP_TEXT, parseIntent, type Intent } from "./intent.js";
import {
  executeTransfer,
  getUser,
  newTaskId,
  pollExecutionStatus,
  simulateTransfer,
  stableIdempotencyKey,
  type TransferBody,
} from "./keeperhub.js";

export type AgentResult = {
  ok: boolean;
  intent: Intent | { kind: "error"; message: string };
  message: string;
  executionId?: string;
  transactionHash?: string;
  transactionLink?: string;
  status?: any;
  simulation?: any;
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

    return this.executeTransferIntent(intent);
  }

  private async executeTransferIntent(intent: Extract<Intent, { kind: "transfer" }>): Promise<AgentResult> {
    const chainId = intent.chainId ?? DEFAULT_CHAIN_ID;
    const transfer: TransferBody = {
      chainId,
      recipientAddress: intent.to,
      amount: intent.amount,
    };

    console.error("[agent] intent → KeeperHub simulate", transfer);
    const sim = await simulateTransfer(this.apiKey, transfer);
    const simBody: any = sim.body;
    if (sim.status >= 400 || !simBody?.success || simBody?.wouldRevert) {
      return {
        ok: false,
        intent,
        message: `Simulation failed — refusing to broadcast.\n${JSON.stringify(simBody, null, 2)}`,
        simulation: simBody,
      };
    }

    const taskId = newTaskId("nl-transfer");
    const idem = stableIdempotencyKey({
      taskId,
      chainId,
      recipientAddress: transfer.recipientAddress,
      amount: transfer.amount,
    });

    console.error("[agent] simulate ok → execute via KeeperHub", { taskId, idem });
    const execRes = await executeTransfer(this.apiKey, transfer, idem);
    if (execRes.status >= 400) {
      // Conflict with originalExecutionId: recover by polling.
      const body: any = execRes.body;
      if (body?.originalExecutionId) {
        console.error("[agent] idempotency conflict — polling original", body.originalExecutionId);
        const status = await pollExecutionStatus(this.apiKey, body.originalExecutionId);
        return this.formatStatus(intent, body.originalExecutionId, status, simBody);
      }
      return {
        ok: false,
        intent,
        message: `Execute failed: HTTP ${execRes.status} ${JSON.stringify(body)}`,
        simulation: simBody,
      };
    }

    const execBody: any = execRes.body;
    const executionId = execBody.executionId;
    if (!executionId) {
      return {
        ok: false,
        intent,
        message: `No executionId in response: ${JSON.stringify(execBody)}`,
        simulation: simBody,
      };
    }

    console.error("[agent] polling KeeperHub execution status", executionId);
    const status = await pollExecutionStatus(this.apiKey, executionId);
    return this.formatStatus(intent, executionId, status, simBody);
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
    const lines = [
      ok ? "✓ Onchain execution completed via KeeperHub" : `✗ Execution status: ${status?.status}`,
      `executionId: ${executionId}`,
      hash ? `transactionHash: ${hash}` : null,
      link ? `transactionLink: ${link}` : null,
      status?.sponsored != null ? `sponsored: ${status.sponsored}` : null,
    ].filter(Boolean);

    return {
      ok,
      intent,
      message: lines.join("\n"),
      executionId,
      transactionHash: hash,
      transactionLink: link,
      status,
      simulation,
    };
  }
}
