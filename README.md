# One Piece Ontology Explorer

A fully static One Piece ontology web app designed for GitHub Pages.  
It includes searchable entities, category filters, a details panel, and interactive relationship exploration.

## Features

- Search across entity names, summaries, tags, and key attributes.
- Filter by ontology category:
  - Character
  - Crew
  - Island
  - Organization
  - Devil Fruit
  - Event
- View structured entity details.
- Explore linked relationships in both list and graph form.
- Uses meaningful, interconnected seed data from the One Piece world.

## Local run instructions

1. Clone the repository.
2. Start a static server in the repository root:
   - Python: `python -m http.server 8000`
3. Open: `http://localhost:8000`

> The app is static-only and does not require any backend service or build step.

## Project structure

```text
.
├─ index.html
├─ assets/
│  ├─ css/
│  │  └─ styles.css
│  └─ js/
│     ├─ app.js
│     └─ data.js
└─ .github/
   └─ workflows/
      └─ deploy-pages.yml
```

## GitHub Pages deployment (main branch)

This repository includes `.github/workflows/deploy-pages.yml`, which deploys the static site to GitHub Pages on pushes to `main`.

1. Push this repository (including workflow) to GitHub.
2. In GitHub, open **Settings -> Pages**.
3. Set **Source** to **GitHub Actions**.
4. Push to `main` (or run the workflow manually).
5. The workflow publishes the site artifact and deploys it to Pages.

## Base path / project pages compatibility

The app uses only relative asset paths (`./assets/...`) and no root-absolute URLs.  
This ensures it works correctly when served from a repository subpath on GitHub Pages project sites, such as:

`https://<user>.github.io/<repo>/`
