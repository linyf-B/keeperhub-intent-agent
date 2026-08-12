import type { Intent } from "./intent.js";

/** Lightweight multi-step planner — deterministic, no LLM required. */
export type PlanStep =
  | { step: "balance"; address: string; chainId: number }
  | { step: "transfer"; to: string; amount: string; chainId: number }
  | { step: "audit"; executionId: string }
  | { step: "workflow_setup"; chainId: number }
  | { step: "workflow_run"; workflowId: string };

export type Plan = {
  name: string;
  description: string;
  steps: PlanStep[];
};

const SCENARIO_TREASURY =
  /treasury|proof|last.?mile|full.?run|scenario/i;

export function buildPlan(raw: string, intent: Intent): Plan | null {
  const text = raw.trim();

  if (SCENARIO_TREASURY.test(text) && intent.kind === "transfer") {
    const chainId = intent.chainId ?? 84532;
    return {
      name: "treasury-proof",
      description:
        "Treasury agent scenario: read balance → simulate → execute → audit trail (hackathon last-mile demo).",
      steps: [
        { step: "balance", address: intent.to, chainId },
        { step: "transfer", to: intent.to, amount: intent.amount, chainId },
      ],
    };
  }

  if (intent.kind === "scenario" && intent.name === "treasury") {
    const chainId = intent.chainId ?? 84532;
    return {
      name: "treasury-proof",
      description: "Full last-mile treasury proof on Base Sepolia.",
      steps: [
        { step: "balance", address: intent.address, chainId },
        {
          step: "transfer",
          to: intent.address,
          amount: intent.amount ?? "0",
          chainId,
        },
      ],
    };
  }

  if (intent.kind === "workflow_setup") {
    return {
      name: "workflow-setup",
      description: "Create a Manual → check-balance workflow via Workflows API.",
      steps: [{ step: "workflow_setup", chainId: intent.chainId ?? 84532 }],
    };
  }

  if (intent.kind === "workflow_run") {
    return {
      name: "workflow-run",
      description: `Execute workflow ${intent.workflowId} and wait for audit trail.`,
      steps: [{ step: "workflow_run", workflowId: intent.workflowId }],
    };
  }

  return null;
}

export function summarizePlan(plan: Plan): string {
  const lines = [
    `Plan: ${plan.name}`,
    plan.description,
    `Steps (${plan.steps.length}):`,
    ...plan.steps.map((s, i) => `  ${i + 1}. ${s.step}`),
  ];
  return lines.join("\n");
}
