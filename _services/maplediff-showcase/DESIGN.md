# MapleDiff design review

Mode: polish. Preserve the existing palette, system font, functionality and section order. The hero walkthrough is the separately requested Stageshow addition.

Audit: decorative star and all-caps eyebrow; a rotated card that didn't explain importing; 10px archive metadata; arbitrary spacing; pill counts; an unexplained command glyph; wordy download/search labels.

Product: save public MapleStory patch articles and compare captured revisions.
Character: precise, approachable, archival.
World: patch documents and update history.
Moments: red/green diff content, and one product walkthrough.
Signature: line-number gutters with restrained Maple-orange action/selection ink.

Passes, in order:
1. Spacing: 4px rhythm, grouped sections, 44px import controls.
2. Color: existing neutrals retained, three text roles, orange actions, semantic diff colors.
3. Icons: remove decorative star/command glyph; the scene uses Lucide at a consistent stroke.
4. Copy: specific MapleStory headline, sentence-case labels, shorter controls, public-save disclosure retained.
5. Type: system family retained, 400/500/rare 600 weights; 14px archive titles and 12px metadata.
6. Layout: section order preserved; readable split hero with a compact scene.
7. Details: quiet counts, visible focus, matched controls, neutral hover states.
8. Visual: the requested coded product preview, no generated image or fabricated registry data.
9. Motion: once-in-view walkthrough with an explicit Replay and static-view option; reduced motion shows the finished comparison.

## Attribution
Unslop by Damir Sokolovsky (@heydamir), CC BY 4.0: https://github.com/heydamir/unslop . This report adapts its review/pass structure and preserves its credit.
Stageshow by Benji Taylor: https://benji.org/stageshow and https://github.com/benjitaylor/skills . Vendored kit retains upstream code and bundled asset license files; package declares MIT. The starting composition was copied from `hero-demo`; loading and state changes were adapted to MapleDiff. Example damage values are illustrative and never saved into the registry.
