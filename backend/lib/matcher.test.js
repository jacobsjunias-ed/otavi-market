const { test } = require("node:test");
const assert = require("node:assert/strict");
const { matchListingsToBuyer, matchBuyersToListing, regionProximityScore } = require("./matcher");

test("same region is a perfect proximity score", () => {
  assert.equal(regionProximityScore("khomas", "khomas"), 1);
});

test("central neighbours score higher than distant regions", () => {
  assert.ok(regionProximityScore("khomas", "erongo") > regionProximityScore("khomas", "zambezi"));
});

test("ranks the better price/location listing first", () => {
  const matches = matchListingsToBuyer(
    {
      crop: "tomatoes",
      region: "khomas",
      maxPrice: 13,
      quantityNeeded: 800,
      description: "Grade A greenhouse tomatoes standing order",
    },
    [
      {
        id: "near",
        crop: "tomatoes",
        region: "khomas",
        askingPrice: 12,
        quantity: 950,
        qualityGrade: "Grade A",
        description: "Greenhouse tomatoes, weekly standing order",
      },
      {
        id: "far",
        crop: "tomatoes",
        region: "karas",
        askingPrice: 22,
        quantity: 10,
        qualityGrade: "Ungraded",
        description: "Field tomatoes",
      },
    ]
  );
  assert.equal(matches[0].listing.id, "near");
  assert.ok(matches[0].score >= matches[1].score);
});

test("reverse lookup keeps the original buyer request", () => {
  const listing = {
    id: "L1",
    crop: "maize",
    region: "otjozondjupa",
    askingPrice: 4000,
    quantity: 30,
    qualityGrade: "Grade A",
    description: "White maize silo stored",
  };
  const buyers = [
    {
      id: "B1",
      crop: "maize",
      region: "otjozondjupa",
      maxPrice: 4300,
      quantityNeeded: 40,
      description: "Milling-grade maize",
    },
    { id: "B2", crop: "goats", region: "kunene", maxPrice: 1400, quantityNeeded: 10, description: "Goats" },
  ];
  const matches = matchBuyersToListing(listing, buyers);
  assert.equal(matches.length, 1);
  assert.equal(matches[0].buyerRequest.id, "B1");
});
