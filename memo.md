---
title: memo
draft: true
---

移動
cd /d/memo

```csv
# 1. ビルド
npx quartz build

# 2. すべての変更をステージング
git add .

# 3. コミット（メッセージは自動化しても良い）
git commit -m "feat: [YYYY-MM-DD] Add new note content"

# 4. プッシュ
git push origin master
```
