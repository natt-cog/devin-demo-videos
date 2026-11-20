# Devin デモ動画（日本のお客様向け）

日本の企業のお客様に Devin の機能を見せるための動画を作るリポジトリです。

- 字幕・章タイトルなど画面上の文字はすべて日本語（フォントは Noto Sans JP）
- 音声なし（ナレーション・BGM・効果音なし）。MP4 に音声トラックは入れません
- 実際の Devin の画面を毎回新しく録画し、待ち時間は早送りして見やすく編集します
- 機能が切り替わるところに章カード（番号・機能名・説明・全体の中の位置）を入れます

## フォルダ構成

| パス | 内容 |
|---|---|
| `videos/_kit/` | 録画・描画・書き出しの共通キット（[dabit3/devin-tutorials](https://github.com/dabit3/devin-tutorials) の `tutorials/_kit/` を元に日本語・無音向けに調整） |
| `videos/<NN>-<slug>/` | 動画 1 本ぶん（`capture.mjs`・`shots/`・`spec.js`・MP4・`poster.png`・`README.md`） |
| `skills/` | 動画を作る手順（Devin スキル）。概要動画用と機能チュートリアル用 |

## キットの変更点（元のキットとの違い）

| 項目 | 内容 |
|---|---|
| 日本語フォント | `fonts/NotoSansJP-VF.ttf`（OFL）を読み込み、すべての文字に Noto Sans JP をフォールバック指定 |
| 字幕の表示時間 | 日本語は 1 秒あたり約 8 文字で最低表示時間を計算 |
| タイトル | 日本語タイトルは単語分割せず、横幅に収まるよう自動縮小 |
| 章カード | `beats.json` / `spec.js` の `chapter: {title, sub, short, no, hold}` で、画面を縮小→章カード→次の画面を拡大する転換を挿入 |
| 書き出し | `build.sh` は既定で無音。`<name>.mp4`（4K60）と `<name>-1080p.mp4` を出力。`SILENT=0` で元の効果音つきに戻せます |
| 削除 | ナレーション用の `vo.py`・`vo_onetake.py`・`settings.json` |

## 使い方

```sh
cd videos/_kit/tools && npm install
cd ../..                                   # videos/
node _kit/tools/render.mjs <folder> --count                       # 総フレーム数
node _kit/tools/render.mjs <folder> --frames 120,600 --out build/fix   # 静止画で確認
bash _kit/tools/build.sh <folder>                                 # 4K60 + 1080p（無音）
ffprobe -v error -show_entries stream=codec_type -of csv=p=0 <folder>/<folder>.mp4   # "video" だけなら OK
```

章カードの例（`spec.js` の `edit` に書く場合）:

```js
"0012.png": { "chapter": { "title": "ブラウザでテストして録画", "sub": "変更した画面を Devin が自分で操作して確認します", "short": "テスト" } }
```

録画（CDP で Chrome を操作）と編集の詳しいルールは `skills/` を参照してください。
