# Tekey API連携 引継書

## 概要

Tekey（TRPGオンラインセッションツール）と外部Webツールを連携させるための、Firebase Functions プロキシ経由のAPI呼び出し部分のみをまとめた引継書。
新規プロジェクトでこの連携部分をそのまま流用するための実装ガイド。

対象範囲：**Firebase連携・Tekey API呼び出し・接続設定UIのみ**（モンスターDB・キャラ管理など個別プロジェクトの機能は含まない）

---

## システム構成

```
ブラウザ（新規Webツール）
　　↓ POST（JSON）
Firebase Functions（プロキシ）
　　↓ GET（URLパラメータ）
Tekey API（https://tekey.jp/api）
```

### なぜFirebaseプロキシが必要か
- `tekey.jp/api` へのブラウザからの直接リクエストはCORSエラーになる
- APIキーをHTMLに直書きしないためのセキュリティ対策
- Firebase FunctionsがAPIキーを保持し、リクエストを中継する

---

## Tekey API 仕様

`https://tekey.jp/api` が実際に受け付けるパラメータ一覧。Firebase Functionsはこれをそのまま中継するだけなので、新しいcommandやパラメータを使いたい場合はここを確認する。

**共通パラメータ（全command共通）**

| パラメータ | 必須 | 説明 |
|---|---|---|
| `apikey` | ◯ | Tekey発行のAPIキー |
| `command` | ◯ | 実行するコマンド名 |
| `room` | ◯ | ルームID（TekeyのルームURL末尾） |
| `password` | △ | ルームパスワード（設定されている場合は必須） |

### command: `sendChat`

チャット送信・ダイスロール。

| パラメータ | 必須 | 説明 |
|---|---|---|
| `message` | ◯ | 送信するメッセージ・ダイスコマンド（例：`2d6+5 [命中]`） |
| `name` | ◯※ | 送信者名。**省略・空文字・スペースのみは500エラー**（詳細は注意事項①） |
| `color` | △ | チャット表示色（16進カラーコード、`#`なし。例：`999999`） |
| `tab` | △ | 送信先タブ名。省略時は最左端タブ |
| `bot` | △ | BCDiceのシステムID（例：`SwordWorld2_5`）。省略時はダイスロールが実行されず生テキスト送信になる |

**既知の制限：**
- `message` 内に `《` `》` `／` が含まれると500エラー（事前に `[` `]` `/` へ変換が必要）
- `:行動=0` のようなステータス変更コマンドはテキストとして送られるのみで実行されない

### command: `addCharacter`

ルームにコマ（キャラクター/モンスターの駒）を生成する。

| パラメータ | 必須 | 説明 |
|---|---|---|
| `name` | ◯ | コマの名前 |
| `info` | △ | コマの詳細情報欄に表示されるテキスト（種族特徴など） |
| `values` | △ | 初期ステータス値（用途未検証、文字列形式と推測） |
| `image` | △ | コマのアイコン画像（URLまたはbase64と推測、未検証） |
| `initiative` | △ | 初期先制値（文字列化して送信。数値そのままだと弾かれる可能性があるため`String()`変換推奨） |

**注意：** `values` `image` `initiative` は今回のプロジェクトでは未使用のため、実際の挙動は未検証。使う場合は実機で確認すること。

### command: `setColumns`

指定した駒のステータステーブルにカラム（列）を追加する。

| パラメータ | 必須 | 説明 |
|---|---|---|
| `name` | ◯ | 対象の駒名（既存の駒と一致させる必要がある） |
| `columns` | ◯ | カラム定義文字列（下記フォーマット参照） |

**columnsのフォーマット：**

```
カラム名:bool1:bool2,カラム名:bool1:bool2,...
```

例：
```
💠移動力:false:false,HP:false:false,行動:true:false
```

- `bool1`：チェックボックス形式かどうか（`true`=チェックボックス／`false`=数値入力）
- `bool2`：未使用、または別オプション（既存実装では常に`false`、詳細未解明）
- カラム名に絵文字を含めることも可能（`💠移動力` など）

### 未実装・要望中のcommand挙動

| 要望内容 | 状況 |
|---|---|
| `sendChat`で`name`省略時もエラーにならないようにしてほしい | Tekeyへ要望送付済み・未対応 |
| `sendChat`経由で`:行動=0`等のステータス変更コマンドを実行できるようにしてほしい | Tekeyへ要望送付済み・未対応 |

