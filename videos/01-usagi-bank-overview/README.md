# 01 Usagi-Bank 概要動画（Web 版）

勘定系デモ Usagi-Bank の COBOL 日次バッチ（`UBEOD001.cbl`）を題材に、Devin の 4 つの機能を実画面で見せる無音・日本語の概要動画です（約 1 分 46 秒）。

| 章 | 画面で見せること |
|---|---|
| 1 解析 | Ask Devin が COBOL を読み、行番号付きの根拠リンクで説明 |
| 2 移行 | Agent セッションが Java に移行し、ゴールデンファイルとの 1 バイト一致を確認して PR を作成 |
| 3 テスト | Devin がアプリを動かし、口座照会画面の未払利息をブラウザで確認して録画 |
| 4 レビュー | Devin Review の指摘 4 件を Devin が自動で修正 |

- `01-usagi-bank-overview.mp4`: 3840×2160・60fps・音声なし / `01-usagi-bank-overview-1080p.mp4`: 1920×1080
- 録画元のセッション・PR は `shots/SOURCES.json`
- 撮り直し: `capture.mjs` の各 `PHASE`（`ask` → `cite` → `migrate` → `work` → `test` → `play` → `review`）
