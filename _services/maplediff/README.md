# MapleDiff registry service

Durable anonymous URL imports for the GitHub Pages viewer in `/lab/maplediff/`.

The live Worker runs on Sites, project `appgprj_6aebdcbec58c8191bd51fe2489c5d115`. Preserve this project ID and the `BUCKET` R2 binding to keep snapshots across redeployments. Hosted source repository is maintained separately by Sites; this directory is a portable source copy for review and maintenance. Never commit or expose the short-lived source Git credential.

Run `npm ci`, `npm test`, then `bash scripts/build.sh`. The esbuild bundle is generated as `worker/index.js`; build artifacts are under `dist/server/index.js`. The Worker archive has `.openai/hosting.json` at the root and `dist/server/index.js`. Push the exact source state to the Sites source repository before saving that state and deploying with native Sites tools. The manifest enables a managed R2 bucket. No external account credentials or visitor sign-in is required.

See the frontend README for source support, data model, routing limitations, and operational limits. Access is intentionally public per the product requirement. Article contents are fetched server-side from approved public publishers and stored as immutable Markdown snapshots. There is no manual text mutation endpoint.
