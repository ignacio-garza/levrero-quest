# Levrero Quest

A study game for Levrero's Monetary Economics course (intermediate exam scope): recall rounds with XP, combos and spaced repetition, plus separate mini-essay practice for the questions the lecturer flagged.

## Run

```
npm install
npm run dev       # local dev server
npm test          # logic + UI smoke tests
npm run build     # validates the question bank, typechecks, builds to dist/
```

## Editing the content

- `src/data/questions.json`: the question bank. For `mc` questions, **`options[0]` is the correct answer** (the UI shuffles). Types: `mc`, `tf`, `match`, `gen` (numeric, generated in `src/game/generators.ts`). Set `"verified": false` on anything built from reconstructed notes.
- `src/data/essays.json`: mini-essay cards with the key-point checklist. The Sidrauski card is a stub until it is covered in class.
- `npm run validate` checks ids, topics, sessions and shapes, and runs automatically before every build.

## How learning works

Each question lives in a Leitner box (1–5). A correct answer moves it up, a wrong one sends it back to box 1. Rounds sample questions with weights favouring unseen and low-box ones; boxes 4–5 count as mastered. Progress is stored in the browser's `localStorage` only.

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml` (tests, build, publish to GitHub Pages). In the repo settings, Pages source must be "GitHub Actions".
