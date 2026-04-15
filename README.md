# The Aperture

*Letting the light in.*

A personal notebook made public — data visualisations, NHS tools, writing,
photography and whatever else opens up when you look closely.

**Live at:** [theaperture.co.uk](https://theaperture.co.uk)

---

## Getting it live — step by step

### What you need (one-time setup)

1. **Node.js** — already installed. Confirm: `node -v`
2. **GitHub account** — you have one
3. **Netlify account** — free at [netlify.com](https://netlify.com), sign up with GitHub

---

### Step 1 — Get running locally

Unzip the project, open a terminal in the folder:

```bash
npm install       # install dependencies (one-time)
npm run dev       # start local dev server
```

Open `http://localhost:5173` — you should see The Aperture.

Press `Ctrl+C` to stop.

---

### Step 2 — Push to GitHub

Go to [github.com](https://github.com), create a new repository called `theaperture`.
- Don't tick "Add a README" — you already have one.

Then in your terminal:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/theaperture.git
git push -u origin main
```

---

### Step 3 — Deploy on Netlify

1. Go to [app.netlify.com](https://app.netlify.com)
2. **Add new site → Import an existing project → GitHub**
3. Select your `theaperture` repo
4. Confirm settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Click **Deploy site**

Done. You'll get a URL like `https://random-name.netlify.app`.

**From here on:** every `git push` triggers an automatic redeploy. You never need to touch Netlify again.

---

### Step 4 — Connect theaperture.co.uk

1. In Netlify: **Site settings → Domain management → Add a domain**
2. Enter `theaperture.co.uk`
3. Netlify gives you DNS values to enter in 123-reg
4. In 123-reg: go to your domain's DNS settings and add the records Netlify specifies
5. Wait up to 24 hours (usually much faster)
6. Netlify handles HTTPS automatically

---

## Adding a new project

**1.** Add an entry to `src/data/projects.js`:

```js
{
  id: "my-new-tool",
  title: "My New Tool",
  summary: "One sentence describing what it does.",
  tags: ["data", "nhs"],
  date: "2026-05-01",
  featured: false,
  status: "live",
},
```

**2.** Create `src/pages/MyNewToolPage.jsx`

**3.** Add a route in `src/App.jsx`:

```jsx
<Route path="/projects/my-new-tool" element={<MyNewToolPage />} />
```

Ask Claude to do all three in one go — just describe the tool.

---

## Renaming or updating the tagline

If you change the name or tagline later, update these files:
- `index.html` — title and meta description
- `src/components/Nav.jsx` — logo text
- `src/components/Footer.jsx` — footer name and tagline
- `src/pages/HomePage.jsx` — hero headline and about strip
- `src/pages/AboutPage.jsx` — opening copy
- `README.md` — this file

---

## The aperture graphic

The top-right corner of the homepage has a placeholder aperture/iris SVG.
A properly designed version is planned — ask Claude when ready.
The logo in the nav also uses a simple SVG iris mark as a placeholder.

---

## Project structure

```
theaperture/
├── public/
│   └── favicon.svg          ← Aperture iris icon
├── src/
│   ├── components/
│   │   ├── Nav.jsx           ← Logo with aperture mark placeholder
│   │   ├── Footer.jsx
│   │   └── ProjectCard.jsx
│   ├── data/
│   │   └── projects.js       ← Add new projects here
│   ├── pages/
│   │   ├── HomePage.jsx      ← Aperture corner graphic placeholder
│   │   ├── ProjectsPage.jsx
│   │   ├── AboutPage.jsx
│   │   ├── ChampionshipPage.jsx
│   │   └── NotFoundPage.jsx
│   ├── tools/
│   │   └── ChampionshipChart.jsx
│   ├── App.jsx               ← Routes
│   ├── main.jsx
│   └── index.css             ← Design tokens
├── index.html
├── vite.config.js
├── netlify.toml
└── package.json
```

---

## Tech stack

- [Vite](https://vitejs.dev) + [React](https://react.dev)
- [React Router](https://reactrouter.com) — client-side routing
- CSS Modules — scoped styles, no framework needed
- [Netlify](https://netlify.com) — hosting + automatic deploys
