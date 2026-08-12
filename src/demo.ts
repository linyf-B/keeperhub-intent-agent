#!/usr/bin/env node
/**
 * Multi-surface demo for hackathon judges:
 *   1) whoami
 *   2) treasury scenario (balance workflow → transfer → audit)
 *   3) official MCP tool list (if reachable)
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { KeeperHubIntentAgent } from "./agent.js";
import { requireApiKey } from "./config.js";
import { listOfficialMcpTools } from "./keeperhub-mcp-client.js";
import { getUser } from "./keeperhub.js";

async function main() {
  const apiKey = requireApiKey();
  const agent = new KeeperHubIntentAgent(apiKey);
  const proof: {
    savedAt: string;
    steps: Array<Record<string, unknown>>;
  } = { savedAt: new Date().toISOString(), steps: [] };

  console.log("=== DEMO 1/3: whoami ===");
  const who = await agent.handle("whoami");
  console.log(who.message);
  proof.steps.push({ step: "whoami", ok: who.ok });

  const user: any = await getUser(apiKey);
  if (!user.walletAddress) throw new Error("No org wallet yet");

  console.log("\n=== DEMO 2/3: treasury scenario (balance → transfer → audit) ===");
  const cmd = `scenario treasury ${user.walletAddress.toLowerCase()} on 84532`;
  console.log("you>", cmd);
  const scenario = await agent.handle(cmd);
  console.log(scenario.message);
  proof.steps.push({
    step: "treasury_scenario",
    ok: scenario.ok,
    executionId: scenario.executionId,
    transactionLink: scenario.transactionLink,
  });

  console.log("\n=== DEMO 3/3: official KeeperHub MCP tools (hosted) ===");
  try {
    const tools = await listOfficialMcpTools(apiKey);
    console.log(`Official MCP at app.keeperhub.com/mcp — ${tools.length} tools`);
    console.log(tools.slice(0, 8).join(", "), tools.length > 8 ? "…" : "");
    proof.steps.push({ step: "official_mcp", ok: true, toolCount: tools.length });
  } catch (e: any) {
    console.log("(skipped — MCP list unreachable:", e.message + ")");
    proof.steps.push({ step: "official_mcp", ok: false, error: e.message });
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
