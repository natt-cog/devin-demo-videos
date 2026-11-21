// Live capture: Devin feature tour (Part 1 basic flow on Usagi-Bank; later parts appended with RESUME=1).
//   ZOOM=1.25 MASK_TEXT=<email name> PHASE=ask node capture.mjs           (Ask mode, pick Usagi-Bank, ask about UBEOD001.cbl, wait for the answer)
//   ZOOM=1.25 MASK_TEXT=<email name> RESUME=1 SESSION=<url> PHASE=cite node capture.mjs   (scroll the answer, open a code citation)
import { Rec, sleep } from '../_kit/capture/rec.mjs';
import { clearComposer, closeMenus, mentionRepo, editorBox } from '../_kit/capture/composer.mjs';

const ORG = process.env.DEVIN_ORG_URL || 'https://natt.devinenterprise.com/org/natt-org';
const PHASE = process.env.PHASE || 'ask';
const TASK = process.env.TASK || 'batch/cobol/UBEOD001.cbl（日次利息積数計算）を Java に移行してください。batch/cobol/expected のゴールデンファイルと 1 バイト単位で同じ出力になることをテストで確認し、PR を作成してください。';
const TEST = process.env.TEST || 'ありがとうございます。次に、アプリを起動して Java 版バッチで日次利息計算を実行・取り込みし、ブラウザで口座照会画面を開いて未払利息が更新されていることを確認してください。ブラウザ操作は録画して見せてください。';
const QUESTION = process.env.QUESTION || 'batch/cobol/UBEOD001.cbl はどんな処理をしていますか？入力・出力ファイルと利息計算の流れを教えてください。';

