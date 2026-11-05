# Rehearsal: MapleDiff

Gold: Benji Taylor's `hero-demo` from https://github.com/benjitaylor/skills, commit `ccb6a382ae0bd3c9bdfc010d7fdfaec23ee2be21`. Copied its example folder and kit. Kept the measured targets, Stage, browser geometry, readable crop and cursor. Replaced dashboard/annotations/terminal with MapleDiff's URL form, captured revisions and a real-shaped patch diff. Borrowed the `loading` example's stable loading/result state idea.

Medium: once-in-view, about 12 seconds, then hold the resulting diff. Replay is the explicit restart; there is no automatic loop or hidden data rewind. The whole scene is an illustration with example notes and makes no registry requests.

Beats: original snapshot → paste source link → save/pending/saved → compare → copy → hold. Poster shows the finished comparison. A static-view control and reduced-motion media query show that poster without motion. Fake controls are hidden from the accessibility tree; real playback controls are keyboard accessible.

Captured: 600px scene and compact 358px design in a 390px viewport, light product theme; opening, payoff, all marked states; 60ms compare samples at slow 4; copy glyph at 4x; reduced-motion poster. Host page checked at 1440 and 390, and resized between layouts. Production iframe verified for completion, Replay, Show still/Play preview and reduced motion. Actual registry/import/comparison workflow passed its existing browser checks after the page polish.

Gate: wide and phone `film.mjs --gate` end `rehearsal passed (necessary, not sufficient: references/verify.md and the fresh eye in review.md still stand)`. Zero never-intentional findings remain. Contact-sheet recordings report sampling gaps correlated with screenshot capture; those motion intervals are inconclusive, not an all-clear. A separate no-screenshot `jumps.mjs` pass of the final phone composition recorded 842 frames / 14.00 seconds, largest gap 22.8ms, complete coverage, `jumps: no-issues-detected`. The two manual items are the line number and deletion marker acquiring their diff meaning after Compare; the transition was inspected in the close samples.

Film findings fixed: filename and code-gutter insets; equal document padding; growing field width when labels changed; icon state popping; icon slot size; layering of the arriving diff line. Input paste is intentionally atomic, following its visible Cmd+V keycaps, marked only on the changing text spans.

Fresh-eye review: initial sparse code pane and overly strong completed Saved button were both fixed. The new pane includes Hero, Raging Blow, damage and target details; Saved settles to secondary ink while the colored diff becomes the payoff. Reviewer re-inspected wide/phone films, 60ms compare frames and 4x copy glyph and returned “nothing”.

Checks: skill `npm run typecheck` and `npm run check:css` passed; production source typecheck/build passed; CSS namespaces are scoped; ordinary UI/reduced-motion/playback browser smoke checks passed. Generated recordings and dependencies are excluded from source commits.

Not checked: physical phone hardware, Safari/Firefox, a separate close film of every paste/save/copy transition, and an automatic loop seam (not applicable to play-once). Timing coverage in the screenshot contact sheets is explicitly limited above; no claim is made that those gaps were sampled.

## MapleStory material revision
The user supplied their prepper-app UI and MapleStory Legion as references. Updated the scene and host to charcoal, cream, silver rims, teal utility buttons, lime save action and bright inset URL fields. The script and measured targets remain unchanged; wide controls/output spacing was reduced by 14px total to avoid the completed document nearly touching the crop edge.

New source films: 600px wide opening through result at 1s intervals, and 390px phone marked states. Both source gates passed with zero never-intentional findings. Screenshot recordings remain timing-inconclusive: phone 884 frames/14.78s, largest gap54.8ms; final wide825 frames/13.76s, largest gap53ms. Motion in those gaps was not judged. The line-number/deletion-mark changes still require manual transition judgment; the script is unchanged from the earlier close inspection. Production-minified CSS generates phantom kit-override scanner reports for absent phone components, so the source route was used for instrumentation; production was checked separately for functionality, compact fit and reduced motion.

Fresh-eye reviewer inspected new phone states, wide film and desktop/mobile host screenshots and returned “nothing”: no clipped controls, legibility or fit issues. New 40–80ms close transition captures and 4x glyphs were not inspected in this material-only revision; loop seam remains inapplicable to play-once. Static screenshots cannot establish complete motion coverage.
