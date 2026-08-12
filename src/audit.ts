/** Format KeeperHub audit trail fields for CLI / MCP output. */

export type ReceiptEntry = {
  hash?: string;
  chainId?: number;
  verified?: boolean;
  receiptStatus?: string;
  blockNumber?: number;
  gasUsed?: string;
  verifiedAt?: string;
};

export type DirectExecutionStatus = {
  executionId?: string;
  status?: string;
  type?: string;
  transactionHash?: string;
  transactionLink?: string;
  sponsored?: boolean;
  receipts?: ReceiptEntry[];
  gasUsedWei?: string;
  error?: string | null;
  createdAt?: string;
  completedAt?: string;
  idempotentReplay?: boolean;
};

export function formatAuditTrail(status: DirectExecutionStatus): string {
  const lines: string[] = ["── Audit trail (Direct Execution) ──"];
  if (status.executionId) lines.push(`executionId: ${status.executionId}`);
  if (status.type) lines.push(`type: ${status.type}`);
  if (status.status) lines.push(`status: ${status.status}`);
  if (status.sponsored != null) lines.push(`sponsored: ${status.sponsored}`);
  if (status.idempotentReplay) lines.push(`idempotentReplay: true (cached outcome)`);
  if (status.transactionHash) lines.push(`transactionHash: ${status.transactionHash}`);
  if (status.transactionLink) lines.push(`transactionLink: ${status.transactionLink}`);
  if (status.gasUsedWei) lines.push(`gasUsedWei: ${status.gasUsedWei}`);
  if (status.createdAt) lines.push(`createdAt: ${status.createdAt}`);
  if (status.completedAt) lines.push(`completedAt: ${status.completedAt}`);
  if (status.error) lines.push(`error: ${status.error}`);

  const receipts = status.receipts ?? [];
  if (receipts.length === 0) {
    lines.push("receipts: (none — simulation/read-only or pending)");
  } else {
    lines.push(`receipts (${receipts.length}):`);
    for (const [i, r] of receipts.entries()) {
      lines.push(
        `  [${i + 1}] hash=${r.hash ?? "?"} verified=${r.verified} receiptStatus=${r.receiptStatus ?? "?"} block=${r.blockNumber ?? "?"} gas=${r.gasUsed ?? "?"}`,
      );
    }
  }
  return lines.join("\n");
}

export function formatWorkflowAudit(exec: {
  executionId?: string;
  status?: string;
  completed?: boolean;
  transactionHashes?: Array<{
    hash: string;
    nodeId?: string;
    nodeName?: string;
    verified?: boolean;
    receiptStatus?: string;
  }>;
  gasUsedWei?: string | null;
  error?: string | null;
}): string {
  const lines: string[] = ["── Audit trail (Workflow execution) ──"];
  if (exec.executionId) lines.push(`executionId: ${exec.executionId}`);
  if (exec.status) lines.push(`status: ${exec.status}`);
  if (exec.completed != null) lines.push(`completed: ${exec.completed}`);
  if (exec.gasUsedWei) lines.push(`gasUsedWei: ${exec.gasUsedWei}`);
  if (exec.error) lines.push(`error: ${exec.error}`);

  const txs = exec.transactionHashes ?? [];
  if (txs.length === 0) {
    lines.push("transactionHashes: (none)");
  } else {
    lines.push(`transactionHashes (${txs.length}):`);
    for (const [i, t] of txs.entries()) {
      lines.push(
        `  [${i + 1}] ${t.nodeName ?? t.nodeId ?? "step"} → ${t.hash} verified=${t.verified ?? "?"} status=${t.receiptStatus ?? "?"}`,
      );
    }
  }
  return lines.join("\n");
}
