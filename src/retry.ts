/** Bounded retry for KeeperHub API calls (429 / 5xx / idempotency_in_progress). */

export type RetryOpts = {
  maxAttempts?: number;
  baseDelayMs?: number;
  label?: string;
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function parseRetryAfter(headers: Headers): number | undefined {
  const raw = headers.get("Retry-After");
  if (!raw) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n * 1000 : undefined;
}

export function isRetryableHttp(status: number, body: any): boolean {
  if (status === 429) return true;
  if (status >= 500 && status <= 599) return true;
  if (status === 409 && body?.code === "idempotency_in_progress") return true;
  if (body?.retryable === true) return true;
  return false;
}

export async function withRetry<T>(
  fn: () => Promise<{ status: number; body: any; headers: Headers }>,
  opts: RetryOpts = {},
): Promise<{ status: number; body: any; headers: Headers }> {
  const maxAttempts = opts.maxAttempts ?? 4;
  const baseDelayMs = opts.baseDelayMs ?? 1000;
  const label = opts.label ?? "request";

  let last: { status: number; body: any; headers: Headers } | undefined;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    last = await fn();
    if (!isRetryableHttp(last.status, last.body) || attempt === maxAttempts) {
      return last;
    }
    const hinted = parseRetryAfter(last.headers);
    const delay = hinted ?? baseDelayMs * attempt;
    console.error(
      `[retry] ${label} attempt ${attempt}/${maxAttempts} → HTTP ${last.status} (${last.body?.code || "retryable"}), wait ${delay}ms`,
    );
    await sleep(delay);
  }
  return last!;
}
