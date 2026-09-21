const { REGIONS, CROPS, QUALITY_GRADES, BUYER_TYPES } = require("../data/seedData");

function nextId(items, prefix) {
  const max = items.reduce((highest, item) => {
    const n = Number(String(item.id || "").replace(prefix, ""));
    return Number.isFinite(n) ? Math.max(highest, n) : highest;
  }, 0);
  return `${prefix}${String(max + 1).padStart(3, "0")}`;
}

function requireText(value, label, max = 80) {
  const text = String(value ?? "").trim();
  if (!text) {
    const err = new Error(`${label} is required`);
    err.status = 400;
    throw err;
  }
  return text.slice(0, max);
}

function requirePositiveNumber(value, label) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) {
    const err = new Error(`${label} must be a number greater than 0`);
    err.status = 400;
    throw err;
  }
  return n;
}

function requireCrop(cropId) {
  const crop = CROPS.find((c) => c.id === cropId);
  if (!crop) {
    const err = new Error("Unknown crop");
    err.status = 400;
    throw err;
  }
  return crop;
}

function requireRegion(regionId) {
  const region = REGIONS.find((r) => r.id === regionId);
  if (!region) {
    const err = new Error("Unknown region");
    err.status = 400;
    throw err;
  }
  return region;
}

function parseListing(body) {
  const crop = requireCrop(body.crop);
  const region = requireRegion(body.region);
  const qualityGrade = QUALITY_GRADES.includes(body.qualityGrade) ? body.qualityGrade : "Ungraded";
  return {
    farmerName: requireText(body.farmerName, "Farm / seller name"),
    region: region.id,
    crop: crop.id,
    quantity: requirePositiveNumber(body.quantity, "Quantity"),
    unit: crop.unit,
    askingPrice: requirePositiveNumber(body.askingPrice, "Asking price"),
    qualityGrade,
    description: String(body.description || "").trim().slice(0, 500),
    contact: String(body.contact || "Not provided").trim().slice(0, 40) || "Not provided",
  };
}

function parseBuyerRequest(body) {
  const crop = requireCrop(body.crop);
  const region = requireRegion(body.region);
  const buyerType = BUYER_TYPES.includes(body.buyerType) ? body.buyerType : "Buyer";
  return {
    buyerName: requireText(body.buyerName, "Buyer name"),
    buyerType,
    region: region.id,
    crop: crop.id,
    quantityNeeded: requirePositiveNumber(body.quantityNeeded, "Quantity needed"),
    unit: crop.unit,
    maxPrice: requirePositiveNumber(body.maxPrice, "Max price"),
    description: String(body.description || "").trim().slice(0, 500),
  };
}

function sendError(res, err) {
  const status = err.status || 500;
  res.status(status).json({ error: status === 500 ? "Unexpected server error" : err.message });
}

module.exports = { nextId, parseListing, parseBuyerRequest, sendError };
