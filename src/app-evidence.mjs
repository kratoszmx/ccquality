// Reviewed through ATT on 2026-10-19. Collection is not a published ban rule.
// These references are static report metadata, never extra requests during a run.
export const REFERENCES=Object.freeze({
  privacy:{url:'https://www.anthropic.com/legal/privacy',title:'Anthropic Privacy Policy',reviewedOn:'2026-10-19',effectiveOn:'2026-09-10'},
  safeguards:{url:'https://support.claude.com/en/articles/8241253-safeguards-warnings-and-appeals',title:'Safeguards warnings and appeals',reviewedOn:'2026-10-19'},
  electronLocale:{url:'https://www.electronjs.org/docs/latest/api/app#appgetpreferredsystemlanguages',title:'Electron system languages and locale',reviewedOn:'2026-10-19'},
  browserLanguage:{url:'https://developer.mozilla.org/en-US/docs/Web/API/Navigator/languages',title:'Navigator.languages',reviewedOn:'2026-10-19'},
  storage:{url:'https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage',title:'Origin-specific localStorage',reviewedOn:'2026-10-19'},
  session:{url:'https://www.electronjs.org/docs/latest/api/session',title:'Electron sessions and cookies',reviewedOn:'2026-10-19'},
});

export const APP_EVIDENCE=Object.freeze({
  score:{label:'網站自訂，非機率',kind:'heuristic',refs:['safeguards'],detail:'未找到這些網站分數對 Claude Desktop 封號的驗證。官方列出的停權原因包括政策、條款及不支援地區註冊；沒有公布此分數。'},
  regional:{label:'網站推測',kind:'heuristic',refs:['safeguards'],detail:'中文／區域組合權重由網站自訂；沒有查證到 Claude App 採用相同規則。'},
  timezone:{label:'間接：官方收集',kind:'indirect',refs:['privacy'],detail:'官方隱私政策明列時區設定。此處讀取同一台 Mac 的瀏覽器時區，可作環境參考；App 實際送出的值與封號權重未驗證。'},
  offset:{label:'間接：時區衍生',kind:'indirect',refs:['privacy'],detail:'UTC 偏移由系統時區與日期衍生；UTC+8 加分是網站規則，並非官方停權門檻。'},
  language:{label:'僅 Chrome',kind:'browser_only',refs:['browserLanguage','electronLocale'],detail:'這是新建 Chrome 的語言偏好。Electron 的系統語言與 App locale 有不同 API，不能把此值當成 Claude App 的語言。'},
  locale:{label:'僅 Chrome',kind:'browser_only',refs:['electronLocale','browserLanguage'],detail:'Intl locale 是本次 Chrome 的執行環境值，未在 Claude App 驗證；網站對 zh-TW 等值的加分是自訂判斷。'},
  script:{label:'網站推測',kind:'heuristic',refs:['safeguards'],detail:'把繁體或簡體文字偏好視為封號線索是網站自行推測；沒有官方 App 規則佐證。'},
  fonts:{label:'網站推測',kind:'heuristic',refs:['safeguards'],detail:'網頁可探測部分字體，但中文字體加分及權重沒有官方 App 封號依據；各站對 macOS 預裝字體的處理不同。部分網站引用 Claude Code 的分析，不能據此推定 Desktop 採用相同規則。'},
  vendorFonts:{label:'網站推測',kind:'heuristic',refs:['safeguards'],detail:'廠商／軟體字體與帳號封禁的關聯及權重未獲官方證實。'},
  webview:{label:'僅 Chrome',kind:'browser_only',refs:['privacy','session'],detail:'官方列出瀏覽器資訊這類資料，但本次 UA／WebView 判斷屬於測試 Chrome，不能代表 Claude App 的 Electron 容器。'},
  device:{label:'網站推測',kind:'heuristic',refs:['privacy'],detail:'官方列出裝置類型，沒有公布國產品牌加分規則；網站從 Chrome UA 推測品牌，也未驗證 App 會送出相同資料。'},
  platform:{label:'間接：官方收集',kind:'indirect',refs:['privacy'],detail:'官方列出作業系統與裝置類型。同機的 macOS 資訊可間接參考，但瀏覽器版本與 App 不同，沒有公開封號權重。'},
  emoji:{label:'網站推測',kind:'heuristic',refs:['safeguards'],detail:'Emoji 渲染或作業系統代理加分是網站推測；沒有查證到官方 App 採用這些門檻。'},
  automation:{label:'僅測試 Chrome',kind:'browser_only',refs:['session'],detail:'這個自動化標記來自採集器的 headless Chrome；不表示你用的 Claude App 是自動化瀏覽器。'},
  storage:{label:'僅本站，無關 App',kind:'site_only',refs:['storage','session'],detail:'此頁 Cookie／localStorage 的能力屬於測試站來源與 Chrome session，不能驗證 Claude App 的登入或儲存。'},
});
