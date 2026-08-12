#!/usr/bin/env node
/**
 * Headless KeeperHub onboarding (no browser captcha).
 * Needs ETH_PRIVATE_KEY of a throwaway EOA.
 * Creates org + kh_ API key, prints org wallet, optionally runs amount=0 self-transfer.
 *
 * Usage:
 *   ETH_PRIVATE_KEY=0x... npm run bootstrap
 */
import "dotenv/config";
import { writeFileSync } from "node:fs";
import { privateKeyToAccount } from "viem/accounts";
import { DEFAULT_CHAIN_ID, KEEPERHUB_BASE } from "./config.js";
import {
  executeTransfer,
  pollExecutionStatus,
  simulateTransfer,
  stableIdempotencyKey,
  newTaskId,
} from "./keeperhub.js";

const cookies = new Map<string, string>();

async function api(path: string, init: RequestInit = {}) {
  const res = await fetch(`${KEEPERHUB_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Origin: KEEPERHUB_BASE,
      Cookie: Array.from(cookies, ([k, v]) => `${k}=${v}`).join("; "),
      ...(init.headers as Record<string, string>),
    },
  });
  for (const raw of res.headers.getSetCookie?.() || []) {
    const pair = raw.split(";")[0];
    const eq = pair.indexOf("=");
    cookies.set(pair.slice(0, eq).trim(), pair.slice(eq + 1));
  }
  const text = await res.text();
  try {
    return { status: res.status, body: JSON.parse(text) };
  } catch {
    return { status: res.status, body: { error: text.slice(0, 300) } };
  }
}

function must<T>(res: { status: number; body: T }, what: string): T {
  if (res.status >= 400) {
    throw new Error(`${what}: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return res.body;
}

async function main() {
  const pk = process.env.ETH_PRIVATE_KEY as `0x${string}` | undefined;
  if (!pk?.startsWith("0x")) {
    throw new Error("Set ETH_PRIVATE_KEY=0x... (throwaway wallet for SIWE signup)");
  }
  const account = privateKeyToAccount(pk);
  console.log("login address:", account.address);

  const nonce = must(
    await api("/api/auth/siwe/nonce", {
      method: "POST",
      body: JSON.stringify({ walletAddress: account.address, chainId: 1 }),
    }),
    "siwe nonce",
  ) as any;

  const message = [
    `${new URL(KEEPERHUB_BASE).host} wants you to sign in with your Ethereum account:`,
    account.address,
    "",
    "Sign in to KeeperHub",
    "",
    `URI: ${KEEPERHUB_BASE}`,
    "Version: 1",
    "Chain ID: 1",
    `Nonce: ${nonce.nonce}`,
    `Issued At: ${new Date().toISOString()}`,
  ].join("\n");

  must(
    await api("/api/auth/siwe/verify", {
      method: "POST",
      body: JSON.stringify({
        message,
        signature: await account.signMessage({ message }),
        walletAddress: account.address,
        chainId: 1,
      }),
    }),
    "siwe verify",
  );
  console.log("SIWE session OK");

  const create = { name: `hackathon-agent-${Date.now()}` };
  const first = await api("/api/keys", {
    method: "POST",
    body: JSON.stringify(create),
  });
  if ((first.body as any).code !== "signature_required") {
    throw new Error(`expected challenge: ${first.status} ${JSON.stringify(first.body)}`);
  }
  const keyBody = must(
    await api("/api/keys", {
      method: "POST",
      body: JSON.stringify({
        ...create,
        signature: await account.signMessage({
          message: (first.body as any).challenge,
        }),
      }),
    }),
    "create key",
  ) as any;

  const apiKey = keyBody.key as string;
  if (!apiKey?.startsWith("kh_")) {
    throw new Error(`unexpected key payload: ${JSON.stringify(keyBody)}`);
  }
  console.log("created API key (save this — shown once):", apiKey);

  let user = must(await api("/api/user"), "user") as any;
  for (let i = 0; !user.walletAddress && i < 20; i++) {
    await new Promise((r) => setTimeout(r, 1500));
    user = must(await api("/api/user"), "user") as any;
  }
  if (!user.walletAddress) {
    throw new Error("org wallet not ready yet — rerun shortly");
  }
  console.log("org wallet (execution from-address):", user.walletAddress);

  const envPath = ".env";
  writeFileSync(
    envPath,
    [
      `KEEPERHUB_API_KEY=${apiKey}`,
      `KEEPERHUB_BASE=${KEEPERHUB_BASE}`,
      `CHAIN_ID=${DEFAULT_CHAIN_ID}`,
      `# login EOA (optional, for bootstrap only)`,
      `# ETH_PRIVATE_KEY=${pk}`,
      "",
    ].join("\n"),
  );
  console.log(`wrote ${envPath}`);

  // First proof: zero-value self-transfer on Base Sepolia (no faucet needed).
  const transfer = {
    chainId: DEFAULT_CHAIN_ID,
    recipientAddress: user.walletAddress.toLowerCase(),
    amount: "0",
  };
  const sim = await simulateTransfer(apiKey, transfer);
  if (sim.status >= 400 || !(sim.body as any).success || (sim.body as any).wouldRevert) {
    throw new Error(`simulation failed: ${JSON.stringify(sim.body)}`);
  }
  const taskId = newTaskId("bootstrap");
  const idem = stableIdempotencyKey({
    taskId,
    chainId: transfer.chainId,
    recipientAddress: transfer.recipientAddress,
    amount: transfer.amount,
  });
  const exec = must(
    await executeTransfer(apiKey, transfer, idem),
    "execute",
  ) as any;
  const status = await pollExecutionStatus(apiKey, exec.executionId);
  console.log("bootstrap proof status:", status.status);
  console.log("transactionLink:", status.transactionLink || "(none)");
  console.log("\nNext: npm start   then:  transfer 0 to " + user.walletAddress);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
