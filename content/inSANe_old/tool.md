---
title: "⚙ ツール"
draft: false
---
<style>

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



.button-1 {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100px;
    margin:0 auto;
    padding: .9em 2em;
    border: 1px solid #5F5E5E;
    border-radius: 25px;
    background-color: #fff;
    color: #5F5E5E;
    font-size: 1em;
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


# ⚙ CS → コマ情報変換ツール
___

> [!tip]
> 　[キャラクターシート倉庫](https://character-sheets.appspot.com/) さんで制作したCS上部にある「Tekeyフォーマット出力をクリック →<br>　全文をコピーして下部エリアにペースト →　「変換」をクリック→<br>　でTekeyのコマ用に整形された文章が表示されます。

> [!warning]-   インセインにしか対応していません<br>また、ｇのセッション周りのみでの使用を想定してます

<br><br>

<!-- ここからHTML UI部分 -->
<div class="tool-ui">
  <button class="button-1" onclick="convert()">変換</button>
  
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
  let mission = '';
  let special = '';
  let skills = {
    暴力: '', 情動: '', 知覚: '', 技術: '', 知識: '', 怪異: []
  };
  let fear = '';
  let abilities = [];

  const skillFields = ['暴力', '情動', '知覚', '技術', '知識', '怪異'];

  for (let line of lines) {
    if (line.includes('名前：')) name = line.split('名前：')[1].trim();
    if (line.includes('【使命】')) mission = line.split('【使命】')[1].trim();

    for (let field of skillFields) {
      const regex = new RegExp(`${field}：.*?○：?(.*)`);
      if (regex.test(line)) {
        special = field; // ○がついてる分野を好奇心に設定
        const match = line.match(regex);
        const raw = match[1].trim();
        if (field === '怪異') {
          skills['怪異'] = raw.split(/、|,/).map(s => s.trim().replace(/[〈〉]/g, ''));
        } else {
          skills[field] = extractSkill(raw);
        }
      } else if (line.includes(`${field}：`)) {
        if (field === '怪異') {
          const match = line.match(/怪異：.*?：(.+)/);
          if (match) {
            skills['怪異'] = match[1].split(/、|,/).map(s => s.trim().replace(/[〈〉]/g, ''));
          }
        } else {
          skills[field] = extractSkill(line);
        }
      }
    }

    if (line.includes('恐怖心：')) {
      const rawFear = line.split('恐怖心：')[1].trim().replace(/[〈〉]/g, '');
      fear = rawFear ? `〈${rawFear}〉` : '';
    }

    if (line.includes('：装備') || line.includes('：攻撃') || line.includes('：サポ')) {
      abilities.push(formatAbility(line));
    }
  }

  const output = `
==========================================
　名前：${name}
　PL　：
------------------------------------------
【使命】${mission}
------------------------------------------
👁️‍🗨️ 特技　
　1/暴力分野：${skills['暴力']}
　2/情動分野：${skills['情動']}
　3/知覚分野：${skills['知覚']}
　4/技術分野：${skills['技術']}
　5/知識分野：${skills['知識']}
　6/怪異分野：${skills['怪異'].map(s => `〈${s}〉`).join('')}
　
✨好奇心：${special}　　✖恐怖心：${fear}
------------------------------------------
💠 アビリティ
　${abilities.join('\n　')}
------------------------------------------
❤ 感情
　・PC名　→　感情(+/-)
　
------------------------------------------
📓 情報/居所
　・
　
==========================================
`.trim();

  document.getElementById('output').textContent = output;
}

function extractSkill(lineOrRaw) {
  if (!lineOrRaw || typeof lineOrRaw !== 'string') return '';

  // 「1/暴力：　：切断」 → 「切断」だけ抽出
  const match = lineOrRaw.match(/：\s*：?(.*)/);
  const raw = match ? match[1] : lineOrRaw;

  const cleaned = raw
    .replace(/[〈〉]/g, '')
    .replace(/○：?/g, '')
    .replace(/：/g, '')
    .trim();

  if (!cleaned) return '';

  const parts = cleaned.split(/、|,/).map(s => s.trim()).filter(Boolean);
  return parts.length ? parts.map(p => `〈${p}〉`).join('') : '';
}

function formatAbility(line) {
  const parts = line.split('：');
  const name = parts[0].trim();
  const type = parts[1].trim();
  const skill = parts[2] ? parts[2].trim().replace(/[〈〉]/g, '') : '';
  return `【　${name}　】：　${type}　：　〈${skill || 'なし'}〉`;
}

function copyOutput() {
  const text = document.getElementById('output').textContent;
  navigator.clipboard.writeText(text).then(() => {
    alert('コピーしました！');
  }).catch(err => {
    alert('コピーに失敗しました…🌀');
    console.error(err);
  });
}
</script>


<style>
/* カスタムモーダル用のCSSを追記 */
#feedback-message {
    /* スクリプト内で定義 */
}
</style>
