# MapleDiff material design review

## User direction and reference
The user requested MapleStory-inspired teal and black, skeuomorphic glass surfaces and bubbly buttons, supplied their meal-app mockup and a MapleStory Legion screenshot, and identified https://github.com/kevingsp/prepper-app as the reference repository. This direction supersedes the earlier light, orange archival theme and Unslop's default preference for flat surfaces.

## What is built in prepper-app
Reviewed master source, not a running deployment. `src/App.js` imports `App.css` and renders the meal input, ingredient rows, Add another, bottom sheet and saved meals. `src/App.css` implements charcoal backgrounds, 13px rounded controls, teal gradients (#26a4ba to #1b7b86), black raised remove buttons, lime gradients (#a3c127 to #7a9a02), cream gradient saved titles and an outlined bottom sheet. The UI is implemented in code; README is still Create React App boilerplate.

The supplied mockup goes further than that implementation: IngredientInput only assigns ordinary input-field classes; it has no filled-field class to switch populated ingredients to the pictured bright white/teal treatment. App.css repeats bottom-sheet, app-container and get-macros rules, and index.css adds competing input/button rules. Do not copy the cascade wholesale. This review does not establish that the reference app's nutrition API or deployed build works. No files in prepper-app were changed.

## Applied to MapleDiff
- Charcoal ground, cream headings and teal navigation/selection ink.
- Silver double-edged window and panel frames, hard chrome reflections and recessed dark wells, informed by Legion's framing.
- Bright inset URL field, rounded teal utility controls, lime Save snapshot button and restrained pressed feedback.
- Quiet document surface with dark semantic red/green rows and visible + / minus marks; these colors describe textual changes, not buffs/nerfs.
- Registry, revision selectors, downloads and Stageshow preview use the same material family. The hero's example notes remain illustrative and never enter the public registry.
- Existing section order, public-save disclosure, import API, permanent URLs, revision logic, search, worker and downloads are preserved.
- Visible keyboard focus, readable metadata, reduced-motion poster/playback controls and a compact mobile layout.

## Validation
Production showcase typecheck/build, upstream CSS namespace check and typecheck passed. Browser workflow checks passed for importing, pinned snapshots, revisions, unified/split comparison, filtering, search, safe text rendering, Markdown/diff downloads and mobile overflow. Production animation completed; Replay, static toggle and reduced-motion poster passed. Desktop and phone host screenshots were inspected; an iframe color-scheme mismatch causing a white backdrop was found and fixed. Wide scene spacing was tightened to leave a clear gap beneath the completed diff. Color pairs were checked, including lime action text, teal controls and muted text. Placeholder text was darkened for the inset field.

Fresh-eye Stageshow review found no visual issues in desktop/phone frames. See REHEARSAL.md for motion coverage limits. Physical mobile hardware, Safari and Firefox were not checked.

## Attribution
Unslop by Damir Sokolovsky (@heydamir), CC BY 4.0: https://github.com/heydamir/unslop . Its spacing/readability review informed this work; explicit user material preferences take precedence over its flat-surface defaults.

Stageshow by Benji Taylor: https://benji.org/stageshow and https://github.com/benjitaylor/skills . Vendored kit retains upstream code and bundled license files; package declares MIT. Composition derives from hero-demo; fake import/loading/comparison/copy states are adapted to MapleDiff.
