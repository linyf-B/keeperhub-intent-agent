export type TransferIntent = {
  kind: "transfer";
  to: string;
  amount: string;
  chainId?: number;
  note?: string;
};

export type HelpIntent = { kind: "help" };
export type WhoamiIntent = { kind: "whoami" };
export type Intent = TransferIntent | HelpIntent | WhoamiIntent;

const ADDR = /0x[a-fA-F0-9]{40}/;
const AMOUNT = /(\d+(?:\.\d+)?)/;

/**
 * Tiny deterministic NL parser — enough for demo + hackathon proof.
 * Supports:
 *   transfer 0.001 to 0xabc...
 *   send 0 eth to 0xabc... on 84532
 *   pay 0xabc... 0.0001
 *   whoami / help
 */
export function parseIntent(input: string): Intent {
  const text = input.trim();
  const lower = text.toLowerCase();

  if (!text || lower === "help" || lower === "?" || lower === "h") {
    return { kind: "help" };
  }
  if (lower === "whoami" || lower === "me" || lower === "wallet") {
    return { kind: "whoami" };
  }

  const addrMatch = text.match(ADDR);
  if (!addrMatch) {
    throw new Error(
      `Could not find a recipient address in: "${text}". Try: transfer 0 to 0xYourAddress`,
    );
  }
  const to = addrMatch[0].toLowerCase();

  let amount = "0";
  const amountPatterns = [
    /(?:transfer|send|pay)\s+(\d+(?:\.\d+)?)/i,
    /(\d+(?:\.\d+)?)\s*(?:eth|wei)?\s+(?:to|→|->)/i,
    new RegExp(`${ADDR.source}\\s+${AMOUNT.source}`, "i"),
    /amount\s*[:=]?\s*(\d+(?:\.\d+)?)/i,
  ];
  for (const re of amountPatterns) {
    const m = text.match(re);
    if (m?.[1]) {
      amount = m[1];
      break;
    }
  }

  let chainId: number | undefined;
  const chainMatch = text.match(/(?:on|chain(?:Id)?)\s*[:=]?\s*(\d+)/i);
  if (chainMatch) chainId = Number(chainMatch[1]);

  return {
    kind: "transfer",
    to,
    amount,
    chainId,
    note: text,
  };
}

export const HELP_TEXT = `KeeperHub Intent Agent — natural language → real onchain execution via KeeperHub

Commands:
  help
  whoami
  transfer 0 to 0xYourOrgWallet
  send 0.0001 to 0xRecipient on 84532
  pay 0xRecipient 0

Notes:
  - Execution always goes through KeeperHub Direct Execution API (not a local wallet).
  - Default chain is Base Sepolia (84532). amount "0" self-transfer is the safest first proof.
  - Set KEEPERHUB_API_KEY=kh_... in .env
`;
