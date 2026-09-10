# Cake Store Front

Multi-business-capable bakery enquiry SaaS (MVP). First pilot deployment: **Cakes by Kee**.

Customers submit structured cake enquiries (no account). Bakers manage enquiries, customers, and orders in an admin dashboard. Conversation continues on WhatsApp via click-to-chat.

## Stack

- React + Vite + JavaScript
- React Router (`HashRouter` for GitHub Pages)
- Firebase Auth, Firestore, Storage
- No Express / Cloud Functions in MVP

## Docs

- [`docs/product-requirements.md`](docs/product-requirements.md)
- [`docs/architecture.md`](docs/architecture.md)
- [`docs/firestore-schema.md`](docs/firestore-schema.md)
- [`docs/security-rules.md`](docs/security-rules.md)
- [`docs/user-flows.md`](docs/user-flows.md)
- [`docs/future-roadmap.md`](docs/future-roadmap.md)
- [`docs/deployment.md`](docs/deployment.md)
- [`firebase/seed/README.md`](firebase/seed/README.md)

## Setup

```bash
cp .env.example .env
# Fill VITE_FIREBASE_* from Firebase Console (optional for local demo mode)
npm install
npm run dev
```

- Public: [http://localhost:5173/#/](http://localhost:5173/#/)
- Enquiry: `/#/custom-cake`
- Admin: `/#/admin/login` (demo: any email + password 4+ chars when Firebase is not configured)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Local development |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build |

## Deploy

GitHub Actions workflow: `.github/workflows/deploy.yml`

1. Enable GitHub Pages (Source: GitHub Actions).
2. Add repository secrets for `VITE_FIREBASE_*`.
3. Optional vars: `VITE_DEFAULT_BUSINESS_ID`, `VITE_BASE_PATH` (e.g. `/CakeStoreFront/` for project sites).
4. Push to `main` / `master`.

Deploy Firebase rules separately:

```bash
npx firebase-tools deploy --only firestore:rules,firestore:indexes,storage
```

## MVP status

**Phases 1–10 complete** for local/demo use. Connect Firebase + seed data + deploy rules for production pilot.
