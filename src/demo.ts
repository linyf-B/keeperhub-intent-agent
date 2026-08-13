#!/usr/bin/env node
/**
 * Hackathon pitch demo — three pillars:
 *   1) Self-registering agent (bootstrap path — see npm run bootstrap)
 *   2) Audit-first last mile (treasury scenario)
 *   3) Dual MCP (local tool list + official hosted tools)
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { KeeperHubIntentAgent } from "./agent.js";
import { requireApiKey } from "./config.js";
import { listOfficialMcpTools } from "./keeperhub-mcp-client.js";
import { getUser } from "./keeperhub.js";
import { LOCAL_MCP_TOOLS, PILLARS, printPitchBanner, VISION } from "./pitch.js";

async function main() {
  console.log(printPitchBanner());

  const apiKey = requireApiKey();
  const agent = new KeeperHubIntentAgent(apiKey);
  const proof: {
    savedAt: string;
    vision: string;
    pillars: string[];
    steps: Array<Record<string, unknown>>;
  } = {
    savedAt: new Date().toISOString(),
    vision: VISION,
    pillars: [PILLARS.selfOnboard.id, PILLARS.auditFirst.id, PILLARS.dualMcp.id],
    steps: [],
  };

  console.log("=== PILLAR 1/3: Self-registering Agent ===");
  console.log(PILLARS.selfOnboard.tagline);
  console.log("Full flow: ETH_PRIVATE_KEY=0x... npm run bootstrap");
  console.log("This demo assumes bootstrap already ran (kh_ key in .env).\n");
  const who = await agent.handle("whoami");
  console.log(who.message);
  proof.steps.push({ pillar: 1, step: "whoami", ok: who.ok });

  const user: any = await getUser(apiKey);
  if (!user.walletAddress) throw new Error("No org wallet — run npm run bootstrap first");

  console.log("\n=== PILLAR 2/3: Audit-first Last Mile ===");
  console.log(PILLARS.auditFirst.tagline);
  const cmd = `scenario treasury ${user.walletAddress.toLowerCase()} on 84532`;
  console.log("you>", cmd);
  const scenario = await agent.handle(cmd);
  console.log(scenario.message);
  proof.steps.push({
    pillar: 2,
    step: "treasury_scenario",
    ok: scenario.ok,
    executionId: scenario.executionId,
    transactionLink: scenario.transactionLink,
    auditTrail: scenario.auditTrail ? "present" : "missing",
  });

  console.log("\n=== PILLAR 3/3: Dual MCP Execution Layer ===");
  console.log(PILLARS.dualMcp.tagline);
  console.log("\nLocal layer (npm run mcp) —", LOCAL_MCP_TOOLS.length, "tools:");
  console.log(LOCAL_MCP_TOOLS.slice(0, 6).join(", "), "…");
  console.log("\nOfficial layer (app.keeperhub.com/mcp):");
  try {
    const tools = await listOfficialMcpTools(apiKey);
    console.log(`  ${tools.length} hosted tools — e.g.`, tools.slice(0, 6).join(", "), "…");
    console.log("\nCopy dual config: docs/mcp-dual.json.example");
    proof.steps.push({
      pillar: 3,
      step: "dual_mcp",
      ok: true,
      localToolCount: LOCAL_MCP_TOOLS.length,
      officialToolCount: tools.length,
    });
  } catch (e: any) {
    console.log("  (official MCP unreachable:", e.message + ")");
    console.log("  Local layer still available via npm run mcp");
    proof.steps.push({ pillar: 3, step: "dual_mcp", ok: false, error: e.message });
  }

  const dir = path.resolve("proofs");
  await mkdir(dir, { recursive: true });
  const file = path.join(dir, "demo-proof.json");
  await writeFile(file, JSON.stringify({ ...proof, scenario }, null, 2));
  console.log("\nSaved", file);

  if (!scenario.ok || !scenario.transactionLink) {
    process.exit(1);
  }
  console.log("\nSUBMIT THIS TX LINK:");
  console.log(scenario.transactionLink);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
