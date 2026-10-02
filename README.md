# AethelosGlobal.com

The website for Aethelos, the parent company of eight products. It's plain HTML, CSS and a little JavaScript: no build step, no framework and no third-party requests (the fonts are self-hosted).

The site treats "HQ" literally. The home page is the lobby, with a directory of the eight companies. Each company has its own floor page, and the brass dial shows which floor you're on. When you move between pages, the needle travels from the floor you left to the one you arrived at.

## Pages

| File | Floor | What it is |
|---|---|---|
| `index.html` | Lobby | Directory of all eight companies, the four shared rules, contact |
| `frontier-fleet.html` | 1 | Frontier Fleet |
| `architectai.html` | 2 | ArchitectAI |
| `virtual-tour-studio.html` | 3 | Virtual Tour Studio |
| `care-companion.html` | 4 | Care Companion |
| `decision-os.html` | 5 | Decision OS (the YouTube recommendation product) |
| `quanta.html` | 6 | Quanta |
| `bookslip.html` | 7 | Bookslip |
| `ciara.html` | 8 | Ciara |
| `contact.html` | | Contact form |
| `privacy.html` | | What the site collects |
| `404.html` | | Not-found page (uses root-relative links, so it works at any path) |

`assets/css/site.css` holds every style, and colours are tokens at the top of the file. Dark mode follows the visitor's system setting. `assets/js/site.js` runs the dial, the Companies menu and the contact form. The pages work without it.

## Preview locally

From this folder:

```bash
python -m http.server 4610
```

Then open http://localhost:4610. Opening `index.html` straight from disk also works, but use the server to check fonts and the contact form.

## Before going live

1. **Contact email.** The site uses `hello@aethelosglobal.com` everywhere. Set up that mailbox, or replace the address in every `.html` file (search for `hello@aethelosglobal.com`).
2. **Activate the form.** The contact form sends through [FormSubmit](https://formsubmit.co), which is free and needs no account. The first submission triggers an activation email to that address. Click the link in it, and messages arrive from then on.
3. **Links to the products.** Three pages link to live sites. Change them in the page's hero if the addresses change:
   - Frontier Fleet: `https://frontier-fleet.frontier-fleet.workers.dev`
   - ArchitectAI: `https://architectai-site.vercel.app`
   - Quanta: `https://web-delta-snowy-gh0j7p1sxe.vercel.app` (the evaluation workspace)

## Deploy

Upload the whole folder to any static host: Vercel, Netlify, Cloudflare Pages or GitHub Pages. No build command is needed, and the output directory is the folder itself. Point `aethelosglobal.com` at it. Canonical links, `sitemap.xml` and the social card already use `https://aethelosglobal.com/`.

For example, with the Vercel CLI, run this from this folder:

```bash
vercel deploy --prod
```

## Editing

- **A company's status or copy.** Edit its page. If you change its name, stage or one-line description, update the directory row in `index.html` too.
- **The header menu and footer** are repeated on every page. If you add or rename a company, update both on every page.
- **Adding a ninth company.** The dial has floors L and 1 to 8. A ninth floor needs another numeral in the dial SVG on every page. In `site.js`, the angle is `-80 + 20 × floor`, so the spacing would need to shrink to fit.
- **Images** live in `assets/img/`. `og.png` (1200×630) is the card shown when the link is shared.

## Credits

Fonts: Big Shoulders, Big Shoulders Inline and Source Serif 4, under the SIL Open Font License (`assets/fonts/OFL.txt`). Product screenshots come from each product's own builds and demos. The people and data shown in them are fictional.
