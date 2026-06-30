# Avnik

Avnik is a personal operating system for focus, reflection, and action. It combines a coach experience, task planning, a private journal, and memory-backed insights into one calm workspace.

## What is working
- Hydration-safe journal and coach flows with local persistence for drafts, messages, and mode.
- A coach experience with task and planning side effects that feed the app’s task and day-plan store.
- A private journal with recent entries and mood-aware saving.
- Home, insights, tasks, profile, and settings screens wired to the shared memory layer.

## Run locally
```bash
npm install
npm run dev
```
Then open http://localhost:3000.

## Validate
```bash
npm run build
```

## Project structure
- app/ — app routes and pages
- components/ — UI and experience components
- lib/ — shared memory, types, and agent helpers
- features/ — product and roadmap documentation

## Notes
The app uses local storage for MVP persistence and is ready to be connected to a remote backend later.
