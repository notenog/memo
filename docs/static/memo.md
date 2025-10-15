---
title: memo
draft: false
---

```csv
# 1. ビルド
node quartz/bootstrap-cli.mjs build -o docs

# 2. すべての変更をステージング
git add .

# 3. コミット（メッセージは自動化しても良い）
git commit -m "Update site content"

# 4. プッシュ
git push
```
