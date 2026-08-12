import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseIntent } from "../src/intent.js";
import { canonicalizeAmount, stableIdempotencyKey } from "../src/keeperhub.js";
import { isRetryableHttp } from "../src/retry.js";
import { buildPlan } from "../src/planner.js";

describe("parseIntent", () => {
  it("parses transfer with chain", () => {
    const i = parseIntent("send 0.001 to 0x742d35cc6634c0532925a3b844bc454e4438f44e on 84532");
    assert.equal(i.kind, "transfer");
    if (i.kind === "transfer") {
      assert.equal(i.amount, "0.001");
      assert.equal(i.chainId, 84532);
    }
  });

  it("parses balance and audit", () => {
    const b = parseIntent("balance 0x742d35cc6634c0532925a3b844bc454e4438f44e on 84532");
    assert.equal(b.kind, "balance");
    const a = parseIntent("audit direct_abc123");
    assert.equal(a.kind, "audit");
  });

  it("parses treasury scenario", () => {
    const s = parseIntent("scenario treasury 0x742d35cc6634c0532925a3b844bc454e4438f44e");
    assert.equal(s.kind, "scenario");
  });
});

describe("idempotency", () => {
  it("canonicalizes amounts", () => {
    assert.equal(canonicalizeAmount("0.0010"), "0.001");
    assert.equal(canonicalizeAmount("007"), "7");
  });

  it("stable key is deterministic", () => {
    const a = stableIdempotencyKey({
      taskId: "job-1",
      chainId: 84532,
      recipientAddress: "0xAbC",
      amount: "0",
    });
    const b = stableIdempotencyKey({
      taskId: "job-1",
      chainId: "84532",
      recipientAddress: "0xabc",
      amount: "0.0",
    });
    assert.equal(a, b);
  });
});

describe("retry", () => {
  it("detects retryable statuses", () => {
    assert.equal(isRetryableHttp(429, {}), true);
    assert.equal(isRetryableHttp(503, {}), true);
    assert.equal(isRetryableHttp(409, { code: "idempotency_in_progress" }), true);
    assert.equal(isRetryableHttp(400, {}), false);
  });
});

describe("planner", () => {
  it("builds treasury plan from scenario intent", () => {
    const intent = parseIntent("scenario treasury 0x742d35cc6634c0532925a3b844bc454e4438f44e");
    const plan = buildPlan("scenario treasury 0x...", intent);
    assert.ok(plan);
    assert.equal(plan!.name, "treasury-proof");
    assert.ok(plan!.steps.length >= 2);
  });
});
