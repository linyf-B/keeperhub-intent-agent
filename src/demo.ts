#!/usr/bin/env node
/**
 * Non-interactive demo for recording:
 *   whoami → transfer 0 to org wallet → print tx link
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { KeeperHubIntentAgent } from "./agent.js";
import { requireApiKey } from "./config.js";
import { getUser } from "./keeperhub.js";

async function main() {
  const apiKey = requireApiKey();
  const agent = new KeeperHubIntentAgent(apiKey);

  console.log("=== DEMO 1/2: whoami ===");
  const who = await agent.handle("whoami");
  console.log(who.message);

  const user: any = await getUser(apiKey);
  if (!user.walletAddress) {
    throw new Error("No org wallet yet");
  }

  console.log("\n=== DEMO 2/2: NL transfer via KeeperHub ===");
  const cmd = `transfer 0 to ${user.walletAddress}`;
  console.log("you>", cmd);
  const result = await agent.handle(cmd);
  console.log(result.message);

  const dir = path.resolve("proofs");
  await mkdir(dir, { recursive: true });
  const file = path.join(dir, "demo-proof.json");
  await writeFile(file, JSON.stringify(result, null, 2));
  console.log("\nSaved", file);
  if (!result.ok || !result.transactionLink) {
    process.exit(1);
  }
  console.log("\nSUBMIT THIS TX LINK:");
  console.log(result.transactionLink);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
