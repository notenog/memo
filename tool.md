
---
title: "⚙ ツール"
draft: false
___

<textarea id="input" rows="20" cols="60" placeholder="キャラシートを貼り付けてね"></textarea>
<br>
<button onclick="convert()">変換する！</button>
<pre id="output"></pre>

<script>
function convert() {
  const raw = document.getElementById('input').value;
  const lines = raw.split('\n');

  let name = '';
  let special = '';
  let skills = {
    暴力: '', 情動: '', 知覚: '', 技術: '', 知識: '', 怪異: []
  };
  let fear = '';
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
◆名前：${name}　◆PL：
------------------------------------------
◆特技　★${special}
　暴力分野：${skills['暴力']}
　情動分野：${skills['情動']}
　知覚分野：${skills['知覚']}
　技術分野：${skills['技術']}
　知識分野：${skills['知識']}
★怪異分野：${skills['怪異'].map(s => `〈${s}〉`).join('、')}

✖恐怖心：〈${fear}〉
------------------------------------------
◆アビリティ
${abilities.join('\n')}
------------------------------------------
◆感情
PC名→感情(+/-)
------------------------------------------
◆情報/居所
`.trim();

  document.getElementById('output').textContent = output;
}

function extractSkill(line) {
  const match = line.match(/：(.+)/);
  return match ? `〈${match[1].trim()}〉` : '';
}

function extractMultipleSkills(line) {
  const match = line.match(/怪異：○：(.+)/);
  return match ? match[1].split('、').map(s => s.trim()) : [];
}

function formatAbility(line) {
  const parts = line.split('：');
  const name = parts[0].trim();
  const type = parts[1].trim();
  const skill = parts[2].trim();
  return `【　${name}　】：　${type}　：　${skill ? `〈${skill}〉` : 'なし'}`;
}
</script>
