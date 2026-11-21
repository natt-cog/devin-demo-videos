# 02 Devin 機能紹介（4 部構成）

Devin の主な機能を 1 本で紹介する無音・日本語の動画です（長さ: LENGTH）。各部の前に全画面の部カード、部の中の章は画面左下のラベルで区切り、画面右上に今の部・章と 4 部の進み具合を常に表示します。

| 部 | 章 | 画面で見せること（実際の結果） |
|---|---|---|
| 第 1 部 基本的な使い方 | 1-1 DeepWiki → 1-2 Wiki と会話 → 1-3 プラン → 1-4 実装 → 1-5 テストと録画 → 1-6 Devin Review | Usagi-Bank の Wiki に質問し、プランからダークモードを実装（[Usagi-Bank PR #70](https://github.com/natt-cog/Usagi-Bank/pull/70)）。ブラウザテストの録画（7 件成功）と Devin Review（No Issues Found） |
| 第 2 部 Automations | 2-1 Automation の作成 → 2-2 Slack で不具合報告 → 2-3 調査結果と修正 PR | `#usagi-bugs` への投稿をきっかけに Devin が再現・原因調査し、スレッドに返信して [usagi-ecommerce PR #3](https://github.com/natt-cog/usagi-ecommerce/pull/3) を作成 |
| 第 3 部 Devin On-call | PART3 | PART3DESC |
| 第 4 部 Devin Security | 4-1 脅威モデルとスキャン → 4-2 指摘の確認 → 4-3 Devinで修正 | usagi-ecommerce の脅威モデルを作ってスキャン（未対応 15 件）。SQL インジェクションを「Devinで修正」し [usagi-ecommerce PR #2](https://github.com/natt-cog/usagi-ecommerce/pull/2)（CI 成功） |

- `02-devin-feature-tour.mp4`: 3840×2160・60fps・音声なし / `02-devin-feature-tour-1080p.mp4`: 1920×1080
- 素材は部ごとに `shots_p1`〜`shots_p4`（録画元のセッション・PR は各フォルダの `SOURCES.json`）。`python3 merge.py` で `shots/` にまとめ、`python3 make_spec.py` で `spec.js`（字幕・章・早送り）を作ります
- 撮り直し: `SHOTS=shots_pN PHASE=<phase> node capture.mjs`
  - 第 1 部: `wiki` → `wikiask` → `wanswer` → `wplan` → `wstart` → `wview` → `test` → `play` → `review2`
  - 第 2 部: `auto` → `autosave` → `slackpost` → `slackthread` → `threadscroll`
  - 第 3 部: `oncall` → `ocsave` → `slackpost`（`SLACK_CH=C0CKN6ZNE8M`）→ `slackthread`
  - 第 4 部: `sec1` → `secans` → `secwait` → `secdone` → `secfind` → `secdetail` → `secfix` → `secfix2`
- 補足: On-call のレスポンダーは、組織の Oncall セットアップ（Devin がシステムを学習、1〜2 時間）が終わるまで動きません。それより前のアラートはスキップされ、後から再実行されません
