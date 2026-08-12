#!/usr/bin/env node
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { KeeperHubIntentAgent } from "./agent.js";
import { requireApiKey } from "./config.js";
import { HELP_TEXT } from "./intent.js";

async function saveProof(result: Awaited<ReturnType<KeeperHubIntentAgent["handle"]>>) {
  if (!result.transactionLink && !result.executionId) return;
  const dir = path.resolve("proofs");
  await mkdir(dir, { recursive: true });
  const file = path.join(dir, `proof-${Date.now()}.json`);
  await writeFile(
    file,
    JSON.stringify(
      {
        savedAt: new Date().toISOString(),
        ...result,
      },
      null,
      2,
    ),
  );
  console.error(`[agent] proof saved → ${file}`);
}

async function main() {
  const apiKey = requireApiKey();
  const agent = new KeeperHubIntentAgent(apiKey);
  const args = process.argv.slice(2).join(" ").trim();

  if (args) {
    const result = await agent.handle(args);
    console.log(result.message);
    await saveProof(result);
    process.exit(result.ok ? 0 : 1);
  }

  console.log(HELP_TEXT);
  console.log("Interactive mode. Type a command (Ctrl+C to exit).\n");
  const rl = createInterface({ input, output });
  while (true) {
    const line = await rl.question("you> ");
    if (!line.trim()) continue;
    if (["exit", "quit", "q"].includes(line.trim().toLowerCase())) break;
    const result = await agent.handle(line);
    console.log(result.message + "\n");
    await saveProof(result);
  }
  rl.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
