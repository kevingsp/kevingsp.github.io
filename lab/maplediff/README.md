# MapleDiff

Public patch-note registry at https://nyshift.com/lab/maplediff/.

Paste an article URL and save an immutable, timestamped Markdown snapshot. Reimporting unchanged content reuses the original snapshot. Changed content creates a new revision. Saved links include the selected content hash so opening a link later preserves that exact revision. Readers can compare revisions of the same article or separate saved patches, search diff lines, switch unified/split layouts, and download Markdown or a unified diff.

## Hosting

The UI is static on GitHub Pages. The URL importer and durable R2 registry run on Sites at `https://nyshift-maplediff-registry.daring-rhino-7025.chatgpt.site` (project `appgprj_6aebdcbec58c8191bd51fe2489c5d115`). There are no GitHub credentials in the browser, and no account is required. Data is shared publicly across browsers, devices, and visitors. Local storage is not the registry.

`404.html` recognizes only `/lab/maplediff/<20-hex-entry-id>/` and loads the static application with the original revision/comparison parameters. The application restores the pretty URL. On GitHub Pages the first deep-link request returns HTTP 404 before the browser redirect; loading the app then returns 200. Social crawlers that don't execute JavaScript may not preview these links. Real HTTP-200 dynamic routes would require moving these paths behind a dynamic host.

The backend source and deployment manifest are maintained in its Sites source repository; a portable copy lives under `_services/maplediff/` in this repository. Keep the project ID and R2 binding when redeploying so snapshots survive deployments. The native Sites save/deploy operations publish a built Worker archive. Do not put a Sites source credential in this repo or in client JS.

## Imports

Supported: modern GMS Nexon article URLs (via the publisher's public CMS), legacy GMS URLs that redirect to supported articles, KMS Nexon HTML news articles, MapleSEA updates, and Orange Mushroom dated posts. Only approved HTTPS article hosts and paths can be fetched; every redirect is checked again. Some publishers may block imports or change their page structure; failed imports show an error and do not save an empty snapshot. Browser-only/dynamic sources other than GMS may need a dedicated adapter later. Image-only content is not OCR'd. Screenshots without image alt text won't become text.

The HTML parser discards scripts, navigation, forms, and surrounding chrome, then extracts headings, text, links, lists, and table cells. Capture time is when MapleDiff saved the article, not proof of its original publication time. The original source is always linked. The extractor version and SHA-256 content hash are stored with every revision. Reimporting an identical revision retains its first capture timestamp.

## Limits and operations

300,000 Markdown characters / 8,000 lines per snapshot; 1,000 unique revisions per article. Source responses are capped at 2 MB and timed out. Anonymous writes are restricted to approved origins, approved article URLs, and one import per client IP per 10 seconds using conditional R2 writes. Origins are not user identity; content-addressed immutable writes prevent visitors overwriting older snapshots. There is no public edit/delete endpoint. Rate keys store a hash rather than the IP address.

Comparisons use exact Hirschberg LCS in a browser Worker with linear memory. The UI shows up to 1,500 diff rows at once; search examines all rows and downloads include the complete diff. Line endings and final newlines are normalized. Added/removed colors show textual edits, not necessarily buffs/nerfs.

Run engine checks with `node diff.test.cjs`. The backend includes extraction, source validation, snapshot immutability, deduplication, retrieval, CORS, failed-import, and rate-limit tests. Site frontend and backend have separate deployment workflows: deploy and smoke-test the API before changing the frontend endpoint.

## Design and walkthrough

`design.css` applies a restrained Unslop polish while preserving features, section order and the original palette. The hero's same-origin `demo/` iframe is an illustrative, play-once React walkthrough made with Benji Taylor's Stageshow kit. Replay and a static-view control are real; the UI inside the scene is a demonstration with example notes and never writes to the registry. Reduced-motion viewers see the final comparison. Source, build instructions, credits, audit and rehearsal notes live under `_services/maplediff-showcase/`.
