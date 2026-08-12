# Demo 操作稿（只给你看，不要入镜）

总时长约 **60–90 秒**。

## 录前开好三个标签页

1. **展示页（入镜）**：`docs/demo-show.html`
2. **GitHub**：https://github.com/linyf-B/keeperhub-intent-agent
3. **BaseScan**：https://sepolia.basescan.org/tx/0xebf18e68005f5ffdc75188a116100b9461a789ebf890bb7d7a983ead19504ff5

开始录：`Win + G` 或 `Win + Alt + R`  
结束录：再按 `Win + Alt + R`  
成片一般在：`视频\Captures`

口播音频（TTS，不必自己念）：`docs/demo-audio/`  
按 `01-open` → `05-close` 依次播放，或用 `00-full-narration.mp3` 连播。

---

### ① 开场 · ~15 秒

- **切到**：`demo-show.html` 顶部标题区
- **念**：这是 KeeperHub Intent Agent。Agent 负责理解自然语言转账意图，真正的链上执行走 KeeperHub Direct Execution API，不是本地钱包直接发交易。

### ② 仓库 · ~15 秒

- **切到**：GitHub 仓库页，停 **3 秒**（可轻滚 README）
- **念**：源码在 GitHub，核心流程是 simulate → execute → 轮询拿 transactionLink。

### ③ 运行结果 · ~25 秒

- **切到**：`demo-show.html` 中间「Execution result」代码块，鼠标指一下 `transactionHash`
- **念**：自然语言指令解析后，经 KeeperHub 模拟并上链，已拿到交易哈希。

### ④ 链上证明 · ~25 秒

- **切到**：BaseScan 交易页 → 滚到 **Success** → 停 2–3 秒
- **念**：这是 Base Sepolia 上的真实交易。提交材料包含 GitHub、本 Demo、以及这笔 transaction link。

### ⑤ 收尾 · ~10 秒

- **画面**：停在 BaseScan Success，或切回 `demo-show.html` 标题
- **念**：感谢 KeeperHub 与 DoraHacks。以上是 Intent Agent 的完整演示。

---

## 速记

1. 展示页标题 → 开场那句  
2. GitHub 停 3 秒 → simulate → execute → 轮询  
3. 展示页结果块 → 已上链拿到 hash  
4. BaseScan Success → 真链证明  
5. 停 → 谢谢  

## 注意

- 入镜只用 `demo-show.html` + GitHub + BaseScan；**不要**把本操作稿或带 STEP 的旧页录进去。  
- 别露出 `.env`、API Key、私钥。  
- 默认不必现场跑 `npm run demo`。