---

## Firebase Functions（index.js）

既存の `trpgnog` プロジェクトに `tekeyProxy2` 関数がデプロイ済み。新規プロジェクトでも**同じエンドポイントをそのまま使える**（command分岐で機能を増やせる）。

```js
const functions = require('firebase-functions');
const fetch     = require('node-fetch');

const TEKEY_API_KEY  = '';  // 実際のAPIキー
const TEKEY_ENDPOINT = 'https://tekey.jp/api';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

async function callTekey(params) {
  const url = TEKEY_ENDPOINT + '?' + Object.entries(params)
    .filter(([_, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => encodeURIComponent(k) + '=' + encodeURIComponent(v))
    .join('&');
  const res  = await fetch(url);
  const text = await res.text();
  return { status: res.status, text };
}

exports.tekeyProxy2 = functions
  .region('us-central1')
  .https.onRequest(async (req, res) => {
    if (req.method === 'OPTIONS') { res.set(CORS_HEADERS).status(204).send(''); return; }
    res.set(CORS_HEADERS);
    if (req.method !== 'POST') { res.status(405).json({ error: 'Method Not Allowed' }); return; }
    try {
      const body    = req.body;
      const command = body.command || 'sendChat';
      let params = { apikey: TEKEY_API_KEY, command, room: body.room || '', password: body.password || '' };

      if (command === 'sendChat') {
        params.message = body.message;
        if (body.name && body.name.replace(/[\s\u3000]/g, '').length > 0) {
          params.name = body.name.trim();
        }
        if (body.color) params.color = body.color;
        if (body.tab)   params.tab   = body.tab;
        if (body.bot)   params.bot   = body.bot;
      }
      if (command === 'addCharacter') {
        params.name       = body.name;
        params.values     = body.values;
        params.image      = body.image;
        params.initiative = body.initiative ? String(body.initiative) : undefined;
        params.info       = body.info;
      }
      if (command === 'setColumns') {
        params.name    = body.name;
        params.columns = body.columns;
      }

      const { status, text } = await callTekey(params);
      res.status(status).send(text);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
```

### デプロイコマンド
```bash
firebase deploy --only functions:tekeyProxy2
```

### 新しいcommandを追加したい場合
`tekeyProxy2` 内の `if (command === '...')` ブロックを追加し、Tekey APIが対応しているパラメータを `params` に詰めるだけ。フロント側は後述の`callTekeyAPI()`からcommand名を変えて呼ぶだけで動く。

---

## フロントエンド実装

### 共通定数・設定取得

```js
const ENDPOINT = 'https://us-central1-trpgnog.cloudfunctions.net/tekeyProxy2';

function cfg(key) { return localStorage.getItem(key) || ''; }
```

`room` / `pass` / `tab` / `senderName` の4つをlocalStorageから取得する想定。新規プロジェクトでも同じキー名にしておけば、過去のツールと設定を共有できる（設定し直す必要がない）。

### 接続設定UI（最低限）

```html
<div class="fgroup">
  <label>ルームID</label>
  <input type="text" id="s_room" placeholder="TekeyのルームURL末尾のID">
</div>
<div class="fgroup">
  <label>ルームパスワード</label>
  <input type="text" id="s_pass" placeholder="ルームのパスワード">
</div>
<div class="fgroup">
  <label>送信先タブ名（省略可）</label>
  <input type="text" id="s_tab" placeholder="省略時は最左端タブ">
</div>
<div class="fgroup">
  <label>送信者名（省略可）</label>
  <input type="text" id="s_name" placeholder="例：GM">
</div>
```

```js
function saveSettings() {
  localStorage.setItem('room',       document.getElementById('s_room').value.trim());
  localStorage.setItem('pass',       document.getElementById('s_pass').value.trim());
  localStorage.setItem('tab',        document.getElementById('s_tab').value.trim());
  localStorage.setItem('senderName', document.getElementById('s_name').value.trim());
}
```

---

## 主要API呼び出し関数

### ① sendChat（チャット送信・ダイスロール）

