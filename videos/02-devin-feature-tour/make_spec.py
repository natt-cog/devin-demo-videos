#!/usr/bin/env python3
"""Generate spec.js. Keys are merged image names (p<N>-<NNNN>.png, see merge.py)."""
import json, os
E = {}
def k(p, i): return f"p{p}-{i:04d}.png"
def at(p, i, **kw): E.setdefault(k(p, i), {}).update(kw)
def rng(p, a, b, **kw):
    for i in range(a, b + 1): at(p, i, **kw)
def skip(p, a, b): rng(p, a, b, skip=True)
def ff(p, a, b, cap):  # fast-forwarded wait
    rng(p, a, b, badge='早送り', cap=cap); at(p, b + 1, badge='')
PARTS = [
    ('第 1 部', '基本的な使い方', 'これから、Devin に開発を依頼する基本の流れを説明します'),
    ('第 2 部', 'Automations', 'これから、イベントをきっかけに Devin を自動で動かす方法を説明します'),
    ('第 3 部', 'Devin On-call', 'これから、アラートを Devin に調査させる方法を説明します'),
    ('第 4 部', 'Devin Security', 'これから、脆弱性の検出と修正を説明します'),
]
def part(n, p, i):
    no, title, sub = PARTS[n - 1]
    at(p, i, chapter={'no': no, 'title': title, 'sub': sub, 'short': title})
def sec(p, i, no, title): at(p, i, sec={'no': no, 'title': title})

# ---- 第 1 部 基本的な使い方 (shots_p1) ----
part(1, 1, 0); sec(1, 0, '1-1', 'DeepWiki')
at(1, 0, cap='DeepWiki は、リポジトリから Wiki を自動で作ります', hold=2.2)
at(1, 3, cap='左側に、システム全体を章立てにしたページ一覧があります')
at(1, 12, cap='構成図も自動で描かれます', hold=2.0)
at(1, 15, cap='Web 画面のページを開くと、関連するソースファイルも一緒に示されます', hold=2.0)
sec(1, 31, '1-2', 'Wiki と会話')
at(1, 31, cap='Wiki の入力欄から、そのまま質問できます')
at(1, 33, cap='「ダークモードを追加するには、どのファイルを変えればよいか」を質問', hold=2.2)
skip(1, 34, 35)
ff(1, 36, 38, 'Devin がコードを読んで回答を作成')
skip(1, 40, 53)
at(1, 39, cap='変更が必要なファイルを、コードの根拠付きで回答', hold=2.4)
at(1, 54, cap='右側には、根拠になったコードがそのまま表示されます', hold=2.0)
sec(1, 66, '1-3', 'プラン')
at(1, 66, cap='「Devinプロンプトを構築」で、会話から作業プランを作ります')
at(1, 68, cap='対象ファイルと変更内容をまとめたプランができました（Devin の出力は英語）', hold=2.6)
at(1, 69, cap='プランを確認して、Devin セッションを開始', hold=2.0)
skip(1, 73, 75)
sec(1, 76, '1-4', '実装')
ff(1, 76, 102, 'Devin が実装し、テストを実行中')
at(1, 103, cap='ダークモードを実装して PR を作成。テストは 39 件すべて成功', hold=2.6)
sec(1, 104, '1-5', 'テストと録画')
at(1, 104, cap='Devin に、ブラウザでの動作確認と録画を依頼します')
ff(1, 107, 150, 'Devin がアプリを起動し、ブラウザで画面を操作して確認中')
at(1, 153, cap='テストの録画が上がりました。7 件すべて成功', hold=2.2)
at(1, 156, cap='録画には、ライトとダークを切り替えて各画面を確認する様子が映っています', hold=2.0)
rng(1, 157, 186, cap='チャプターごとに、確認した内容と結果が並びます')
sec(1, 188, '1-6', 'Devin Review')
at(1, 188, cap='PR には、Devin Review が自動でレビューを行います', hold=2.0)
at(1, 191, cap='今回のレビュー結果は「No Issues Found」（指摘なし）', hold=2.8)
at(1, 222, cap='ブラウザでの確認結果も PR に記録されています', hold=2.0)

