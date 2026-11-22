# 02 Devin 機能紹介（7 部構成）

Devin の主な機能を 1 本で紹介する無音・日本語の動画です（約 9 分 44 秒）。各部の前に全画面の部カード、部の中の章は画面左下のラベルで区切り、画面上の独立した帯（UI に重ならない）に今の部・章と全 5 部の一覧を出します。

| 部 | 章 | 画面で見せること（実際の結果） |
|---|---|---|
| 第 1 部 基本的な使い方 | 1-1 DeepWiki → 1-2 Wiki と会話 → 1-3 プラン → 1-4 実装 → 1-5 テストと録画 → 1-6 Devin Review | Usagi-Bank の Wiki に質問し、プランからダークモードを実装（[Usagi-Bank PR #70](https://github.com/natt-cog/Usagi-Bank/pull/70)）。ブラウザテストの録画（7 件成功）と Devin Review（No Issues Found） |
| 第 2 部 Devin Review | 2-1 PR の分析を実行 → 2-2 見つかった不具合と自動修正 | usagi-ecommerce PR #3 で「PRを分析」を実行（結果は No Issues Found）。Usagi-Bank PR #69 では Devin Review が 4 件の不具合を見つけ、Devin が 4 件とも自動で修正 |
| 第 3 部 Automations | 3-1 Automation の作成 → 3-2 Slack で不具合報告 → 3-3 調査結果と修正 PR | `#usagi-bugs` への投稿をきっかけに Devin が再現・原因調査し、スレッドに返信して [usagi-ecommerce PR #3](https://github.com/natt-cog/usagi-ecommerce/pull/3) を作成 |
| 第 4 部 Devin On-call | 4-1 レスポンダーの作成 → 4-2 アラートの調査 → 4-3 グループ化とイシュー → 4-4 レポート | `#usagi-alerts` のテスト用アラートを Devin が調査し、スレッドに「影響なし（低）」と根拠・確信度・次の対応を返信（別件の /checkout 500 も再現）。同じアラートの再投稿は前回と同じと判断し、1 件のイシュー（発生 2 回）にまとめる。定期レポートは設定画面の紹介のみ |
| 第 5 部 Devin Security | 5-1 脅威モデルとスキャン → 5-2 指摘の確認 → 5-3 Devinで修正 | usagi-ecommerce の脅威モデルを作ってスキャン（未対応 15 件）。SQL インジェクションを「Devinで修正」し [usagi-ecommerce PR #2](https://github.com/natt-cog/usagi-ecommerce/pull/2)（CI 成功） |
| 第 6 部 Devin Apps | 6-1 アプリを依頼 → 6-2 公開と更新 → 6-3 アプリを使う | usagi-ecommerce のデータで売上ダッシュボード（Usagi Analytics）を作成し、デモ注文を追加して v2 に更新、共有 URL で絞り込み |
| 第 7 部 Devin Bots | 7-1 Bot を作る → 7-2 仕事を任せる → 7-3 PR への報告 | テンプレート QA Engineer で Bot を作成し、[usagi-ecommerce PR #3](https://github.com/natt-cog/usagi-ecommerce/pull/3) をブラウザで確認（すべて合格）、結果と録画を PR にコメント |

- `02-devin-feature-tour.mp4`: 3840×2160・60fps・音声なし / `02-devin-feature-tour-1080p.mp4`: 1920×1080
- 素材は部ごとに `shots_p1`〜`shots_p4`（録画元のセッション・PR は各フォルダの `SOURCES.json`）。`python3 merge.py` で `shots/` にまとめ、`python3 make_spec.py` で `spec.js`（字幕・章・早送り）を作ります
- 撮り直し: `SHOTS=shots_pN PHASE=<phase> node capture.mjs`
  - 第 1 部: `wiki` → `wikiask` → `wanswer` → `wplan` → `wstart` → `wview` → `test` → `play` → `review2`
  - 第 2 部（`shots_p1_r`・`shots_p1_r2`）: `rvanalyze` → `rvwait` → `rv3disc`（PR #3）、`rv69`（PR #69）
  - 第 3 部: `auto` → `autosave` → `slackpost` → `slackthread` → `threadscroll`
  - 第 4 部: `oncall` → `ocsave` → `slackpost`（`SLACK_CH=C0CKN6ZNE8M`）→ `slackthread`
  - 第 5 部: `sec1` → `secans` → `secwait` → `secdone` → `secfind` → `secdetail` → `secfix` → `secfix2`
  - 第 6 部: `app1`（shots_p5）→ `app2`（shots_p5_b）→ `app3`（shots_p5_c）
  - 第 7 部: `bot1`（shots_p6）→ `bot2`（shots_p6_b）→ `bot3`（shots_p6_c）→ `bot4`（shots_p6_d）
- 補足: On-call のレスポンダーは、組織の Oncall セットアップ（Devin がシステムを学習、1〜2 時間）が終わるまで動きません。それより前のアラートはスキップされ、後から再実行されません
