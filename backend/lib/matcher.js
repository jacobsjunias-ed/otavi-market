/**
 * Haversine Formula Utility
 * Calculates the straight-line distance between two points on the Earth's surface in kilometers.
 */
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;

  const EARTH_RADIUS_KM = 6371; // Core metric reference
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c; // Returns absolute distance in kilometers
}

/**
 * Basic TF-IDF Vectorizer Tokenizer
 */
function tokenize(text) {
  if (!text) return [];
  return text.toLowerCase().split(/[^a-z0-9]/).filter(Boolean);
}

/**
 * Matches Seller Listings against a single target Buyer Request,
 * blending produce description alignment with physical location constraints.
 */
function matchListingsToBuyer(buyerRequest, allListings) {
  const buyerTokens = tokenize(buyerRequest.description);

  return allListings
    .map((listing) => {
      // 1. Strict Requirement: Filter out differing crop types immediately
      if (listing.crop.toLowerCase() !== buyerRequest.crop.toLowerCase()) {
        return null;
      }

      // 2. Compute text relevance weight using a basic token matching index
      const listingTokens = tokenize(listing.description || "");
      const commonTokens = listingTokens.filter((t) => buyerTokens.includes(t));
      const textMatchScore = listingTokens.length ? commonTokens.length / listingTokens.length : 0;

      // 3. Compute physical transport distance using our new coordinate data
      const distanceKm = calculateHaversineDistance(
        buyerRequest.lat,
        buyerRequest.lng,
        listing.lat,
        listing.lng
      );

      // 4. Calculate final recommendation score
      // Base score starts with text relevance, boosted heavily if they are nearby
      let finalScore = textMatchScore;
      
      if (distanceKm !== null) {
        // Distance Penalty / Reward Curve: Maximize score for nodes within 150km radius
        const proximityBoost = Math.max(0, (500 - distanceKm) / 500);
        finalScore += proximityBoost * 1.5;
      }

      return {
        ...listing,
        distanceKm: distanceKm !== null ? Math.round(distanceKm) : null,
        matchScore: Number(finalScore.toFixed(2)),
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.matchScore - a.matchScore); // Rank highest matched scores first
}

/**
 * Matches Buyer Requests against a single target Seller Listing.
 */
function matchBuyersToListing(sellerListing, allBuyerRequests) {
  const listingTokens = tokenize(sellerListing.description || "");

  return allBuyerRequests
    .map((buyer) => {
      if (buyer.crop.toLowerCase() !== sellerListing.crop.toLowerCase()) {
        return null;
      }

      const buyerTokens = tokenize(buyer.description);
      const commonTokens = buyerTokens.filter((t) => listingTokens.includes(t));
      const textMatchScore = buyerTokens.length ? commonTokens.length / buyerTokens.length : 0;

      const distanceKm = calculateHaversineDistance(
        sellerListing.lat,
        sellerListing.lng,
        buyer.lat,
        buyer.lng
      );

      let finalScore = textMatchScore;
      if (distanceKm !== null) {
        const proximityBoost = Math.max(0, (500 - distanceKm) / 500);
        finalScore += proximityBoost * 1.5;
      }

      return {
        ...buyer,
        distanceKm: distanceKm !== null ? Math.round(distanceKm) : null,
        matchScore: Number(finalScore.toFixed(2)),
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.matchScore - a.matchScore);
}

module.exports = {
  matchListingsToBuyer,
  matchBuyersToListing,
};
