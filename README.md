# ClipGenius

**An experimental content-ideation dashboard for creators.**

ClipGenius explores ways to research trends, develop short-form video ideas, and plan creator content through a browser-based dashboard. This repository is a work in progress, not a production-ready or independently validated AI product.

## Tech stack

- Vanilla JavaScript, HTML, and CSS
- Vite 5 for frontend development and builds
- Node.js and Express for API endpoints
- SQLite integration through `better-sqlite3`
- Capacitor-related scripts for potential iOS packaging

## Getting started

Prerequisites: Node.js and npm.

```bash
npm install
npm run dev
```

This starts the Vite frontend and the Express backend concurrently. For separate processes:

```bash
npm run dev:frontend
npm run dev:backend
```

Build the frontend with `npm run build`.

## Important current limitation

The backend in `server/proxy.js` uses a **hard-coded Windows filesystem path** for a shared SQLite database. As a result, some product-intelligence endpoints will not work against your own data on another computer without configuration changes; a missing database can return empty metrics. The project should be made portable before presenting it as a deployable product.

External trend endpoints also depend on third-party availability. No automated production reliability or deployment claims are made here.

## Portfolio context

This project demonstrates experimentation with creator tooling, frontend dashboards, Node.js APIs, and local data integrations. It is a development project, so please evaluate its implementation and limitations rather than assuming every advertised idea is finished.

## Next improvements

- Replace the hard-coded database path with an environment variable
- Document endpoint requirements and data sources
- Add screenshots from a working local installation
- Add automated tests and a reproducible setup
- Review security and deployment settings before publishing a hosted demo
