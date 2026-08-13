# 如何提交到 KeeperHub 官方仓库

我无法代你登录 GitHub，请在本机 **2～5 分钟** 完成以下 **方案 A（推荐）** 或 **方案 B**。

---

## 方案 A — 开 GitHub Issue（最快，≈2 分钟）

1. 打开：**https://github.com/KeeperHub/keeperhub/issues/new**
2. **Title** 粘贴：

```
Docs: hackathon quickstart one-pager (headless SIWE + safe first write)
```

3. **Body** 粘贴：

```markdown
## Summary

Hackathon submission [keeperhub-intent-agent](https://github.com/linyf-B/keeperhub-intent-agent) ships a runnable headless onboarding path. Proposing a docs one-pager for Agents Onchain builders.

## Proposed file

`docs/hackathon/quickstart-agents-onchain.md`

Full markdown ready in our repo:
https://github.com/linyf-B/keeperhub-intent-agent/blob/main/contributions/quickstart-agents-onchain.md

## Why merge

- Reduces first-hour friction (wrong host, simulate errors, MCP/REST field map)
- Runnable reference: `src/bootstrap.ts` — SIWE → `kh_` key → amount-0 proof on Base Sepolia
- Detailed feedback: [ONBOARDING_FEEDBACK.md](https://github.com/linyf-B/keeperhub-intent-agent/blob/main/docs/ONBOARDING_FEEDBACK.md)

## Related

Similar pain to #1700 (agent headless auth). Happy to open a proper PR if maintainers prefer.

Built for DoraHacks Agents Onchain · Onboarding UX bounty track.
```

4. 点 **Submit new issue**

---

## 方案 B — 提 Pull Request（bounty「merged PR」加分）

1. Fork：**https://github.com/KeeperHub/keeperhub/fork**
2. 克隆你的 fork：

```bash
git clone https://github.com/YOUR_USER/keeperhub.git
cd keeperhub
git checkout staging
git pull origin staging
mkdir -p docs/hackathon
```

3. 复制本仓库文件：

```bash
copy "d:\_A\MeDOCS\Project\web3\keeperhub-intent-agent\contributions\quickstart-agents-onchain.md" docs/hackathon/quickstart-agents-onchain.md
```

4. 提交并 push：

```bash
git checkout -b docs/hackathon-quickstart-agents-onchain
git add docs/hackathon/quickstart-agents-onchain.md
git commit -m "docs: add Agents Onchain hackathon quickstart one-pager"
git push origin docs/hackathon-quickstart-agents-onchain
```

5. 打开 GitHub 提示的 **Compare & pull request**，base 选 `KeeperHub/keeperhub` **`staging`** 分支

**PR description** 用方案 A 的 Body 即可。

---

## 方案 C — 在 #1700 留评论（备选）

若已有讨论：**https://github.com/KeeperHub/keeperhub/issues/1700**

简短评论 + 链到：

- https://github.com/linyf-B/keeperhub-intent-agent/blob/main/contributions/quickstart-agents-onchain.md
- https://github.com/linyf-B/keeperhub-intent-agent/blob/main/docs/ONBOARDING_FEEDBACK.md

---

## BUIDL 里可写（提交 Issue/PR 后）

```
Docs contribution: opened GitHub Issue/PR to KeeperHub/keeperhub (hackathon quickstart one-pager).
```
