# Demo 口播音频（TTS）

由 `DEMO_CUE.md` 口播稿用 Edge 中文女声（`zh-CN-XiaoxiaoNeural`）生成。

## 文件

| 文件 | 对应环节 | 用法 |
|------|----------|------|
| `00-full-narration.mp3` | 全程连读 | 可作参考；切屏节奏需自己对 |
| `01-open.mp3` | ① 开场 | 播这段时切到 `demo-show.html` 标题 |
| `02-github.mp3` | ② 仓库 | 播这段时切到 GitHub |
| `03-result.mp3` | ③ 结果 | 播这段时切到展示页结果块 |
| `04-basescan.mp3` | ④ 证明 | 播这段时切到 BaseScan Success |
| `05-close.mp3` | ⑤ 收尾 | 停在 BaseScan 或展示页 |

目录：`docs/demo-audio/`

## 推荐录法

1. 浏览器准备好展示页 / GitHub / BaseScan  
2. 开始屏幕录制（可先静音系统，后面再叠音轨；或边播边录）  
3. 按 `01`→`05` 依次播放，同时按 CUE 切屏  
4. 段与段之间留 1–2 秒空隙方便切换  

重新生成：

```bash
python docs/demo-audio/_gen_tts.py
```
