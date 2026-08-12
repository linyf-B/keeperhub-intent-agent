# Onboarding UX Bounty — pitch for judges

**Project:** [KeeperHub Intent Agent](https://github.com/linyf-B/keeperhub-intent-agent)  
**Bounty track:** Best Onboarding UX Improvement (~$500 × 2, stackable with Grand Prize)

---

## Problem

New builders hitting KeeperHub for the Agents Onchain hackathon lose the first hour to captchas, wrong API hosts, empty-wallet simulate errors, and MCP/REST field mismatches. Email signup + Turnstile blocks headless agents and CI. Scattered docs make “zero → first real tx” harder than the execution API itself.

## Our contribution

This repo ships a **copy-paste onboarding path**, not just a demo transfer:

1. **`npm run bootstrap`** — headless SIWE (`/api/auth/siwe/*`) mints a `kh_` org API key without browser captcha; polls `/api/user` until `walletAddress` is ready; writes `.env`; runs amount-`0` self-transfer proof on Base Sepolia.
2. **`docs/QUICKSTART_HACKATHON.md`** — five-step one-pager from signup to `transactionLink`.
3. **`docs/ONBOARDING_FEEDBACK.md`** — five reproducible friction points with suggested fixes (canonical host, simulate errors, checksum, MCP/REST field map, wallet poll loop).

Evidence is in-repo and runnable; judges can verify in under 10 minutes with a throwaway EOA.

## Why this fits the bounty

- **Starter template:** `src/bootstrap.ts` is a minimal, documented reference implementation for headless onboarding.
- **Actionable feedback:** each item includes repro steps and a concrete doc/API improvement — suitable for a KeeperHub docs PR.
- **Agent-native:** same flow powers CLI, 14 local MCP tools, and official MCP bridge — see `docs/KEEPERHUB_SURFACES.md`.
- **Docs PR ready:** `contributions/keeperhub-docs-quickstart-pr.md` — mergeable quickstart for KeeperHub docs.

## Links

| Asset | URL |
|-------|-----|
| Bootstrap script | https://github.com/linyf-B/keeperhub-intent-agent/blob/main/src/bootstrap.ts |
| Onboarding feedback | https://github.com/linyf-B/keeperhub-intent-agent/blob/main/docs/ONBOARDING_FEEDBACK.md |
| Hackathon quickstart | https://github.com/linyf-B/keeperhub-intent-agent/blob/main/docs/QUICKSTART_HACKATHON.md |
| Proof tx (Base Sepolia) | https://sepolia.basescan.org/tx/0xebf18e68005f5ffdc75188a116100b9461a789ebf890bb7d7a983ead19504ff5 |

We are happy to open a PR against [KeeperHub docs](https://docs.keeperhub.com/) with the quickstart one-pager and field-map table if useful.
