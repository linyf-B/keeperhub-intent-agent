# Pillar 1 — Self-registering Agent

**Vision:** *The agent that onboard itself — then executes onchain via KeeperHub.*

Most hackathon projects assume you already have a `kh_` API key from the dashboard. Autonomous agents, CI, and Cursor sessions **cannot** complete email captcha or browser OAuth. This repo solves **minute zero**.

## What `npm run bootstrap` does

| Step | API | Agent-native? |
|------|-----|---------------|
| SIWE nonce + verify | `POST /api/auth/siwe/*` | ✅ no browser |
| Create org API key | `POST /api/keys` + wallet signature | ✅ headless |
| Poll org wallet | `GET /api/user` until `walletAddress` | ✅ retry loop |
| Write `.env` | local | ✅ CI-friendly |
| First proof tx | simulate → execute → poll | ✅ real chain |

```bash
ETH_PRIVATE_KEY=0xYOUR_THROWAWAY_KEY npm run bootstrap
npm run demo
```

Use a **throwaway EOA** only — never a funded mainnet key.

## Target users

- Autonomous LLM agents (Claude Code, Cursor, CI bots)
- Hackathon builders who lost the first hour to Turnstile
- Anyone shipping "agent executes onchain" without a human in the loop

## Related feedback

Same pain class as [KeeperHub#1700](https://github.com/KeeperHub/keeperhub/issues/1700) — agent auth without TTY. Our mitigation is documented in [`ONBOARDING_FEEDBACK.md`](./ONBOARDING_FEEDBACK.md).

## Reference

- Implementation: [`src/bootstrap.ts`](../src/bootstrap.ts)
- Quickstart: [`QUICKSTART_HACKATHON.md`](./QUICKSTART_HACKATHON.md)
