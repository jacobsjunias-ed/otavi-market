const express = require("express");
const router = express.Router();
const {
  REGIONS,
  CROPS,
  QUALITY_GRADES,
  BUYER_TYPES,
  PRICE_HISTORY,
  SELLER_LISTINGS,
  BUYER_REQUESTS,
} = require("../data/seedData");
const { matchListingsToBuyer, matchBuyersToListing } = require("../lib/matcher");
const { nextId, parseListing, parseBuyerRequest, sendError } = require("../lib/validate");

let listings = [...SELLER_LISTINGS];
let buyerRequests = [...BUYER_REQUESTS];

router.get("/health", (req, res) => res.json({ status: "ok" }));

router.get("/meta", (req, res) => {
  res.json({ regions: REGIONS, crops: CROPS, qualityGrades: QUALITY_GRADES, buyerTypes: BUYER_TYPES });
});

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
  try {
    const listing = {
      id: nextId(listings, "L"),
      postedDate: new Date().toISOString().slice(0, 10),
      ...parseListing(req.body),
    };
    listings = [listing, ...listings];
    res.status(201).json(listing);
  } catch (err) {
    sendError(res, err);
  }
});

router.get("/buyer-requests", (req, res) => {
  const { crop, region } = req.query;
  let rows = buyerRequests;
  if (crop) rows = rows.filter((b) => b.crop === crop);
  if (region) rows = rows.filter((b) => b.region === region);
  res.json(rows);
});

router.post("/buyer-requests", (req, res) => {
  try {
    const buyerRequest = {
      id: nextId(buyerRequests, "B"),
      ...parseBuyerRequest(req.body),
    };
    buyerRequests = [buyerRequest, ...buyerRequests];
    res.status(201).json(buyerRequest);
  } catch (err) {
    sendError(res, err);
  }
});

router.post("/match/for-buyer", (req, res) => {
  try {
    const buyerRequest = parseBuyerRequest(req.body);
    const matches = matchListingsToBuyer(buyerRequest, listings);
    res.json({ buyerRequest, matches });
  } catch (err) {
    sendError(res, err);
  }
});

router.get("/match/for-buyer/:id", (req, res) => {
  const buyerRequest = buyerRequests.find((b) => b.id === req.params.id);
  if (!buyerRequest) return res.status(404).json({ error: "Buyer request not found" });
  res.json({ buyerRequest, matches: matchListingsToBuyer(buyerRequest, listings) });
});

router.get("/match/for-listing/:id", (req, res) => {
  const listing = listings.find((l) => l.id === req.params.id);
  if (!listing) return res.status(404).json({ error: "Listing not found" });
  res.json({ listing, matches: matchBuyersToListing(listing, buyerRequests) });
});

module.exports = router;
