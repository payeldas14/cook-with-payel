# Cook With Payel

A clean, modern food recipe website built with React and Vite.

*Still building

## Tech Stack

- React 18
- Vite
- React Router DOM
- React Icons
- Plain CSS
- Google Fonts (Inter + Poppins)

## Color Theme

- `#40513B` — primary text / headings / primary buttons
- `#628141` — accent green (nav active, badges)
- `#E5D9B6` — warm beige (secondary buttons, hero accents)
- `#E67E22` — accent orange (links, toolbar icon hovers, focus rings); hover deepens to `#D35400`
- `#FFFFFF` — page background (site-wide)

Navigation and in-content links use the same interaction pattern everywhere: header links are text-only with a darker hover/active state; secondary actions use the orange accent link style (`#E67E22`).

## Features

- Home page with:
  - Intro/about section
  - Hero food image
  - Latest 4 recipes
  - "More Recipes" link to view all recipes
- Recipes page with:
  - Default latest-first ordering
  - Filters: Latest, Chicken, Fish, Vegetarian, Desert, Breakfast
  - Keyword search with partial match support (example: `chi` matches `chicken`)
- Add Recipe page:
  - Form to add recipe title, description, category, image URL, ingredients, instructions
  - New recipes appear in recipe listing immediately
  - Data is persisted in browser `localStorage`

## Project Structure

```text
.
├─ src/
│  ├─ App.jsx
│  ├─ main.jsx
│  └─ styles.css
├─ index.html
├─ package.json
└─ vite.config.js
```

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Run development server:

```bash
npm run dev
```

3. Open in browser:

```text
http://localhost:5173/
```

## Build for Production

```bash
npm run build
```

## Preview Production Build

```bash
npm run preview
```
