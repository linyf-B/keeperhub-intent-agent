/**
 * x402 / MPP payment challenge helpers for paid KeeperHub workflows.
 * Full autopay requires @keeperhub/wallet or agentcash — see docs/X402_MPP.md.
 */

export type X402Challenge = {
  protocol: "x402" | "mpp" | "unknown";
  payTo?: string;
  amount?: string;
  unit?: string;
  asset?: string;
  raw: unknown;
};

export function parsePaymentChallenge(status: number, body: unknown): X402Challenge | null {
  if (status !== 402 && !(body && typeof body === "object" && (body as any).x402)) {
    return null;
  }
  const b = body as any;
  const x402 = b?.x402 ?? b?.payment ?? b;
  const protocol =
    x402?.protocol === "mpp" || b?.mpp ? "mpp" : x402 ? "x402" : "unknown";
  return {
    protocol,
    payTo: x402?.payTo ?? x402?.recipient,
    amount: x402?.amount ?? x402?.maxAmountRequired,
    unit: x402?.unit ?? "USDC",
    asset: x402?.asset ?? x402?.token,
    raw: body,
  };
}

export function formatX402Instructions(challenge: X402Challenge, workflowSlug?: string): string {
  const lines = [
    "── x402 / MPP payment required ──",
    workflowSlug ? `workflow: ${workflowSlug}` : null,
    `protocol: ${challenge.protocol}`,
    challenge.amount ? `amount: ${challenge.amount} ${challenge.unit ?? ""}`.trim() : null,
    challenge.payTo ? `payTo: ${challenge.payTo}` : null,
    challenge.asset ? `asset: ${challenge.asset}` : null,
    "",
    "To autopay, install KeeperHub agentic wallet:",
    "  npx -p @keeperhub/wallet keeperhub-wallet skill install",
    "  npx -p @keeperhub/wallet keeperhub-wallet add",
    "",
    "Then retry via official MCP call_workflow — the PreToolUse hook signs x402/MPP.",
    "See docs/X402_MPP.md in this repo.",
  ].filter(Boolean);
  return lines.join("\n");
}

/** Detect 402 in MCP tool error text (paid workflow listing). */
export function parseMcpPaymentError(text: string): X402Challenge | null {
  if (!/402|x402|payment|MPP/i.test(text)) return null;
  try {
    const json = JSON.parse(text);
    return parsePaymentChallenge(402, json);
  } catch {
    return {
      protocol: "x402",
      raw: text,
    };
  }
}