const r = await new Rec(process.env.SHOTS || 'shots').init();
const p = r.p;
const main = () => p.evaluate(() => document.querySelector('main')?.innerText || '');
const boxOf = (sel, pick = 'last') => p.evaluate(([sel, pick]) => {
  const els = [...document.querySelectorAll(sel)].filter(e => { const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0; });
  const e = pick === 'first' ? els[0] : els.pop(); if (!e) return null;
  const b = e.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2, w: b.width, h: b.height };
}, [sel, pick]);
const DISMISS = /^(Dismiss notification|通知を閉じる|通知を消去)$/;
const COLLAPSE = /^(Collapse sidebar|サイドバーを折りたたむ|サイドバーを閉じる)$/;
const ariaBox = re => p.evaluate(src => { const re = new RegExp(src); const e = [...document.querySelectorAll('button')].find(b => re.test(b.getAttribute('aria-label') || '') && b.getBoundingClientRect().width > 0 && b.getBoundingClientRect().x >= 0); if (!e) return null; const b = e.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2, w: b.width, h: b.height }; }, re.source);
async function tidy() {
  for (let i = 0; i < 5; i++) { const b = await ariaBox(DISMISS); if (!b) break; await p.mouse.click(b.x, b.y); await sleep(700); }
  const c = await ariaBox(COLLAPSE); if (c) { await p.mouse.click(c.x, c.y); await sleep(900); }
  await p.evaluate(() => getSelection().removeAllRanges());
  await p.mouse.move(r.cur.x, r.cur.y);
}
const inDialog = (re) => p.evaluate(src => { const re = new RegExp(src); const d = [...document.querySelectorAll('[role=dialog]')].find(d => d.getBoundingClientRect().width > 0); if (!d) return null; const e = [...d.querySelectorAll('button')].find(b => re.test(b.innerText.trim()) && b.getBoundingClientRect().width > 0); if (!e) return null; const b = e.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2, w: b.width, h: b.height }; }, re.source);
async function setMode(label) {
  const mode = { attr: ['aria-label', 'モードを切り替え'], sel: 'main button' };
  await r.click(mode, { pre: { hlBox: await r.find(mode) }, wait: 1000 });
  await r.shot({ hold: 1.2 });
  await r.click({ text: label, sel: '[role=menu] *, [role=menuitemradio], [data-radix-popper-content-wrapper] *' }, { wait: 1200 });
  await closeMenus(p); await sleep(600);
}
async function pickRepo(name) {
  const btn = await p.evaluate(() => { const e = [...document.querySelectorAll('main button')].find(b => /リポジトリ|natt-cog\//.test(b.innerText) && b.getBoundingClientRect().width > 0); if (!e) return null; const b = e.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2, w: b.width, h: b.height }; });
  if (!btn) throw new Error('no repo button');
  await r.click(btn, { wait: 1500 });
  const search = await r.box('input[placeholder^="リポジトリを検索"]');
  await p.mouse.click(search.x, search.y); r.cur = { x: search.x, y: search.y }; await sleep(300);
  await r.type(name, { every: 3 });
  await sleep(1200);
  let row = null;
  for (let i = 0; i < 10 && !row; i++) { row = await r.find({ text: name, exact: false, sel: '[role=dialog] [role=button]' }); if (!row) await sleep(800); }
  if (!row) throw new Error(name + ' row not found');
  await r.move(row); await sleep(700);
  const only = await p.evaluate(y => {
    const els = [...document.querySelectorAll('[role=dialog] button, [role=dialog] span')].filter(e => /^(Only|のみ)$/.test((e.innerText || '').trim()) && e.getBoundingClientRect().width > 0);
    els.sort((a, b) => Math.abs(a.getBoundingClientRect().y - y) - Math.abs(b.getBoundingClientRect().y - y));
    const e = els[0]; if (!e) return null; const b = e.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2, w: b.width, h: b.height };
  }, row.y);
  if (only) await r.click(only, { pre: { hlBox: row }, wait: 900 });
  await r.shot({ hold: 1.2, mark: 'repo' });
  const confirm = await inDialog(/件のリポジトリを選択|^Select \d+ repositor/);
  if (!confirm) throw new Error('no confirm button');
  await r.click(confirm, { wait: 1200 });
}
async function sendPrompt(text, mark) {
  await p.evaluate(() => { const e = document.querySelector('main [contenteditable=true]'); e.focus(); const s = getSelection(); s.selectAllChildren(e); s.collapseToEnd(); });
  await r.paste(text, { hold: 0 });
  await sleep(600);
  r.mark(mark, { paste: true });
  await r.shot({ hold: 1.4, hlBox: await boxOf('main [contenteditable=true]') });
  const send = await ariaBox(/^(今すぐ送信|送信|Send|Send now)$/);
  if (send) { await r.move(send); await r.shot({ kind: 'hover', hold: 0.5 }); await p.mouse.click(r.cur.x, r.cur.y); }
  else { console.log('no send button; pressing Enter'); await p.keyboard.press('Enter'); }
}
const keep = async () => { await tidy(); return true; };
const scrollChat = () => p.evaluate(() => {
  const els = [...document.querySelectorAll('main *')].filter(e => e.scrollHeight > e.clientHeight + 40 && /auto|scroll/.test(getComputedStyle(e).overflowY) && e.getBoundingClientRect().width > 300);
  els.sort((a, b) => a.getBoundingClientRect().x - b.getBoundingClientRect().x);
  if (els[0]) els[0].scrollTop = els[0].scrollHeight;
});
const session = async () => { if (process.env.SESSION) await r.goto(process.env.SESSION, 5000); await tidy(); };

if (PHASE === 'ask') {
  await r.goto(ORG, 4000);
  await closeMenus(p); await clearComposer(p); await sleep(400);
  await tidy();
  await p.mouse.move(576, 520); r.cur = { x: 576, y: 520 };
  await r.shot({ hold: 1.0 });
  await setMode('Ask');
  await r.shot({ hold: 0.8, mark: 'askmode' });
  await pickRepo('Usagi-Bank');
  await sendPrompt(QUESTION, 'asked');
  await sleep(4000); await tidy();
  r.mark('sent');
  console.log('SESSION', await p.evaluate(() => location.href));
  let last = '', same = 0;
  await r.poll(Number(process.env.WAIT || 400000), 3000, { cap: null, keep }, async () => {
    const t = await main(); same = t === last && t.length > 800 ? same + 1 : 0; last = t; return same >= 4;
  });
  r.mark('answered');
  console.log('SESSION', await p.evaluate(() => location.href));
  console.log((await main()).slice(0, 4000));
}

if (PHASE === 'cite') {
  await session();
  await p.mouse.move(1000, 300); r.cur = { x: 1000, y: 300 };
  await r.shot({ hold: 1.2, mark: 'answer' });
  const scroller = () => p.evaluate(dy => {
    const els = [...document.querySelectorAll('main *')].filter(e => e.scrollHeight > e.clientHeight + 40 && /auto|scroll/.test(getComputedStyle(e).overflowY) && e.getBoundingClientRect().width > 300);
    els.sort((a, b) => b.clientHeight - a.clientHeight); const e = els[0]; if (!e) return false;
    const before = e.scrollTop; e.scrollTop += dy; return e.scrollTop !== before;
  }, 90);
  for (let i = 0; i < 40; i++) { if (!(await scroller())) break; await sleep(120); await r.shot({ kind: 'poll', scroll: true }); }
  await sleep(600); await r.shot({ hold: 1.0, mark: 'bottom' });
  const cites = await p.evaluate(() => [...document.querySelectorAll('main a, main button, main span')].filter(e => /^UBEOD001\.cbl:\d+/.test((e.innerText || '').trim()) && e.getBoundingClientRect().width > 0 && e.getBoundingClientRect().y > 60 && e.getBoundingClientRect().y < innerHeight - 160).map(e => { const b = e.getBoundingClientRect(); return { t: e.innerText.trim(), x: b.x + b.width / 2, y: b.y + b.height / 2, w: b.width, h: b.height }; }));
  console.log('CITES', JSON.stringify(cites.map(c => c.t)));
  const want = process.env.CITE;
  const c = cites.find(c => want ? c.t.includes(want) : /:1[3-6]\d/.test(c.t)) || cites[0];
  if (!c) throw new Error('no citation');
  await r.click(c, { pre: { hlBox: c }, wait: 2500 });
  await p.mouse.move(r.cur.x, r.cur.y); await sleep(1500);
  await r.shot({ hold: 2.5, mark: 'code' });
  console.log((await main()).slice(0, 1500));
}

if (PHASE === 'migrate') {
  await r.goto(ORG, 4000);
  await closeMenus(p); await clearComposer(p); await sleep(400);
  await tidy();
  await p.mouse.move(576, 520); r.cur = { x: 576, y: 520 };
  await r.shot({ hold: 1.0 });
  await setMode('エージェント');
  await r.shot({ hold: 0.8, mark: 'agentmode' });
  const ed = await editorBox(p);
  await r.click(ed, { wait: 400 });
  await mentionRepo(r, 'Usagi-Bank', 'Usagi-Bank');
  await sendPrompt(' の ' + TASK, 'asked');
  await sleep(6000); await tidy();
  r.mark('session');
  console.log('SESSION', await p.evaluate(() => location.href));
}
if (PHASE === 'work') {
  await session();
  const pr = () => p.evaluate(() => [...document.querySelectorAll('main a, main button')].some(e => /PR #\d+|pull\/\d+/.test((e.innerText || '') + (e.getAttribute('href') || '')) && e.getBoundingClientRect().width > 0));
  let t0 = Date.now(), last = '', same = 0;
  await r.poll(Number(process.env.WAIT || 5400000), 10000, { cap: null, keep }, async () => { await scrollChat(); if (Date.now() - t0 > 300000) { t0 = Date.now(); console.log('still working', new Date().toISOString(), (await main()).slice(-300).replace(/\n/g, ' ')); } const t = await main(); same = t === last ? same + 1 : 0; last = t; return (await pr()) && same >= 6; });
  await sleep(4000); await tidy(); await scrollChat();
  await r.shot({ hold: 2.0, mark: 'pr' });
  console.log('SESSION', await p.evaluate(() => location.href));
  console.log((await main()).slice(-3000));
}

if (PHASE === 'test') {
  await session(); await scrollChat(); await sleep(800);
  await r.shot({ hold: 1.0, mark: 'pre-test' });
  if (process.env.REC_BTN) {
    const btn = await r.find({ text: process.env.REC_BTN, sel: 'main button' });
    if (!btn) throw new Error('no record button');
    await r.click(btn, { pre: { hlBox: btn }, wait: 2500 }); r.mark('test-asked');
  } else {
    const ed = await boxOf('main [contenteditable=true]');
    await r.click(ed, { wait: 400 });
    await sendPrompt(TEST, 'test-asked');
  }
  await sleep(5000); await tidy();
  let t0 = Date.now(), last = '', same = 0;
  const hasVideo = () => p.evaluate(() => [...document.querySelectorAll('main video')].some(v => v.getBoundingClientRect().width > 0) || /録画|recording/i.test([...document.querySelectorAll('main a, main button')].map(e => e.innerText).join(' ')));
  await r.poll(Number(process.env.WAIT || 5400000), 10000, { cap: null, keep }, async () => { await scrollChat(); if (Date.now() - t0 > 300000) { t0 = Date.now(); console.log('still testing', new Date().toISOString(), (await main()).slice(-300).replace(/\n/g, ' ')); } const t = await main(); same = t === last ? same + 1 : 0; last = t; return (await hasVideo()) && same >= 6; });
  await sleep(3000); await tidy(); await scrollChat();
  await r.shot({ hold: 2.0, mark: 'tested' });
  console.log((await main()).slice(-3000));
}

const scrollIntoMid = sel => p.evaluate(sel => { const e = [...document.querySelectorAll(sel)].pop(); if (!e) return false; e.scrollIntoView({ block: 'center' }); return true; }, sel);
if (PHASE === 'play') {
  await session(); await sleep(1500);
  await scrollChat(); await sleep(800);
  await r.shot({ hold: 1.2, mark: 'tested' });
  const title = process.env.REC_TITLE || 'Java日次利息の取り込み確認';
  await p.evaluate(t => { const e = [...document.querySelectorAll('main button')].find(b => b.innerText.includes(t)); e.scrollIntoView({ block: 'center', behavior: 'smooth' }); }, title);
  await sleep(1500);
  await r.shot({ hold: 1.2, mark: 'reccard' });
  const card = await r.find({ text: title, exact: false, sel: 'main button' });
  await r.click(card, { pre: { hlBox: card }, wait: 2500 });
  await r.shot({ hold: 1.0, mark: 'recopen' });
  const v = await p.evaluate(() => { const vs = [...document.querySelectorAll('video')].filter(v => v.getBoundingClientRect().width > 400); const v = vs.pop(); if (!v) return null; v.muted = true; v.currentTime = 0; v.play(); const b = v.getBoundingClientRect(); return { w: b.width, d: v.duration }; });
  console.log('VIDEO', JSON.stringify(v));
  const n = Number(process.env.PLAY_SHOTS || 24);
  for (let i = 0; i < n; i++) { await sleep(1000); await r.shot({ kind: 'poll' }); }
  await p.evaluate(() => { const v = [...document.querySelectorAll('video')].filter(v => v.getBoundingClientRect().width > 400).pop(); if (v) { v.pause(); v.currentTime = Math.max(0, v.duration - 0.5); } });
  await sleep(1200);
  await r.shot({ hold: 2.0, mark: 'recend' });
  await p.keyboard.press('Escape'); await sleep(800);
}
if (PHASE === 'review') {
  const url = process.env.REVIEW_URL || 'https://natt.devinenterprise.com/review/natt-cog/usagi-bank/pull/69';
  await r.goto(url, 6000); await tidy();
  await p.mouse.move(1100, 300); r.cur = { x: 1100, y: 300 };
  await r.shot({ hold: 2.0, mark: 'review' });
  const tab = await r.find({ text: 'ディスカッション', exact: false, sel: 'main button, main [role=tab]' });
  await r.click(tab, { pre: { hlBox: tab }, wait: 2500 });
  await p.evaluate(() => { const e = [...document.querySelectorAll('main summary')].find(s => /Fixed by Devin/.test(s.innerText)); e.closest('div').scrollIntoView({ block: 'start', behavior: 'smooth' }); });
  await sleep(1500);
  await r.shot({ hold: 2.2, mark: 'reviewcomment' });
  const sum = await r.find({ text: 'Fixed by Devin', exact: false, sel: 'main summary' });
  await r.click(sum, { pre: { hlBox: sum }, wait: 1500 });
  await p.evaluate(() => { const e = [...document.querySelectorAll('main summary')].find(s => /Fixed by Devin/.test(s.innerText)); e.scrollIntoView({ block: 'start', behavior: 'smooth' }); });
  await sleep(1500);
  await p.mouse.move(1250, 200); r.cur = { x: 1250, y: 200 };
  await r.shot({ hold: 3.0, mark: 'fixed' });
}

const WIKI = process.env.WIKI || ORG + '/wiki/natt-cog/Usagi-Bank';
const WQ = process.env.WQ || 'Web 画面にダークモード（ライト / ダークの切り替え）を追加したいです。どのファイルをどう変更すればよいですか？';
const wikiScroll = dy => p.evaluate(dy => {
  const els = [...document.querySelectorAll('main *')].filter(e => e.scrollHeight > e.clientHeight + 40 && /auto|scroll/.test(getComputedStyle(e).overflowY) && e.getBoundingClientRect().width > 500);
  els.sort((a, b) => b.clientHeight - a.clientHeight); const e = els[0]; if (!e) return false;
  const before = e.scrollTop; e.scrollTop += dy; return e.scrollTop !== before;
}, dy);
async function wikiTidy() {
  for (let i = 0; i < 5; i++) { const b = await ariaBox(DISMISS); if (!b) break; await p.mouse.click(b.x, b.y); await sleep(700); }
  const e = await ariaBox(/^(サイドバーを展開|Expand sidebar)$/); if (e) { await p.mouse.click(e.x, e.y); await sleep(1200); }
  await p.evaluate(() => getSelection().removeAllRanges());
}
const diagramTop = () => p.evaluate(() => { const s = [...document.querySelectorAll('main svg')].find(s => s.getBoundingClientRect().width > 300); return s ? s.getBoundingClientRect().top : null; });
if (PHASE === 'wiki') {
  await r.goto(WIKI, 6000); await wikiTidy();
  await p.mouse.move(820, 300); r.cur = { x: 820, y: 300 };
  await r.shot({ hold: 2.0, mark: 'wiki' });
  const tree = await r.find({ text: 'ドメインモデルと永続化層', sel: 'a' });
  if (tree) await r.point(tree, { hold: 1.8, hlBox: { x: 180, y: 330, w: 250, h: 420 } });
  for (let i = 0; i < 40; i++) { const t = await diagramTop(); if (t != null && t < 120) break; if (!(await wikiScroll(60))) break; await sleep(120); await r.shot({ kind: 'poll', scroll: true }); }
  await sleep(500); await r.shot({ hold: 2.0, mark: 'wikidiagram' });
  const page = await r.find({ text: process.env.WIKI_PAGE || 'Web UI (Spring MVC + JSP)', sel: 'a' });
  if (!page) throw new Error('wiki page link not found');
  await r.click(page, { pre: { hlBox: page }, wait: 4000 });
  await p.mouse.move(820, 300); r.cur = { x: 820, y: 300 };
  await r.shot({ hold: 1.8, mark: 'wikipage' });
  for (let i = 0; i < 14; i++) { if (!(await wikiScroll(60))) break; await sleep(120); await r.shot({ kind: 'poll', scroll: true }); }
  await sleep(500); await r.shot({ hold: 1.4 });
  console.log(await p.evaluate(() => location.href)); console.log((await main()).slice(0, 800));
}
if (PHASE === 'wanswer') {
  await tidy(); await p.mouse.move(1000, 300); r.cur = { x: 1000, y: 300 };
  r.mark('newtab');
  let last = '', same = 0;
  await r.poll(Number(process.env.WAIT || 400000), 3000, { cap: null, keep }, async () => {
    const t = await main(); same = t === last && !/作業中/.test(t.slice(0, 600)) ? same + 1 : 0; last = t; return same >= 3;
  });
  r.mark('wanswer');
  console.log('SESSION', await p.evaluate(() => location.href));
  console.log((await main()).slice(0, 5000));
}
if (PHASE === 'wplan') {
  await tidy(); await p.mouse.move(1000, 300); r.cur = { x: 1000, y: 300 };
  await r.shot({ hold: 2.2, mark: 'wtop' });
  const files = await r.find({ text: 'header.jspf', exact: false, sel: 'main button, main a, main div' });
  if (files) await r.point(files, { hold: 1.6, hlBox: files });
  const scroller = () => p.evaluate(dy => {
    const els = [...document.querySelectorAll('main *')].filter(e => e.scrollHeight > e.clientHeight + 40 && /auto|scroll/.test(getComputedStyle(e).overflowY) && e.getBoundingClientRect().width > 300 && e.getBoundingClientRect().x < 300);
    els.sort((a, b) => b.clientHeight - a.clientHeight); const e = els[0]; if (!e) return false;
    const before = e.scrollTop; e.scrollTop += dy; return e.scrollTop !== before;
  }, 70);
  for (let i = 0; i < 40; i++) { if (!(await scroller())) break; await sleep(120); await r.shot({ kind: 'poll', scroll: true }); }
  await sleep(600); await r.shot({ hold: 1.6, mark: 'wbottom' });
  const build = await r.find({ text: 'Devinプロンプトを構築', sel: 'main button' });
  if (!build) throw new Error('no build-prompt button');
  await r.click(build, { pre: { hlBox: build }, wait: 6000 });
  await r.shot({ hold: 1.6, mark: 'wplan' });
  console.log('URL', await p.evaluate(() => location.href));
  console.log(await p.evaluate(() => [...document.querySelectorAll('[role=dialog]')].filter(d => !/プロンプト付きでセッションを開始/.test(d.innerText)).map(d => d.innerText.slice(0, 3000)).join('\n||\n')));
  console.log('MAIN', (await main()).slice(-2500));
}
if (PHASE === 'wstart') {
  await tidy();
  await p.evaluate(() => { const b = [...document.querySelectorAll('main button')].find(b => b.innerText.trim() === 'Devin セッションを開始'); b.scrollIntoView({ block: 'center' }); });
  await sleep(1500); await p.mouse.move(400, 300); r.cur = { x: 400, y: 300 };
  if (!process.env.NO_PLANSHOT) await r.shot({ hold: 2.4, mark: 'plancard' });
  const go = await r.find({ text: 'Devin セッションを開始', sel: 'main button' });
  console.log('GO', JSON.stringify(go));
  await r.click(go, { pre: { hlBox: go }, wait: 8000 });
  console.log('TABS', (await (await fetch('http://127.0.0.1:9333/json/list')).json()).filter(x => x.type === 'page').map(x => x.url).join(' '));
  await tidy(); await sleep(1500);
  await r.shot({ hold: 1.6, mark: 'session' });
  console.log('SESSION', await p.evaluate(() => location.href));
  console.log((await main()).slice(0, 1500));
}
if (PHASE === 'wview') {
  const v = await r.find({ text: 'セッションを表示', sel: 'main button, main a' });
  await r.point(v, { hold: 1.4, hlBox: { x: v.x - 140, y: v.y + 15, w: 420, h: 90 } });
  await r.click(v, { wait: 7000 });
  console.log('TABS', (await (await fetch('http://127.0.0.1:9333/json/list')).json()).filter(x => x.type === 'page').map(x => x.url).join(' '));
  console.log('SESSION', await p.evaluate(() => location.href));
}
if (PHASE === 'review2') {
  const url = process.env.REVIEW_URL || 'https://natt.devinenterprise.com/review/natt-cog/usagi-bank/pull/70';
  await r.goto(url, 7000); await tidy();
  await p.mouse.move(1000, 300); r.cur = { x: 1000, y: 300 };
  await r.shot({ hold: 2.4, mark: 'review' });
  const tab = await r.find({ text: 'ディスカッション', exact: false, sel: 'main button, main [role=tab]' });
  await r.click(tab, { pre: { hlBox: tab }, wait: 3000 });
  await p.mouse.move(1000, 300); r.cur = { x: 1000, y: 300 };
  await r.shot({ hold: 2.0, mark: 'discussion' });
  const sc = () => p.evaluate(dy => { const els = [...document.querySelectorAll('main *')].filter(e => e.scrollHeight > e.clientHeight + 40 && /auto|scroll/.test(getComputedStyle(e).overflowY) && e.getBoundingClientRect().width > 400); els.sort((a, b) => b.clientHeight - a.clientHeight); const e = els[0]; if (!e) return false; const b = e.scrollTop; e.scrollTop += dy; return e.scrollTop !== b; }, 70);
  for (let i = 0; i < 30; i++) { if (!(await sc())) break; await sleep(120); await r.shot({ kind: 'poll', scroll: true }); }
  await sleep(600); await r.shot({ hold: 2.4, mark: 'reviewend' });
  console.log((await main()).slice(0, 3500));
}
if (PHASE === 'sec1') {
  await r.goto(ORG + '/security/new', 6000); await tidy();
  await p.mouse.move(700, 250); r.cur = { x: 700, y: 250 };
  await r.shot({ hold: 2.0, mark: 'secnew' });
  const normal = await r.find({ text: '通常スキャン', exact: false, sel: 'main span' });
  if (normal) await r.click(normal, { pre: { hlBox: normal }, wait: 900 });
  const q = await r.box('main input[placeholder="リポジトリを検索"], main input[aria-label="リポジトリを検索"]');
  await r.click(q, { wait: 400 });
  await r.type('usagi-ecommerce', { every: 3 }); await sleep(1500);
  const row = await p.evaluate(() => { const tr = [...document.querySelectorAll('main tr, main [role=row]')].find(t => /natt-cog\/usagi-ecommerce/.test(t.innerText) && t.getBoundingClientRect().width > 0); if (!tr) return null; const c = [...tr.querySelectorAll('span,button,label,[role=checkbox]')].find(e => /行を選択/.test((e.innerText || '') + (e.getAttribute('aria-label') || '')) && e.getBoundingClientRect().width > 0) || tr; const b = c.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2, w: b.width, h: b.height }; });
  if (!row) throw new Error('ecommerce row not found');
  console.log('ROW', JSON.stringify(row));
  await r.click(row, { wait: 900 });
  await r.shot({ hold: 1.6, mark: 'secrepo' });
  if (/1 つ以上選択してください/.test(await main())) throw new Error('repo not selected');
  const go = await r.find({ text: 'Devinで続行', sel: 'main button' });
  await r.click(go, { pre: { hlBox: go }, wait: 8000 });
  await tidy();
  console.log('URL', await p.evaluate(() => location.href));
  let last = '', same = 0;
  await r.poll(Number(process.env.WAIT || 600000), 4000, { cap: null, keep }, async () => {
    const t = await main(); same = t === last && t.length > 400 ? same + 1 : 0; last = t; return same >= 4;
  });
  r.mark('threatq');
  console.log('URL', await p.evaluate(() => location.href));
  console.log((await main()).slice(-3500));
}
if (PHASE === 'secans') {
  await tidy();
  const pick = process.env.PICKS ? process.env.PICKS.split(',') : ['C', 'A', 'A', 'A', 'A', 'A'];
  for (let i = 0; i < 8; i++) {
    const t = await main(); const m = t.match(/(\d+) \/ (\d+)/); if (!m) break;
    const L = pick[Number(m[1]) - 1] || 'A';
    const after = t.slice(t.indexOf(m[0]) + m[0].length).split('\n').map(x => x.trim()).filter(Boolean);
    const optText = /^[A-Z]$/.test(L) ? null : L === '*' ? after[0] : L;
    const opt = optText ? await r.find({ text: optText, sel: 'main button, main label, main [role=option], main [role=checkbox], main div, main span' }) : await p.evaluate(L => { const els = [...document.querySelectorAll('main *')].filter(e => e.getBoundingClientRect().width > 100 && new RegExp('^' + L + '\\s').test((e.innerText || '').trim()) && (e.innerText || '').length < 120); const e = els.filter(e => !els.some(o => o !== e && e.contains(o) && o.getBoundingClientRect().width > 100)).pop() || els.pop(); if (!e) return null; const b = e.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2, w: b.width, h: b.height, t: e.innerText.trim().slice(0, 60) }; }, L);
    console.log('Q', m[0], (t.match(/\n([^\n]*？)\n/) || [])[1], '->', opt && opt.t);
    if (!opt) break;
    await r.shot({ hold: 1.4 });
    await r.click(opt, { pre: { hlBox: opt }, wait: 1000 });
    const next = await r.find({ text: '次へ', sel: 'main button' }) || await r.find({ text: '送信', sel: 'main button' });
    if (next) await r.click(next, { wait: 1500 });
    await sleep(800);
    if (!/(\d+) \/ (\d+)/.test(await main())) break;
  }
  r.mark('answered');
  let last = '', same = 0;
  await r.poll(Number(process.env.WAIT || 900000), 5000, { cap: null, keep }, async () => {
    const t = await main(); same = t === last ? same + 1 : 0; last = t; return same >= 4 || /承認|Approve|スキャンを開始/.test(t.slice(-1500));
  });
  r.mark('proposal');
  console.log((await main()).slice(-3000));
}
if (PHASE === 'secwait') {
  await tidy();
  const btns = () => p.evaluate(() => [...document.querySelectorAll('main button')].filter(b => b.getBoundingClientRect().width > 0).map(b => b.innerText.trim()).filter(Boolean));
  await r.poll(Number(process.env.WAIT || 1200000), 5000, { cap: null, keep }, async () => (await btns()).some(t => /承認|スキャンを開始|Approve|Start scan/.test(t)));
  r.mark('proposal');
  console.log('BTNS', JSON.stringify(await btns()));
  console.log((await main()).slice(-3000));
}
if (PHASE === 'secdone') {
  await tidy();
  await r.poll(Number(process.env.WAIT || 5400000), 15000, { cap: null, keep }, async () => !/実行中/.test(await p.evaluate(() => document.body.innerText.slice(0, 20000))));
  r.mark('scandone');
  console.log((await main()).slice(-2500));
}
if (PHASE === 'secfind') {
  await tidy();
  const btns = () => p.evaluate(() => [...document.querySelectorAll('button, a')].filter(b => b.getBoundingClientRect().width > 0).map(b => b.innerText.trim().slice(0, 40) + (b.href ? '=' + b.href : '')).filter(Boolean));
  await p.mouse.move(700, 300); r.cur = { x: 700, y: 300 };
  await r.shot({ hold: 2.4, mark: 'scancard' });
  const v = await r.find({ text: '件の検出結果を表示', exact: false, sel: 'button, a' });
  await r.click(v, { pre: { hlBox: v }, wait: 5000 });
  await tidy(); await p.mouse.move(700, 300); r.cur = { x: 700, y: 300 };
  await r.shot({ hold: 2.4, mark: 'findings' });
  console.log('URL', await p.evaluate(() => location.href));
  console.log('BTNS', JSON.stringify(await btns()));
  console.log((await main()).slice(0, 2500));
}
if (PHASE === 'secdetail') {
  await tidy();
  const f = await r.find({ text: process.env.FINDING || '商品検索の SQL インジェクション', exact: false, sel: 'button, a, [role=row], tr' });
  if (!f) throw new Error('finding not found');
  await r.click(f, { pre: { hlBox: f }, wait: 4000 });
  await tidy(); await p.mouse.move(700, 300); r.cur = { x: 700, y: 300 };
  await r.shot({ hold: 2.6, mark: 'finding' });
  console.log('URL', await p.evaluate(() => location.href));
  console.log('BTNS', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('button, a')].filter(b => b.getBoundingClientRect().width > 0 && b.getBoundingClientRect().x > 700).map(b => b.innerText.trim().slice(0, 30) + '@' + Math.round(b.getBoundingClientRect().x) + ',' + Math.round(b.getBoundingClientRect().y)).filter(x => !x.startsWith('@')))));
  console.log(await p.evaluate(() => document.body.innerText.slice(0, 0) + [...document.querySelectorAll('[role=dialog], aside, section')].map(e => e.innerText).join('\n---\n').slice(0, 2000)));
}
if (PHASE === 'secfix') {
  await tidy();
  const b = await r.find({ text: 'Devinで修正', sel: 'button' });
  if (!b) throw new Error('no fix button');
  await r.click(b, { pre: { hlBox: b }, wait: 6000 });
  console.log('TABS', (await (await fetch('http://127.0.0.1:9333/json/list')).json()).filter(x => x.type === 'page').map(x => x.url).join(' '));
  console.log('URL', await p.evaluate(() => location.href));
  console.log('BTNS', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('[role=dialog] button, main button')].filter(b => b.getBoundingClientRect().width > 0).map(b => b.innerText.trim().slice(0, 30)).filter(Boolean))));
  console.log(await p.evaluate(() => [...document.querySelectorAll('[role=dialog]')].map(e => e.innerText).join('\n---\n').slice(0, 1500)));
  await r.shot({ hold: 1.6, mark: 'fixclicked' });
}
if (PHASE === 'secfix2') {
  const b = await p.evaluate(() => { const d = [...document.querySelectorAll('[role=dialog]')].find(d => /ベースブランチ/.test(d.innerText)); if (!d) return null; const e = [...d.querySelectorAll('button')].filter(b => b.innerText.trim() === 'Devinで修正').pop(); const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width, h: r.height }; });
  if (!b) throw new Error('no dialog');
  await r.click(b, { pre: { hlBox: b }, wait: 9000 });
  console.log('TABS', (await (await fetch('http://127.0.0.1:9333/json/list')).json()).filter(x => x.type === 'page').map(x => x.url).join(' '));
  console.log('URL', await p.evaluate(() => location.href));
  console.log('LINKS', JSON.stringify(await p.evaluate(() => [...new Set([...document.querySelectorAll('a[href*="/sessions/"]')].map(a => a.innerText.trim().slice(0, 30) + '=' + a.href))].slice(0, 8))));
  await tidy(); await r.shot({ hold: 1.8, mark: 'fixstarted' });
}
if (PHASE === 'auto') {
  const W = ms => sleep(ms);
  const menuItem = async t => { const b = await p.evaluate(t => { const e = [...document.querySelectorAll('[role=menuitem],[role=option]')].find(e => e.innerText.trim() === t || e.innerText.trim().startsWith(t)); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width, h: r.height }; }, t); if (!b) throw new Error('no menu item ' + t); return b; };
  await r.goto(ORG + '/automations', 6000); await tidy();
  await p.mouse.move(700, 300); r.cur = { x: 700, y: 300 };
  await r.shot({ hold: 2.4, mark: 'autolist' });
  const tpl = await r.find({ text: 'バグ報告をトリアージ', exact: false, sel: 'main a, main button' });
  if (tpl) await r.point(tpl, { hold: 1.6, hlBox: { x: tpl.x - 20, y: tpl.y - 20, w: 360, h: 190 } });
  const create = await r.find({ text: 'Automation を作成', exact: false, sel: 'main button' });
  await r.click(create, { pre: { hlBox: create }, wait: 1200 });
  await r.click(await menuItem('手動で作成'), { wait: 2500 });
  await r.shot({ hold: 1.4, mark: 'autoform' });
  const name = await r.box('[role=dialog] input[placeholder="Automation 名"], [role=dialog] input[aria-label="Automation 名"]');
  await r.click(name, { wait: 300 }); await r.type(process.env.AUTO_NAME || 'Slack の不具合報告を自動調査', { every: 3 });
  const add = await p.evaluate(() => { const d = [...document.querySelectorAll('[role=dialog]')].find(d => /Automation 作成/.test(d.innerText)); const b = [...d.querySelectorAll('button')].filter(b => b.innerText.trim() === 'トリガーを追加')[0]; const r = b.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width, h: r.height }; });
  await r.click(add, { pre: { hlBox: add }, wait: 1000 });
  await r.click(await menuItem('Slack'), { wait: 900 });
  await r.click(await menuItem('Message'), { wait: 1800 });
  const ch = await r.find({ text: 'チャンネルを選択', exact: false, sel: '[role=dialog] button, [role=dialog] [role=combobox]' });
  if (!ch) throw new Error('no channel select');
  await r.click(ch, { pre: { hlBox: ch }, wait: 1200 });
  await r.type('usagi-bugs', { every: 2 }); await W(1500);
  await r.click(await menuItem(process.env.AUTO_CH || 'usagi-bugs').catch(async () => menuItem('#usagi-bugs')), { wait: 1200 });
  await closeMenus(p).catch(() => {});
  await r.shot({ hold: 2.0, mark: 'autotrigger' });
  const ins = await p.evaluate(() => { const d = [...document.querySelectorAll('[role=dialog]')].find(d => /Automation 作成/.test(d.innerText)); const e = d.querySelector('[contenteditable=true], textarea'); e.scrollIntoView({ block: 'center' }); const r = e.getBoundingClientRect(); return { x: r.x + 40, y: r.y + 30, w: 60, h: 30 }; });
  await W(800);
  await r.click(ins, { wait: 400 });
  await r.type(process.env.AUTO_INS || '#usagi-bugs に届いた「うさぎマーケット（natt-cog/usagi-ecommerce）」の不具合報告を調査してください。報告内容を再現し、原因をコードの根拠付きで日本語でスレッドに返信してください。修正が必要な場合は修正 PR を作成し、そのリンクも返信してください。', { every: 4 });
  await r.shot({ hold: 2.4, mark: 'autoins' });
  console.log('FORM', (await p.evaluate(() => [...document.querySelectorAll('[role=dialog]')].find(d => /Automation 作成/.test(d.innerText)).innerText)).slice(0, 900));
}
if (PHASE === 'autosave') {
  const trash = await p.evaluate(() => { const d = [...document.querySelectorAll('[role=dialog]')].find(d => /Automation 作成/.test(d.innerText)); d.scrollTop = 0; const rows = [...d.querySelectorAll('button')].filter(b => b.innerText.trim() === 'トリガーを追加').map(b => b.parentElement.closest('div')); for (const row of rows) { let el = row; for (let i = 0; i < 4 && el; i++, el = el.parentElement) { const t = el.querySelector('button[aria-label="トリガーを削除"]'); if (t && !/Message/.test(el.innerText)) { const r = t.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width, h: r.height }; } } } return null; });
  console.log('TRASH', JSON.stringify(trash));
  if (trash) { await sleep(600); await r.click(trash, { wait: 1200 }); }
  const b = await p.evaluate(() => { const d = [...document.querySelectorAll('[role=dialog]')].find(d => /Automation 作成/.test(d.innerText)); const e = [...d.querySelectorAll('button')].find(b => b.innerText.trim() === 'Automation を作成'); const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width, h: r.height }; });
  await r.click(b, { pre: { hlBox: b }, wait: 5000 });
  await tidy(); await r.shot({ hold: 2.4, mark: 'autosaved' });
  console.log('URL', await p.evaluate(() => location.href));
  console.log((await main()).slice(0, 1200));
}
if (PHASE === 'slackpost') {
  const CH = process.env.SLACK_CH || 'C0CLMSJATGQ';
  await r.goto('https://app.slack.com/client/T0C3WMJB96G/' + CH, 9000);
  await p.evaluate(() => document.querySelectorAll('[data-qa="banner"], .p-notification_bar').forEach(e => e.remove()));
  await p.mouse.move(700, 300); r.cur = { x: 700, y: 300 };
  await r.shot({ hold: 1.8, mark: 'slack' });
  const ed = await r.box('[data-qa="message_input"] [contenteditable=true], .ql-editor[contenteditable=true]');
  await r.click(ed, { wait: 400 });
  await r.type(process.env.SLACK_MSG, { every: 4 });
  await r.shot({ hold: 1.8, mark: 'slacktyped' });
  await p.keyboard.press('Enter'); await sleep(2500);
  await r.shot({ hold: 1.6, mark: 'slackposted' });
  const t0 = Date.now();
  await r.poll(Number(process.env.WAIT || 1500000), 8000, { cap: null, keep }, async () => {
    const txt = await p.evaluate(() => [...document.querySelectorAll('[data-qa="virtual-list-item"]')].slice(-3).map(e => e.innerText).join('\n'));
    return /返信|replies|reply/.test(txt) && Date.now() - t0 > 20000;
  });
  r.mark('slackreply');
  console.log((await p.evaluate(() => document.querySelector('[data-qa="message_pane"], .p-message_pane')?.innerText || document.body.innerText)).slice(-1500));
}
if (PHASE === 'slackthread') {
  const rep = await r.find({ text: 'repl', exact: false, sel: '[data-qa="reply_bar_count"], button, a' });
  if (rep) await r.click(rep, { pre: { hlBox: rep }, wait: 3500 });
  await r.shot({ hold: 2.2, mark: 'thread' });
  const pane = () => p.evaluate(() => (document.querySelector('[data-qa="threads_flexpane"], .p-flexpane, [aria-label*="Thread"]') || document.body).innerText);
  let last = '', same = 0;
  await r.poll(Number(process.env.WAIT || 1800000), 10000, { cap: null, keep }, async () => {
    const t = await pane(); same = t === last ? same + 1 : 0; last = t;
    return (/pull\/\d+|PR\s*#?\d+|#\d+/.test(t) && same >= 2) || same >= 30;
  });
  r.mark('threaddone');
  const links = await p.evaluate(() => [...new Set([...document.querySelectorAll('a[href]')].map(a => a.href).filter(h => /devinenterprise\.com\/sessions|github\.com\/.*pull/.test(h)))]);
  console.log('LINKS', JSON.stringify(links));
  console.log((await pane()).slice(-2500));
}
if (PHASE === 'threadscroll') {
  const sc = () => p.evaluate(dy => { const els = [...document.querySelectorAll('[data-qa="threads_flexpane"] *, .p-flexpane *')].filter(e => e.scrollHeight > e.clientHeight + 40 && /auto|scroll/.test(getComputedStyle(e).overflowY)); els.sort((a, b) => b.clientHeight - a.clientHeight); const e = els[0]; if (!e) return false; const b = e.scrollTop; e.scrollTop += dy; return e.scrollTop !== b; }, 60);
  await p.evaluate(() => { const els = [...document.querySelectorAll('[data-qa="threads_flexpane"] *, .p-flexpane *')].filter(e => e.scrollHeight > e.clientHeight + 40 && /auto|scroll/.test(getComputedStyle(e).overflowY)); els.sort((a, b) => b.clientHeight - a.clientHeight); if (els[0]) els[0].scrollTop = 0; });
  await sleep(800); await r.shot({ hold: 2.0, mark: 'threadtop' });
  for (let i = 0; i < 40; i++) { if (!(await sc())) break; await sleep(120); await r.shot({ kind: 'poll', scroll: true }); }
  await sleep(600); await r.shot({ hold: 2.6, mark: 'threadend' });
}
if (PHASE === 'oncall') {
  const menuItem = async t => { const b = await p.evaluate(t => { const e = [...document.querySelectorAll('[role=menuitem],[role=option]')].find(e => e.innerText.trim() === t || e.innerText.trim().startsWith(t)); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width, h: r.height }; }, t); if (!b) throw new Error('no menu item ' + t + ' / ' + (await p.evaluate(() => [...document.querySelectorAll('[role=menuitem],[role=option]')].map(e => e.innerText.trim()).join('|')))); return b; };
  const dlg = "[...document.querySelectorAll('[role=dialog]')].find(d => /レスポンダー/.test(d.innerText) && d.querySelector('input'))";
  await r.goto(ORG + '/oncall', 6000); await tidy();
  await p.mouse.move(700, 300); r.cur = { x: 700, y: 300 };
  await r.shot({ hold: 2.2, mark: 'oncall' });
  const c = await r.find({ text: 'レスポンダーを作成', sel: 'main a, main button' });
  await r.click(c, { pre: { hlBox: c }, wait: 3000 });
  if (!(await p.evaluate(() => !!document.querySelector('input[placeholder="本番環境のアラート"]')))) { await p.evaluate(u => { location.href = u; }, ORG + '/oncall/create'); await sleep(7000); await tidy(); }
  await r.shot({ hold: 1.4, mark: 'ocform' });
  const name = await r.box('input[placeholder="本番環境のアラート"]');
  await r.click(name, { wait: 300 }); await r.type(process.env.OC_NAME || 'うさぎマーケットのアラート調査', { every: 3 });
  const add = await p.evaluate(new Function('return (() => { const d = ' + dlg + ' || document; const b = [...d.querySelectorAll("button")].filter(b => b.innerText.trim() === "トリガーを追加")[0]; const r = b.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width, h: r.height }; })()'));
  await r.click(add, { pre: { hlBox: add }, wait: 1000 });
  await r.click(await menuItem('Slack'), { wait: 900 });
  console.log('SLACKMENU', await p.evaluate(() => [...document.querySelectorAll('[role=menuitem]')].map(e => e.innerText.trim()).join('|')));
  await r.click(await menuItem(process.env.OC_EVT || 'Message'), { wait: 1800 });
  const ch = await r.find({ text: 'チャンネルを選択', exact: false, sel: 'button, [role=combobox]' });
  if (!ch) throw new Error('no channel select');
  await r.click(ch, { pre: { hlBox: ch }, wait: 1200 });
  await r.type('usagi-alerts', { every: 2 }); await sleep(1500);
  await r.click(await menuItem('usagi-alerts').catch(() => menuItem('#usagi-alerts')), { wait: 1200 });
  await closeMenus(p).catch(() => {});
  const trash = await p.evaluate(() => { const rows = [...document.querySelectorAll('button')].filter(b => b.innerText.trim() === 'トリガーを追加').map(b => b.parentElement.closest('div')); for (const row of rows) { let el = row; for (let i = 0; i < 4 && el; i++, el = el.parentElement) { const t = el.querySelector('button[aria-label="トリガーを削除"]'); if (t && !/Message|メッセージ/.test(el.innerText)) { const r = t.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width, h: r.height }; } } } return null; });
  console.log('TRASH', JSON.stringify(trash));
  if (trash) await r.click(trash, { wait: 1200 });
  await r.shot({ hold: 2.2, mark: 'octrigger' });
  console.log('FORM', (await p.evaluate(() => document.body.innerText)).slice(0, 0) + (await p.evaluate(() => { const d = [...document.querySelectorAll('[role=dialog]')].pop(); return d ? d.innerText : ''; })).slice(0, 1500));
}
if (PHASE === 'ocsave') {
  const b = await r.find({ text: 'レスポンダーを作成', sel: '[role=dialog] button' });
  await r.click(b, { pre: { hlBox: b }, wait: 5000 });
  await tidy(); await r.shot({ hold: 2.4, mark: 'ocsaved' });
  console.log('URL', await p.evaluate(() => location.href));
  console.log((await main()).slice(0, 800));
}
if (PHASE === 'wikiask') {
  if (process.env.WIKI_URL) await r.goto(process.env.WIKI_URL, 5000);
  await wikiTidy();
  const ed = await boxOf('main [contenteditable=true]');
  await r.click(ed, { pre: { hlBox: ed }, wait: 500 });
  await sendPrompt(WQ, 'wq');
  await sleep(5000); await tidy();
  console.log('SESSION', await p.evaluate(() => location.href));
  let last = '', same = 0;
  await r.poll(Number(process.env.WAIT || 400000), 3000, { cap: null, keep }, async () => {
    const t = await main(); same = t === last && t.length > 800 ? same + 1 : 0; last = t; return same >= 4;
  });
  r.mark('wanswer');
  console.log('SESSION', await p.evaluate(() => location.href));
  console.log((await main()).slice(0, 5000));
}
r.done();
console.log('beats', r.beats.length);
process.exit(0);