# ---- 第 2 部 Automations (shots_p2) ----
part(2, 2, 0); sec(2, 0, '2-1', 'Automation の作成')
at(2, 0, cap='Automations では、イベントをきっかけに Devin を自動で動かせます', hold=2.2)
at(2, 2, cap='よく使う流れはテンプレートも用意されています（例：バグ報告をトリアージ）', hold=2.0)
at(2, 6, cap='今回は手動で作成します')
at(2, 10, cap='名前を入力し、トリガーに Slack のメッセージを追加')
at(2, 30, cap='#usagi-bugs に投稿されたら、スレッドに返信する設定です', hold=2.4)
at(2, 31, cap='Devin への指示：不具合を再現し、原因と修正 PR をスレッドに返す')
at(2, 69, cap='トリガーと指示の設定ができました', hold=1.8)
at(2, 74, cap='Automation を作成しました。すぐに有効になります', hold=2.2)
sec(2, 75, '2-2', 'Slack で不具合報告')
at(2, 75, cap='Slack の #usagi-bugs に、テスト用の不具合報告を投稿します')
ff(2, 97, 101, 'Automation が起動し、Devin が調査中')
sec(2, 102, '2-3', '調査結果と修正 PR')
at(2, 102, cap='Devin がスレッドに返信。修正 PR（usagi-ecommerce #3）も作成されています', hold=2.8)
skip(2, 105, 109)
at(2, 110, cap='報告どおり再現し、合計 ¥-480 の注文が保存されることを確認', hold=2.6)
rng(2, 111, 130, cap='原因のコード行、修正内容、追加したテストまで報告されます')
at(2, 131, cap='Slack に報告するだけで、調査から修正 PR まで自動で進みます', hold=2.8)

# ---- 第 3 部 Devin On-call (shots_p3) ----
P3 = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'shots_p3', 'beats.json')
if os.path.exists(P3) and not os.environ.get('P3_READY'):
    skip(3, 0, len(json.load(open(P3))) - 1)

# ---- 第 4 部 Devin Security (shots_p4) ----
part(4, 4, 0); sec(4, 0, '4-1', '脅威モデルとスキャン')
at(4, 0, cap='Security から新しいスキャンを始めます', hold=2.0)
at(4, 2, cap='通常スキャンを選び、対象に usagi-ecommerce を選択')
at(4, 14, cap='「Devinで続行」で、Devin と脅威モデルを作ります')
ff(4, 15, 39, 'Devin がコードを読み、脅威モデルを準備中')
at(4, 40, cap='Devin が、動かす環境や重要な資産などを質問します', hold=2.2)
skip(4, 80, 82)
at(4, 102, cap='回答をもとに脅威モデルを確定し、スキャンを開始', hold=2.0)
ff(4, 104, 144, 'スキャン中（約 10 分を短縮）')
at(4, 145, cap='スキャン完了。脅威モデルは threat_model.md にまとまります', hold=2.4)
sec(4, 146, '4-2', '指摘の確認')
at(4, 146, cap='見つかった指摘は 15 件。重大度ごとに一覧で確認できます', hold=2.4)
at(4, 149, cap='どれも「静的解析で検証済み」です', hold=2.0)
at(4, 152, cap='指摘の詳細：商品検索の SQL インジェクション。攻撃の条件と影響が説明されます', hold=2.8)
sec(4, 153, '4-3', 'Devinで修正')
at(4, 153, cap='「Devinで修正」から、修正を Devin に任せます')
at(4, 158, cap='修正用のセッションが始まりました')
ff(4, 159, 173, 'Devin が修正し、回帰テストを追加中')
at(4, 174, cap='SQL をプレースホルダ化して PR を作成。CI も成功しました', hold=3.0)

spec = {
    'title': 'Devin 機能紹介', 'subtitle': '基本的な使い方・Automations・On-call・Security',
    'outro': 'Devin で、開発から運用・セキュリティまで', 'outroSub': 'docs.devin.ai',
    'speed': 4, 'cps': 48, 'maxZoom': 1.4, 'capArrows': False, 'pollRunMax': 1.6,
    'chapterHold': 3.0, 'introHold': 2.4, 'edit': E,
}
open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'spec.js'), 'w').write('window.SPEC = ' + json.dumps(spec, ensure_ascii=False, indent=1) + ';\n')
print('edits', len(E))
