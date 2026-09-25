# Bommi's Bakery

Home-bakery enquiry app for **[Bommi's Bakery](https://www.instagram.com/bommis__bakery/)** (RS Puram, Coimbatore).

Customers place structured cake / class enquiries. The baker continues on WhatsApp — same details they already collect on Instagram, without the back-and-forth.

## Stack

- React + Vite + JavaScript
- React Router (`HashRouter` for GitHub Pages)
- Firebase Auth, Firestore
- Visify desk is a **separate** deploy (`visify-desk`), not on this shop URL

## Scripts

```bash
npm run dev              # shop locally
npm run dev:visify       # Visify desk locally → /visify/
npm run deploy:pages     # shop → GitHub Pages /bommis-bakery/
npm run deploy:visify    # desk → GitHub Pages /visify-desk/ (needs visify-desk remote/repo)
```

## Shop id

Firestore path: `businesses/bommis-bakery`  
Env: `VITE_DEFAULT_BUSINESS_ID=bommis-bakery`  
Firebase **project** may still be named `cakes-by-kee` — that is the Google project name only.

## Docs

See `docs/` for architecture and deployment notes.
