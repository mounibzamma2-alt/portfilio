# Mira Voss — Civil & Structural Engineer

A single-page portfolio built with vanilla HTML, CSS and JavaScript. The design uses a dark structural-blueprint aesthetic, editorial typography, acid-lime and cyan accents, a live particle field and restrained neon detailing.

## Run it

Open `index.html` directly in a browser, or serve the folder for a more production-like setup:

```powershell
npx serve .
```

No build step or dependencies are required.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | All page sections, metadata, SVG artwork and the project dialog. |
| `styles.css` | Design tokens, layout, animations, neon/particle styling and responsive rules. |
| `script.js` | Particle canvas, preloader, cursor, navigation, scroll reveals, counters, project filters/dialog, testimonial slider, contact form and Rotterdam clock. |
| `assets/engineer.jpg` | Portrait used in the About section. |
| `favicon.svg` | Custom engineering-mark favicon. |

## Customize

- **Name and copy** — search `index.html` for “Mira Voss” and replace the name, role, biography and project copy.
- **Portrait** — replace `assets/engineer.jpg` with your own image (a portrait crop around 900 × 1100 works well) and update its `alt` text.
- **Brand mark** — the `MV` monogram appears in the preloader, header and footer.
- **Colours and type** — edit the custom properties at the top of `styles.css` (`--lime`, `--cyan`, `--bg`, `--display`, `--body`, `--mono`).
- **Projects** — project cards are in `index.html`; the dialog copy and metadata live in the `projects` object in `script.js`.
- **Contact details** — replace `hello@miravoss.studio`, the LinkedIn/Instagram URLs and the Rotterdam location throughout `index.html`.

## Contact form

The form is static-host friendly: it validates the fields, then opens the visitor's email app with the enquiry prefilled and addressed to the site owner. If no mail app is available, the page displays the direct email address as a fallback.

To send enquiries through a service instead, replace the `mailto:` handoff in the contact-form section of `script.js` with a `fetch()` request to a Formspree, Netlify Forms or custom endpoint.

## Notes

- Fonts load from Google Fonts; the stack falls back to system fonts when offline.
- Motion respects `prefers-reduced-motion`.
- The layout has been checked from 320 px to 1920 px wide.
- All names, projects and statistics are fictional placeholders ready to be replaced.
