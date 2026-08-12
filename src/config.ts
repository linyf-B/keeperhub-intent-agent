import "dotenv/config";

export const KEEPERHUB_BASE =
  process.env.KEEPERHUB_BASE?.replace(/\/$/, "") || "https://app.keeperhub.com";

/** Base Sepolia — gas-sponsored testnet; zero-value transfer works with empty org wallet. */
export const DEFAULT_CHAIN_ID = Number(process.env.CHAIN_ID || 84532);

export function requireApiKey(): string {
  const key = process.env.KEEPERHUB_API_KEY;
  if (!key || !key.startsWith("kh_")) {
    throw new Error(
      "Missing KEEPERHUB_API_KEY. Set a kh_ org key in .env (from app.keeperhub.com or npm run bootstrap).",
    );
  }
  return key;
}
