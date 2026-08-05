
```
cd D:\memo
```

```
npm run build

git add .
git commit -m "fix: Final push of clean assets with all content emitters disabled"
git push origin master
```

```
cd /d/memo
npm run build                                        # ← これを絶対に飛ばさない！
git ls-files --deleted -z | xargs -0 git checkout --
git status                                            # ← 02CoC_battle.htmlがmodified・deletedが無いか確認
git add .
git commit -m "記事を更新"
git push origin master
```
↑最新