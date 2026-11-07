# NYshift favicons and social previews

The public NYshift pages share one unchanged vector logo and crawler-readable Open Graph/Twitter metadata. Every individual skill gets its own title, description and 1200×630 PNG. Home, The Lab, MapleDiff and the skills catalog have branded product graphics. Existing saved MapleDiff pages are prerendered with article-specific metadata; query parameters selecting revisions remain available to the original app.

`head.cjs` is also used by the skills page generator, so rebuilding the catalog preserves share metadata and icon links. `build.cjs` updates the primary page heads and creates saved-entry pages from `saved-entries.json`. `render.cjs` uses Chromium to rasterize the coded graphic layouts and the existing logo. `icons.py` creates the legacy/root icon formats, including ICO, 16/32px PNG, opaque 180px Apple touch icon, and 192/512px Android icons. No logo redesign is performed.

## Build

Install this folder's locked Node dependencies and `requirements.txt`, and the skills-library build dependencies. Chromium must be available as `/usr/bin/chromium` or through `CHROME_PATH`. Run `npm run build` here. The existing saved-entry list is a build input; update it from the public registry before a refresh when new articles should get their own static share pages.

GitHub Pages cannot generate crawler metadata for a newly created client-side URL on demand. The two existing saved pages are included in this release; future imports get the existing app/fallback behavior until their pages/cards are generated and published. These files do not add a scheduler or change the importer. Never claim that updating head tags in browser JavaScript creates an iMessage preview.

Share images use versioned filenames, favicon links use a new query version, and legacy root icons are replaced so Apple/Safari/fallback requests receive the NYshift mark. iMessage can retain an older preview for an already-shared URL; its cache is controlled by Apple.

All metadata is in the initial HTML, with absolute HTTPS image URLs, titles/descriptions, canonical URLs, site name, image dimensions/type/alt text and large-image Twitter tags. No social crawler needs JavaScript to see them. The iframe demo and 404 page retain their noindex directives. Retired tools URLs retain redirects and use their destination's metadata.

The preview artwork is rendered from HTML/CSS/SVG using the existing brand and illustrative interface elements. The diff graphic labels previous/updated text without inventing game balance numbers. Skill authors remain credited on each skill card.

## Validation

Initial-HTML checks passed for 52 page heads, 50 existing PNGs at 1200×630, canonical URLs, image/type/alt fields, large-image Twitter tags, and new favicon links. ICO frames and the PNG/Apple/Android sizes were inspected. Contact sheets were reviewed for main pages, a long skill title and a long saved-patch title. Browser smoke checks passed for primary pages, skill search, the saved-entry route and pinned revision, with no application errors. Real iMessage rendering is not emulated by these tests; the supplied metadata follows its Open Graph/link-preview inputs.
