const express = require("express");
const router = express.Router();
const { REGIONS, CROPS, PRICE_HISTORY, SELLER_LISTINGS, BUYER_REQUESTS } = require("../data/seedData");
const { matchListingsToBuyer, matchBuyersToListing } = require("../lib/matcher");

// In-memory stores seeded from mock data (swap for PostgreSQL in production)
let listings = [...SELLER_LISTINGS];
let buyerRequests = [...BUYER_REQUESTS];

router.get("/regions", (req, res) => res.json(REGIONS));
router.get("/crops", (req, res) => res.json(CROPS));

router.get("/prices", (req, res) => {
  const { crop, region } = req.query;
  let rows = PRICE_HISTORY;
  if (crop) rows = rows.filter((r) => r.crop === crop);
  if (region) rows = rows.filter((r) => r.region === region);
  res.json(rows);
});

router.get("/listings", (req, res) => {
  const { crop, region } = req.query;
  let rows = listings;
  if (crop) rows = rows.filter((l) => l.crop === crop);
  if (region) rows = rows.filter((l) => l.region === region);
  res.json(rows);
});

router.post("/listings", (req, res) => {
  const required = ["farmerName", "region", "crop", "quantity", "unit", "askingPrice"];
  const missing = required.filter((f) => req.body[f] === undefined || req.body[f] === "");
  if (missing.length) {
    return res.status(400).json({ error: `Missing fields: ${missing.join(", ")}` });
  }
  const listing = {
    id: `L${String(listings.length + 1).padStart(3, "0")}`,
    qualityGrade: "Ungraded",
    description: "",
    contact: "Not provided",
    postedDate: new Date().toISOString().slice(0, 10),
    ...req.body,
  };
  listings = [listing, ...listings];
  res.status(201).json(listing);
});

router.get("/buyer-requests", (req, res) => {
  const { crop, region } = req.query;
  let rows = buyerRequests;
  if (crop) rows = rows.filter((b) => b.crop === crop);
  if (region) rows = rows.filter((b) => b.region === region);
  res.json(rows);
});

router.post("/buyer-requests", (req, res) => {
  const required = ["buyerName", "region", "crop", "quantityNeeded", "unit", "maxPrice"];
  const missing = required.filter((f) => req.body[f] === undefined || req.body[f] === "");
  if (missing.length) {
    return res.status(400).json({ error: `Missing fields: ${missing.join(", ")}` });
  }
  const buyerRequest = {
    id: `B${String(buyerRequests.length + 1).padStart(3, "0")}`,
    buyerType: "Buyer",
    description: "",
    ...req.body,
  };
  buyerRequests = [buyerRequest, ...buyerRequests];
  res.status(201).json(buyerRequest);
});

// AI matching: rank sellers for a given buyer request (existing or ad-hoc)
router.post("/match/for-buyer", (req, res) => {
  const buyerRequest = req.body;
  if (!buyerRequest || !buyerRequest.crop) {
    return res.status(400).json({ error: "buyerRequest with a crop is required" });
  }
  const matches = matchListingsToBuyer(buyerRequest, listings);
  res.json({ buyerRequest, matches });
});

router.get("/match/for-buyer/:id", (req, res) => {
  const buyerRequest = buyerRequests.find((b) => b.id === req.params.id);
  if (!buyerRequest) return res.status(404).json({ error: "Buyer request not found" });
  const matches = matchListingsToBuyer(buyerRequest, listings);
  res.json({ buyerRequest, matches });
});

router.get("/match/for-listing/:id", (req, res) => {
  const listing = listings.find((l) => l.id === req.params.id);
  if (!listing) return res.status(404).json({ error: "Listing not found" });
  const matches = matchBuyersToListing(listing, buyerRequests);
  res.json({ listing, matches });
});

module.exports = router;
