# Seed data guide

Use this after creating the Firebase project.

## 1. Create business

Document: `businesses/cakes-by-kee`

```json
{
  "businessId": "cakes-by-kee",
  "slug": "cakes-by-kee",
  "status": "active"
}
```

## 2. Settings

`businesses/cakes-by-kee/settings/general` — businessName, displayName, description, phone, whatsappNumber, instagramUrl, currency `INR`, pickup/delivery flags.

`businesses/cakes-by-kee/settings/orderRules` — `minimumPreorderDays: 4`, `deliveryEnabled: true`, `pickupEnabled: true`, `deliveryChargeMode: "manual"`.

## 3. Categories & products

Import from `src/data/seedCatalogue.js` (same ids). Demo app also falls back to this seed locally.

## 4. Admin user

1. Create Email/Password user in Firebase Auth.
2. Create `businesses/{businessId}/adminUsers/{uid}` with `{ "businessId": "{businessId}", "email": "...", "role": "owner" }`.

## 5. Visify operator (you)

Create Auth user `visifyapps@gmail.com`, then document:

`visifyOperators/{yourAuthUid}`

```json
{ "email": "visifyapps@gmail.com", "role": "visify" }
```

Desk: `/#/visify` after login.

## 6. Demo enquiries

Optional: copy `src/data/demoEnquiries.js` into Firestore for training data.

## 7. Deploy rules

```bash
npx firebase-tools login
npx firebase-tools use <project-id>
npx firebase-tools deploy --only firestore:rules,firestore:indexes,storage
```

See `docs/security-rules.md` and `docs/deployment.md`.
