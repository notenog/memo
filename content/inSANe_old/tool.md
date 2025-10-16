---
title: "⚙ ツール"
draft: false
---
<style>
/* CSS修正点: */
/* 1. textarea と .output-container から width: 100% を削除 */
/* 2. .side-by-side の直下の子要素に flex: 1 を追加し、幅を均等に分割 */

.tool-ui {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 横並びコンテナ */
.side-by-side {
  display: flex;
  gap: 1em; /* 左右の間隔 */
  max-width: 1600px; /* 800px × 2 + gap */
  width: 100%;
  align-items: stretch; /* 高さを揃える */
}

/* ★修正箇所★: side-by-sideの子要素にflex: 1を適用し、均等に幅を分割 */
.side-by-side > textarea,
.side-by-side > .output-container {
    flex: 1; /* 均等な幅を確保 */
    /* width: 100%; の競合を防ぐため、この設定が優先されます */
}


textarea {
  /* width: 100%; はflex: 1と競合するため削除 */
  min-width: 350px; /* 最小幅 */
  min-height: 350px; /* 高さを揃える */
  padding: 1em;
  font-family: monospace;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
  resize: both; /* 縦横両方リサイズ可能 */
  box-sizing: border-box;
}

.output-container {
  /* width: 100%; はflex: 1と競合するため削除 */
  min-width: 350px;
  min-height: 350px; /* textareaと高さを揃える */
  margin: 0; /* margin-topを削除 */
  position: relative;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 4px; /* 見栄えを良くするため追加 */
  padding: 1em;
  white-space: pre-wrap;
  font-family: monospace;
  box-sizing: border-box;
  overflow-x: auto; /* 念のため、出力が長すぎた場合に横スクロールを許可 */
}

/* preタグのスタイル: 出力内容がコンテナの幅からはみ出ないように設定 */
.output-container pre {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-all;
}

button {
  margin: 0.5em 0;
  padding: 0.5em 0.5em;
  font-size: 13px;
  cursor: pointer;
}

.copy-button {
  position: absolute;
  top: 0.5em;
  right: 0.5em;
  background: #eee;
  border: none;
  padding: 0.3em 0.6em;
  cursor: pointer;
  font-size: 14px;
  border-radius: 4px;
  transition: background 0.2s;
}

.copy-button:hover {
  background: #ddd;
}
</style>


## 🛠 CS → コマ情報整形
___

> [!tip]
> 　[キャラクターシート倉庫](https://character-sheets.appspot.com/) さん上部にある「Tekeyフォーマット出力をクリック →<br>　全文をコピーして下部エリアにペースト →<br>　「変換」をクリックでTekeyのコマ用に整形された文章が表示されます。

> [!warning]-   インセインにしか対応していません<br>また、ｇのセッション周りのみでの使用を想定してます

<br>

<!-- ここからHTML UI部分 -->
<div class="tool-ui">
  <button onclick="convert()">変換</button>
  
  <div class="side-by-side">
    <textarea id="input" placeholder="ここにコピペ"></textarea>
    
    <div class="output-container">
      <button class="copy-button" onclick="copyOutput()">📋</button>
      <pre id="output"></pre>
    </div>
  </div>
</div>

<br><br><br>


<script>

function convert() {
  const raw = document.getElementById('input').value;
  const lines = raw.split('\n');

  let name = '';
  let special = '';
  let skills = {
    暴力: '〈〉', 情動: '〈〉', 知覚: '〈〉', 技術: '〈〉', 知識: '〈〉', 怪異: []
  };
  let fear = '〈〉';
  let abilities = [];

  for (let line of lines) {
    if (line.includes('名前：')) name = line.split('名前：')[1].trim();
    if (line.includes('好奇心分野には○')) special = '好奇心';
    if (line.match(/暴力：/)) skills['暴力'] = extractSkill(line);
    if (line.match(/情動：/)) skills['情動'] = extractSkill(line);
    if (line.match(/知覚：/)) skills['知覚'] = extractSkill(line);
    if (line.match(/技術：/)) skills['技術'] = extractSkill(line);
    if (line.match(/知識：/)) skills['知識'] = extractSkill(line);
    if (line.match(/怪異：/)) skills['怪異'] = extractMultipleSkills(line);
    if (line.includes('恐怖心：')) fear = extractSkill(line);
    if (line.includes('：装備') || line.includes('：攻撃') || line.includes('：サポ')) {
      abilities.push(formatAbility(line));
    }
  }

  const output = `
------------------------------------------
👁️‍🗨️ 名前：${name}　PL：
------------------------------------------
⚜ 特技　★${special}
　暴力分野：${skills['暴力']}
　情動分野：${skills['情動']}
　知覚分野：${skills['知覚']}
　技術分野：${skills['技術']}
  知識分野：${skills['知識']}
★怪異分野：${skills['怪異'].map(s => `〈${s}〉`).join('、')}

✖恐怖心：${fear}
------------------------------------------
💠 アビリティ
  ${abilities.join('\n  ')}
------------------------------------------
❤ 感情
  ・PC名　→　感情(+/-)
  
------------------------------------------
📓 情報/居所
  ・
  
------------------------------------------
------------------------------------------

`.trim();

  document.getElementById('output').textContent = output;
}
function extractSkill(line) {
  const match = line.match(/：(.+)/);
  if (!match) return '〈〉';

  const raw = match[1]
    .replace(/[〈〉]/g, '')       // 括弧除去
    .replace(/○：?/g, '')        // 習得マーク除去
    .replace(/：/g, '')          // 残ったコロン除去
    .trim();

  if (!raw) return '〈〉';

  const parts = raw.split(/、|,/).map(s => s.trim()).filter(Boolean);
  return parts.map(p => `〈${p}〉`).join('、');
}

function extractMultipleSkills(line) {
  const match = line.match(/怪異：○：(.+)/);
  return match ? match[1].split('、').map(s => s.trim().replace(/[〈〉]/g, '')) : [];
}

function formatAbility(line) {
  const parts = line.split('：');
  const name = parts[0].trim();
  const type = parts[1].trim();
  const skill = parts[2] ? parts[2].trim().replace(/[〈〉]/g, '') : '';
  return `【　${name}　】：　${type}　：　〈${skill || 'なし'}〉`;
}

// alert()の代わりにカスタムモーダルを使用
function copyOutput() {
  const text = document.getElementById('output').textContent;
  
  // クリップボードにコピー
  navigator.clipboard.writeText(text).then(() => {
    showFeedback('コピーしました！ 🎉');
  }).catch(err => {
    showFeedback('コピーに失敗しました…🌀');
    console.error(err);
  });
}

// 簡易的なフィードバック表示関数 (alertの代替)
function showFeedback(message) {
    let feedback = document.getElementById('feedback-message');
    if (!feedback) {
        feedback = document.createElement('div');
        feedback.id = 'feedback-message';
        feedback.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 15px 30px;
            border-radius: 8px;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s ease-in-out;
            font-size: 16px;
        `;
        document.body.appendChild(feedback);
    }
    
    feedback.textContent = message;
    feedback.style.opacity = '1';
    
    setTimeout(() => {
        feedback.style.opacity = '0';
    }, 1500);
}
</script>
<style>
/* カスタムモーダル用のCSSを追記 */
#feedback-message {
    /* スクリプト内で定義 */
}
</style>