```js
async function sendChat(message, { name, color, bot } = {}) {
  const room     = cfg('room');
  const password = cfg('pass');
  const tab      = cfg('tab');

  // senderName：空・スペースのみの場合はU+3164でフォールバック（★重要、詳細は注意事項参照）
  const _nameArg = (name || '').replace(/[\s\u3000]/g, '');
  const _nameCfg = (cfg('senderName') || '').replace(/[\s\u3000]/g, '');
  const _rawName = _nameArg.length > 0 ? (name || '').trim()
                 : _nameCfg.length > 0 ? (cfg('senderName') || '').trim()
                 : null;
  const senderName = _rawName || 'ㅤ'; // U+3164

  if (!room) return false;

  const body = { command: 'sendChat', room, password, message };
  if (senderName) body.name  = senderName;
  if (tab)        body.tab   = tab;
  if (color)       body.color = color;
  if (bot)         body.bot   = bot;

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}
```

**用途例：**
```js
sendChat('2d6+5 [命中]', { name: 'ウルフ', color: '999999', bot: 'SwordWorld2_5' });
```

### ② addCharacter（コマ生成）

```js
async function createPiece(name, info) {
  const room     = cfg('room');
  const password = cfg('pass');
  if (!room || !name) return;

  const body = { command: 'addCharacter', room, password, name };
  if (info) body.info = info; // 種族特徴など、コマの詳細情報欄に表示される

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.ok;
}
```

`values` / `image` / `initiative` パラメータも `addCharacter` で使用可能（今回のプロジェクトでは未使用、将来拡張用）。

### ③ setColumns（ステータスシートのカラム設定）

```js
async function setColumns(name, columns) {
  const room     = cfg('room');
  const password = cfg('pass');
  if (!room || !name) return;

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ command: 'setColumns', room, password, name, columns }),
  });
  return res.ok;
}
```

**columns文字列の形式：** `カラム名:bool:bool` を `,` 区切りで並べる。

```
"💠移動力:false:false,HP:false:false,行動:true:false"
```

2つの `bool` の意味（Tekey UI上の設定に対応。詳細未解明な部分は実機で要確認）：
- 1つ目：チェックボックス形式かどうか（`true` = チェックボックス、`false` = 数値入力）
- 2つ目：未使用 or 別オプション（既存実装では常に `false`）

---

## 必須の注意事項（実装時に踏むハマりどころ）

### ① `name` パラメータは省略不可（500エラーの原因）

Tekey APIの `sendChat` は `name` パラメータが**存在しない・空文字・スペースのみ**の場合、すべて500エラーを返す。

回避策：名前が空のときは `U+3164`（ハングル字母充填、見た目は空白）をフォールバック値として渡す。

```js
const senderName = rawName || '\u3164';
```

### ② `《》／` などの記号は500エラーの原因になる

`sendChat` の `message` に `《` `》` `／` が含まれると500エラーになる。送信前に変換すること。

```js
function tekeyMsg(s) {
  return s.replace(/《/g, '[').replace(/》/g, ']').replace(/／/g, '/');
}
```

### ③ CORS対策は必須

ブラウザから `tekey.jp/api` へ直接fetchするとCORSエラーになる。必ずFirebase Functions等のプロキシ経由にすること。

### ④ BCDiceのシステム名表示の癖

`bot` パラメータに `SwordWorld2.5`（ドット表記）を指定しても、Tekey上では「ソード・ワールド2.5」と表示される。表示のみの問題で動作に影響なし。アンダースコア表記（`SwordWorld2_5`）でも同様に動作する。

### ⑤ 未実装・Tekey側の制限

- `:行動=0` のようなステータス変更コマンドは `sendChat` の `message` ではテキストとして送られるのみで、実際のステータス変更は実行されない（Tekey APIの制限。要望送付済み・未対応）。

---

## 新規プロジェクトでの流用手順

1. Firebase Functions の `tekeyProxy2` をそのまま使う（新しいFirebaseプロジェクトを作る必要はない）
2. 新ツールのHTMLに `ENDPOINT` 定数・`cfg()` ・接続設定UIをコピー
3. 必要な機能に応じて `sendChat()` / `createPiece()` / `setColumns()` をコピー
4. 新しいTekey APIコマンドが必要なら `tekeyProxy2` の分岐を1つ追加してデプロイ
5. 「① name省略不可」「② 記号変換」だけは必ず実装に含める（踏むと500エラーで詰まる）
