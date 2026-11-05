# MapleDiff

Static MapleStory patch-note comparison tool at `/tools/vibe-coded/maplestory-patch-diff/`.

Paste original and updated notes, then compare. Includes unified/split layouts, line search, changes-only filter, swap, local draft persistence, and a unified `.diff` download. The built-in demo is fictional and labeled as such. Official notes are not fetched automatically; paste text from the regional publisher's notes.

All processing happens in the browser; there are no packages, build steps, external scripts, API keys, or backend. Serve this directory using any static server or GitHub Pages. Drafts use the `kgs-maplediff-v1` localStorage key. Clear removes the saved text. A storage failure does not prevent comparison.

Line endings and the final newline are normalized. Downloads represent the normalized text (LF with a trailing newline). Limits: 200,000 characters and 2,000 lines per version. The exact LCS algorithm uses at most approximately 8 MB for its comparison table. A modified line counts as a removal plus an addition; colors do not indicate buffs or nerfs. Search matches entire lines, ignoring case; split view keeps the paired line visible for context.

Run engine tests with `node diff.test.cjs`.
