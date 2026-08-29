# Otavi Market — Namibia Agri Market AI

An AI-powered market price and buyer-seller matching prototype for Namibian agriculture. Farmers list produce or
livestock, buyers state what they need, and a TF-IDF + rule-based matching engine ranks the best matches by price
fit, quantity fit, regional proximity, and listing relevance — the same approach used in GradLink's job matching,
applied to agricultural trade.

## Features

- **Market price dashboard** — 12 months of mock regional pricing across 14 Namibian regions and 15 crops/livestock
  types, with trend indicators and a scrolling price ticker.
- **Sell produce** — farmers post listings (crop, quantity, price, quality grade, description).
- **Find sellers (AI matching)** — buyers describe what they need; the engine scores every matching listing and
  returns a ranked list with a full score breakdown.

## Stack

- **Backend:** Node.js, Express, in-memory data store (swap for PostgreSQL for production — same shape as GradLink)
- **Frontend:** React (Vite), Tailwind CSS, Recharts
- **Matching engine:** custom TF-IDF cosine similarity blended with price/quantity/region fit scoring (`backend/lib/matcher.js`)

## Running locally

### 1. Backend

```bash
cd backend
npm install
npm start
```

Runs on `http://localhost:4000`. Key endpoints:

- `GET /api/regions`, `GET /api/crops`
- `GET /api/prices?crop=maize&region=otjozondjupa`
- `GET /api/listings`, `POST /api/listings`
- `GET /api/buyer-requests`, `POST /api/buyer-requests`
- `POST /api/match/for-buyer` — body: `{ crop, region, maxPrice, quantityNeeded, description }`
- `GET /api/match/for-buyer/:id`, `GET /api/match/for-listing/:id`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173` and proxies `/api` requests to the backend (see `vite.config.js`). Open that URL
with the backend already running.

## What's mock vs. real

All price history and starter listings are illustrative seed data (`backend/data/seedData.js`), generated with a
deterministic pseudo-random model loosely shaped on how NAB/AMTA-style reports look — not live feeds. To go from
prototype to production:

1. Swap the in-memory arrays in `routes/api.js` for a PostgreSQL store (schema mirrors the seed data shapes).
2. Replace `PRICE_HISTORY` generation with a real feed — e.g. scraping/partnering with the Namibian Agronomic Board
   (NAB) or Agro-Marketing and Trade Agency (AMTA) reports.
3. Add auth so listings/requests are tied to real accounts, plus notifications (email/WhatsApp, reusing the Twilio
   setup from GradLink) when a strong match appears.

## Next steps for a fuller system

- Persist matches and let buyers/sellers message each other directly from a match card.
- Add a map view (you already know PostGIS/QGIS) showing listings and buyers by region.
- Weight the matcher with historical deal success once real transactions start flowing.
