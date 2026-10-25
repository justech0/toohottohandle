# SDD ledger — plan: docs/superpowers/plans/2026-10-25-thth-qr-v0-gorunur-menu.md
Spec: docs/superpowers/specs/2026-10-25-thth-qr-menu-design.md (2.6)
Pre-flight: T3 consumes T2 seed shape (groups/categories/products/extras/settings) — consistent. T5/T6 consume T3 getMenu/priceLabel/textOn(T4) — consistent. T10 consumes T4 Logo paths — consistent.
Ruling: tests run in Vercel sandbox thth-qr-dev, not locally (npm blocked here); task-done script not usable — ledger lines written by hand with sandbox command + result — cost if wrong: none, evidence is sandbox logs.
Ruling: code reaches sandbox via push of branch qr-menu + git pull in sandbox (repo still public) — cheaper than base64 tarballs — cost if wrong: Vercel builds preview deploys of qr-menu (harmless).
Task 1: Ruling: e2e asserted #hot visible, but #hot is an SVG def used via <use> — assert #stage visible + #hot attached — cost if wrong: none
Task 1: complete (commits cde4ae3..39f7283, tests: sandbox npm run build && npm run e2e → 4 passed)
Task 2: complete (commits 39f7283..b97f11f, tests: sandbox npx vitest run → 7 passed; RED seen: ENOENT menu.json)
Task 3: complete (commits b97f11f..8336bf5, tests: sandbox npx vitest run → 23 passed; RED seen: modules missing)
Task 4: complete (commits 8336bf5..0be37c7, tests: sandbox npx vitest run → 26 passed, build ok; RED seen: modules missing)
Task 5: Ruling: Next build type-checks tests/ so a RED test commit breaks the build; exclude tests/ from tsconfig (vitest/playwright compile their own) — cost if wrong: test type errors surface only when tests run
Task 5: complete (commits 0be37c7..21bddaa, tests: sandbox vitest 27 passed + build ok + playwright 6 passed; RED seen: date module missing, /qr absent)
Task 6: Ruling: 'tabs ≥44px' and 'no horizontal scroll' passed at RED (vacuous / regression guard) — tabs test now asserts tabs exist; overflow test kept as regression guard — cost if wrong: none
Task 6: complete (commits a9e72a5..6d125d9, tests: sandbox playwright 12 passed (list 6/6); RED seen: 4 failed; visual check s1 390px ok after stacking prices)
Task 7: Ruling: getByRole name 'Ara' matched product buttons (Caramel…) — use exact:true — cost if wrong: none
Task 7: complete (commits 6d125d9..9dbf69f, tests: sandbox playwright 16 passed; RED seen: 4 failed)
Task 8: complete (commits 9dbf69f..2985395, tests: sandbox playwright 20 passed; RED seen: 4 failed)
Task 9: Ruling: outside-tap test passed at RED vacuously — now asserts card visible first — cost if wrong: none
Task 9: complete (commits 2985395..cd2a990, tests: sandbox playwright 24 passed; RED seen: 3 failed)
Task 10: Ruling: intro timer started at hydration and missed 1.2 s on slow hydration — timeline moved to CSS from first paint, removal measured with performance.now() from page open — cost if wrong: on very slow loads intro may be cut short (menu still usable)
Task 10: Ruling: two intro tests passed at RED vacuously — now assert intro visible/attached first (goto waitUntil commit) — cost if wrong: none
Task 10: complete (commits 784cf5f..3d96a72, tests: sandbox vitest 31 passed, playwright 28 passed, intro spec 3/3 runs green; RED seen: hotWave module missing, intro 2 failed)
Task 11: complete (commits 3d96a72..7e9dabe, tests: sandbox vitest 31 passed, playwright 32 passed (incl. screens), local+public /qr 200, visual check combo intro/menu/detail/wifi ok)
Final review: done (opus; fable had no credits). Critical 0, Important 5. Fix pass NOT started (paused by user, limit).
Final: TODO fix 1 back with search/wifi leaves /qr — history entry {overlay:'search'|'wifi', sheet?} pushed on open, every close = history.back(), popstate derives panel+sheet; on mount replaceState to strip stale overlay/sheet. e2e: wifi→back, search→back, search→result→back→back stay on /qr.
Final: TODO fix 2 WiFi card no close control — add 44px icon button aria-label "Kapat" (closes via back). e2e.
Final: TODO fix 3 intro pre-hydration — white lockup in full-viewport layer (.intro__logo--bottom) with clip-path animated in sync with floodRise (inset 100%→50%), red copy unclipped, drop JS clip; remove on animationend(introOut/introFade) of .intro itself (+ if visibility already hidden at mount → gone); wave phase from mount time; reduced motion in @media CSS (flood/wave/logo animation none, introFade .28s with visibility hidden, beats global rule by specificity); global rule add animation-iteration-count:1 !important; drop intro--reduced class. RED tests: block /_next/static/chunks/*.js → white visible region top ≈ flood top at 800ms; delay CSS 600ms → min opacity <0.5 before removal; reduced+blocked JS → flood::before animationName none and .intro animation introFade 0.28s.
Final: TODO fix 4 sold-out contrast — drop .row--out opacity, name ink-soft, Tükendi red-text full. e2e: add row--out/price--out via evaluate, compute effective contrast ≥4.5.
Final: TODO fix 5 strip last categories at 768/1440 — jumpTarget ref kept in scroll update until wheel/touchstart/keydown/pointerdown. e2e 1440×900: click group "Paket & Atıştırmalık" → Paket Kahve current; click "Kasa Önü" → current.
Final: minor (deferred): stale sheet after reload (folded into fix 1 if done); double back on double close; focus not restored + search no focus trap; no scroll lock/overscroll on sheet, grip without swipe; safe-area on strip/list/search bar; html suppressHydrationWarning; tap-highlight transparent; "Geç" 4.0:1 + placeholder colour; font roles (sheet title/SSID Unbounded, mono WiFi); <560px sizes stacked hides "·", Kopyalandı not green-text, logoUp to centre; no h1; strip offsetLeft (.strip__row position:relative); test gaps (no WebKit project, sold-out render, search+sheet back).
Resume: sandbox sbx_WA8F… stopped — recreate from named sandbox thth-qr-dev (create_sandboxes_v4), /vercel/r.sh helper; then fix pass, suite, finishing-a-development-branch (ask before merge).
