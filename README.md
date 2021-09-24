# BreakOut Game, Phaser 3 + Vite
[Quick demo in gh-pages](https://lastor-chen.github.io/breakout_game_phaser/)

Side project of HTML5 Game, refer to:
- [2D breakout game using Phaser2 - MDN tutorials](https://developer.mozilla.org/en-US/docs/Games/Tutorials/2D_breakout_game_Phaser)
- [MDN Breakout with Phaser3 by Michael Bragg](https://link.medium.com/HAWt8MvPNjb)

Other side project with vanilla javascript:
- [breakout game (no-framework)](https://github.com/Lastor-Chen/breakout_game)

HTML5 Game 練習專案，參考上面列的 MDN 教學，但 MDN 使用 Phaser2 版本過舊，後來找到一篇用 Phaser3 重製的教學。該教學使用 [Parcel](https://parceljs.org/) 進行打包，個人改用 Vite 來處理，順便研究 Vite。

## Phaser memo
- v2 跟 v3 差異極大, 社群體量似乎不太夠, 無法像 Vue 那樣用 Vue2 的關鍵字快速 Google 到 Vue3 的寫法
- 真的是個遊戲引擎, 內容很龐大 module 很多, 不是初見三兩下就能搞懂的
- 使用 ts-check 或 typescript 會有點難受, 一些函式回傳的內容 type 不精確, 得另外使用型別斷言處理
- 官方 example 有一些常用功能的範例, 去那邊找範例會比翻 API 文件快很多
- 當前版本的 Phaser3 API 與上面連結的教學內容存在一些細微差異, GameObject 的 "pointer" 事件需先用 `gameObject.setInteractive()` 開啟才能生效

## Vite Memo
- Vite 專案建立, 有提供純 JS 的選項, 預設就是開箱即用, 遠比 webpack 快速又簡單
- Vite 在 dev 模式是利用瀏覽器的原生 ES6 module 機制來導入 npm 模塊, 省下很多編譯動作, 所以熱更新比 webpack 快很多
- 由於熱更新機制與瀏覽器掛勾, 所以 Vite 無法在 SparkAR 等, 非瀏覽器的 JS runtime 環境使用 watch 功能
- build 本身與 webpack 無太大差異, Vite 旨在解決熱更新問題
- build 後 Vite 會在 cmd 列出每個包的 size, 並會對超過特定 size 的包提出警告
  - 預設似乎會將 npm_module 打成一包, 會造成單檔案過大, 可透過 config 進行拆小包設定
  - 欲根本性的解決包太大的問題, 可使用 `vite-plugin-compression` 壓縮成 gzip, 瀏覽器可下載後自動解壓
- build 時, 不會刪除 dist/.git, 導致 deploy commit 堆疊
  - 可於 deploy.sh 追加指令, 將 commit 改為 --amend 的方式來處理
- deploy 到 gh-pages 這類 path 非 root 的地方時, 同樣要設定 base 路徑
  - 但不需要像 webpack 那樣區分出 dev 與 prod 的 base path, 同樣能於本機運行
  - 即使在 dev 模式將 base 設為 "/<REPO>/" 也不影響本機端運行, vite 會自動改為 "http://localhost:3000/<REPO>"
- 對於 path 的處理方式似乎微妙的與 webpack 有些不同
- Phaser load 圖片等資產時, path 設為絕對路徑 "/", deploy gh-pages 會抓不到
  - 可將 path 由 "/img/xxx.png" 改為 "img/xxx.png" 讓瀏覽器去自動匹配當前 path
  - 這邊直接改用相對路徑 "./img/xxx.png" 在 dev 模式運行時, vite 也能找到 file
  - 可能是 Phaser load 的寫法沒有被判定成 path, 所以 import 的模式會完全比照瀏覽器運行的情況
  - 不確定 webpack 是否會有其他狀況出現