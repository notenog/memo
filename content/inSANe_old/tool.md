---
title: "⚙ ツール"
draft: false
---

## 🛠 CS → コマ情報整形
___

> [!tip] 
[キャラクターシート倉庫](https://character-sheets.appspot.com/) さん上部にある「Tekeyフォーマット出力」をクリック →  
全文をコピーして下部エリアにペースト →  
「変換」をクリックでTekeyのコマ用に整形された文章が表示されます。
  
  
> [!warning]  インセインにしか対応していません<br>また、自分のセッション周り用のみとして想定しています

<br><br>

<!-- ここからHTML UI部分 -->
<div class="tool-ui">
<div class="tool-ui">
  <textarea id="input" placeholder="ここにコピペ"></textarea>
  <br>
  <button onclick="convert()">変換</button>

  <div class="output-container">
    <button class="copy-button" onclick="copyOutput()">📋</button>
    <pre id="output"></pre>
  </div>
</div>

<br><br><br>

<!-- 👇ここに空行を入れる！ -->

<style>

  textarea,
  .output-container {
    max-width: 650px;
    width: 100%;
    margin: 0 auto;
  }

  button {
    margin: 0.5em 0;
    padding: 0.5em 1em;
    font-size: 10px;
    cursor: pointer;
  }
  .output-container {
    position: relative;
    background: #fff;
    border: 1px solid #ccc;
    padding: 1em;
    margin-top: 1em;
    white-space: pre-wrap;
    font-family: monospace;
  }
  .copy-button {
    position: absolute;
    top: 0.5em;
    right: 0.5em;
    background: #eee;
    border: none;
    padding: 0.3em 0.6em;
    cursor: pointer;
    font-size: 1em;
    border-radius: 4px;
    transition: background 0.2s;
  }
  .copy-button:hover {
    background: #ddd;
  }
</style>

<!-- 👇ここに空行を入れる！ -->

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
　${abilities.join('\n　')}
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
    .replace(/[〈〉]/g, '')       // 括弧除去
    .replace(/○：?/g, '')        // 習得マーク除去
    .replace(/：/g, '')          // 残ったコロン除去
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
