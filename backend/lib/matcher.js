// AI matching engine for buyer <-> seller agricultural listings.
// Blends a TF-IDF / cosine-similarity text score (crop, quality, description)
// with rule-based fit scores for price, quantity and regional proximity.
// Same core approach as GradLink's job-matching engine, re-applied to produce markets.

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "of", "to", "for", "with", "on", "in", "at",
  "is", "are", "be", "can", "will", "from", "by", "this", "that", "it", "as",
]);

function tokenize(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t && !STOPWORDS.has(t));
}

function buildDocument(item) {
  // Weight crop name and quality grade higher by repeating them
  return [item.crop, item.crop, item.qualityGrade || "", item.description || ""].join(" ");
}

function computeTfIdf(documents) {
  const termDocFreq = new Map();
  const docTermFreqs = documents.map((doc) => {
    const tokens = tokenize(doc);
    const tf = new Map();
    tokens.forEach((t) => tf.set(t, (tf.get(t) || 0) + 1));
    new Set(tokens).forEach((t) => termDocFreq.set(t, (termDocFreq.get(t) || 0) + 1));
    return tf;
  });

  const N = documents.length || 1;
  return docTermFreqs.map((tf) => {
    const vec = new Map();
    tf.forEach((count, term) => {
      const idf = Math.log(N / (1 + termDocFreq.get(term)));
      vec.set(term, count * idf);
    });
    return vec;
  });
}

function cosineSimilarity(vecA, vecB) {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  vecA.forEach((weight, term) => {
    normA += weight * weight;
    if (vecB.has(term)) dot += weight * vecB.get(term);
  });
  vecB.forEach((weight) => {
    normB += weight * weight;
  });
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Simple regional proximity: same region = 1, neighbouring "cluster" = 0.55, else 0.25
const REGION_CLUSTERS = {
  north: ["zambezi", "kavango-east", "kavango-west", "ohangwena", "omusati", "oshana", "oshikoto", "kunene"],
  central: ["otjozondjupa", "khomas", "erongo", "omaheke"],
  south: ["hardap", "karas"],
};

function clusterOf(regionId) {
  return Object.keys(REGION_CLUSTERS).find((c) => REGION_CLUSTERS[c].includes(regionId)) || null;
}

function regionProximityScore(regionA, regionB) {
  if (regionA === regionB) return 1;
  const ca = clusterOf(regionA);
  const cb = clusterOf(regionB);
  if (ca && ca === cb) return 0.55;
  return 0.25;
}

function priceFitScore(askingPrice, maxPrice) {
  if (!maxPrice) return 0.5;
  if (askingPrice <= maxPrice) {
    // Reward prices close to but under the buyer's ceiling (good value, not suspiciously cheap)
    const ratio = askingPrice / maxPrice;
    return 0.6 + 0.4 * ratio; // 0.6 - 1.0
  }
  // Over budget: decay quickly
  const overBy = (askingPrice - maxPrice) / maxPrice;
  return Math.max(0, 0.5 - overBy);
}

function quantityFitScore(available, needed) {
  if (!needed) return 0.5;
  if (available >= needed) {
    // Enough stock; slight preference for not wildly oversupplying
    const excess = available / needed;
    return excess <= 3 ? 1 : Math.max(0.7, 1 - (excess - 3) * 0.05);
  }
  const fulfilled = available / needed;
  return fulfilled * 0.6; // partial fulfilment is possible but scores lower
}

/**
 * Rank seller listings against a single buyer request.
 * @param {object} buyerRequest
 * @param {object[]} listings
 * @returns {object[]} ranked matches with score breakdown, highest first
 */
function matchListingsToBuyer(buyerRequest, listings) {
  const candidates = listings.filter((l) => l.crop === buyerRequest.crop);
  if (candidates.length === 0) return [];

  const docs = [...candidates.map(buildDocument), buildDocument(buyerRequest)];
  const vectors = computeTfIdf(docs);
  const buyerVec = vectors[vectors.length - 1];

  const results = candidates.map((listing, i) => {
    const textScore = cosineSimilarity(vectors[i], buyerVec); // 0..~1
    const priceScore = priceFitScore(listing.askingPrice, buyerRequest.maxPrice);
    const qtyScore = quantityFitScore(listing.quantity, buyerRequest.quantityNeeded);
    const regionScore = regionProximityScore(listing.region, buyerRequest.region);

    // Weighted blend: fit factors matter more than free-text similarity for a commodity market
    const overall =
      priceScore * 0.35 +
      qtyScore * 0.3 +
      regionScore * 0.2 +
      Math.min(1, textScore + 0.15) * 0.15; // small floor so identical crop still scores reasonably

    return {
      listing,
      score: Math.round(overall * 100),
      breakdown: {
        priceFit: Math.round(priceScore * 100),
        quantityFit: Math.round(qtyScore * 100),
        regionProximity: Math.round(regionScore * 100),
        descriptionRelevance: Math.round(Math.min(1, textScore + 0.15) * 100),
      },
    };
  });

  return results.sort((a, b) => b.score - a.score);
}

/**
 * Rank buyer requests against a single seller listing (reverse lookup).
 */
function matchBuyersToListing(listing, buyerRequests) {
  const candidates = buyerRequests.filter((b) => b.crop === listing.crop);
  if (candidates.length === 0) return [];

  return candidates
    .map((buyerRequest) => {
      const match = matchListingsToBuyer(buyerRequest, [listing])[0];
      if (!match) return null;
      return { ...match, buyerRequest };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);
}

module.exports = { matchListingsToBuyer, matchBuyersToListing, regionProximityScore };
