# MapleDiff walkthrough

React + plain CSS product illustration built with Benji Taylor's Stageshow kit, isolated in a same-origin iframe on the static MapleDiff page. The real utility remains vanilla JS and uses the shared registry service. The walkthrough has no network requests to the registry.

Run `npm ci`, `npm run typecheck`, `npm run build`. Outputs are `lab/maplediff/demo/showcase.js` and `showcase.css`; commit those with the source because GitHub Pages serves static assets directly. The kit is copied here so the source is self-contained. Its bundled third-party asset license/source files are preserved, though the shipped scene uses no third-party brand marks.

`src/MapleDiffDemo.tsx` owns the scene and beat script; `src/hero.css` scopes its product styling; `src/main.tsx` owns the real Replay and static-preview controls; `src/host.css` styles that small host. The outer page's polish is `lab/maplediff/design.css`.

Sources: [Stageshow by Benji Taylor](https://benji.org/stageshow), [upstream code](https://github.com/benjitaylor/skills). Stageshow's package declares MIT. The audit/polish workflow uses [Unslop by Damir Sokolovsky (@heydamir)](https://github.com/heydamir/unslop), CC BY 4.0; credit is preserved in DESIGN.md and the page CSS. See DESIGN.md for the direction and nine passes, REHEARSAL.md for captures, fixes, review and limits.
