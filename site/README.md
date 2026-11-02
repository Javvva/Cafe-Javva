# Cafe Javva docs

Next.js docs site for the club's NCL writeups. The pages live in `content/docs`. Original notes in `../Docs` stay on your computer and are not part of the repo.

```bash
npm install
npm run dev
```

Open http://localhost:3000. Docs are at http://localhost:3000/docs. Ctrl+K searches the full text.

To add a challenge, follow `content/docs/getting-started/add-a-writeup.md`. If the original notes are still in `../Docs`, `scripts/import-docs.mjs` can regenerate the imported pages from them and will overwrite those files.
