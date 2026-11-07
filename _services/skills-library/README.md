# NYshift skills library

Public route: https://nyshift.com/skills/

This is a static catalog of the 44 skills already pinned under `.agents/skills`. It does not mirror the larger UI Skills registry. UI Skills (https://www.ui-skills.com/) informed the browsing concept; the page uses NYshift's dark, acid-green visual language and existing mark. The collection's authors, original descriptions, provided license files and pinned source links remain visible.

## Build

Install build dependencies in this folder with `npm ci` and `python3 -m pip install -r requirements.txt`, then run `npm run build`. Python exports metadata using PyYAML and preserves raw bytes. Node renders readable pages using Marked. No runtime dependencies, external fonts, analytics or authentication are required by this page.

Generated files in `/skills`:
- `index.html`, plus one static reading page for each skill.
- `raw/<name>.txt`: byte-exact SKILL.md instructions, served as text; browser downloads name them SKILL.md.
- `licenses/<name>.txt`: supplied top-level license files, where present.
- `downloads/nyshift-design-skills-<pin>.zip`: the full `.agents` tree, including references, scripts, assets and license files.
- `registry.json`, `registry.txt`, `llms.txt`: discoverable metadata and direct links for tools/agents.

The original .agents folders stay authoritative for CLI installation: `npx skills add kevingsp/kevingsp.github.io --skill <name>`. The download links distinguish instructions-only Markdown from full-folder installs.

`.nojekyll` at the repository root makes GitHub Pages copy static files without interpreting the YAML frontmatter inside raw skill instructions. This preserves the files' contents and prevents Jekyll from evaluating Liquid in third-party instructions. Existing NYshift and MapleDiff routes are static HTML/JS/CSS. No application logic was changed.

## Implementation notes

Search, author and purpose filters preserve state in the URL. All skill links and downloads work without JavaScript; search and clipboard actions enhance them. Native links, inputs, selects and buttons support keyboard use. No animation is needed for this reading/browsing surface. Existing sentence-case NYshift copy takes precedence over the collection's generic Title Case rule.

Markdown HTML is escaped. Links are restricted to HTTP(S), mailto or local anchors; relative links resolve to the pinned source folder. Markdown images are rendered as links rather than loading remote assets. Code and tables can scroll within their containers. Native clipboard failures produce a clear status message rather than claiming a successful copy.

Regenerate after deliberately updating the source skill collection. The current collection's full source and commit are in `.agents/upstream.json`. Installing skills or scripts remains a separate user action; browsing this site never executes them.

## Validation for this release

- All 44 static reading pages, raw instruction files and provided license links returned successfully in the local preview.
- Native downloads, both clipboard actions, combined author/category/search filters, empty/reset states, URL restoration, keyboard entry and no-JavaScript browsing passed browser checks with no application errors.
- The full ZIP contains 506 files. Every archived file and raw Markdown export matches its source bytes; the registry publishes SHA-256 hashes.
- Screenshots and layout checks cover 320, 375, 768, 1024 and 1440px, the 479/480/481, 759/760/761, 999/1000/1001 and 1439/1440/1441 breakpoint edges, short landscape and 200% root text. The enlarged-text review found and fixed squeezed hero/reader columns. Unicode arrow glyphs were replaced with SVGs to avoid missing-font squares. Small footer/metadata link targets were enlarged.
- The viewport scanner's clipped `.sr-only` labels are intentional accessibility hiding. The contrast scanner flags the search input's borderless inner box; its visible enclosing label supplies the border and focus ring. Body text passed the composited contrast scan. The enclosing search border is measured separately against the field surface.
- Marked escapes source HTML, renders remote images as links, and rejects unsafe link protocols. All 44 rendered articles were checked for injected executable elements or unsafe URLs.
- A direct browser capture of ui-skills.com was blocked by the cloud browser's certificate trust; its live HTML/catalog was inspected through the trusted HTTP client. No pixel-exact matching claim is made. Physical phones, Safari and Firefox were not tested.

## Social sharing

The page shell uses `../social-preview/head.cjs` for shared icon links, canonical URLs and per-skill Open Graph/Twitter metadata. After changing card titles or descriptions, run the social-preview build as well to refresh its 1200×630 PNGs. Rebuilding the catalog preserves the social tags automatically.
