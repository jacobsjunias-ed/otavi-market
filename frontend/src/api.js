const BASE = "/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  getRegions: () => request("/regions"),
  getCrops: () => request("/crops"),
  getPrices: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/prices${qs ? `?${qs}` : ""}`);
  },
  getListings: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/listings${qs ? `?${qs}` : ""}`);
  },
  createListing: (data) => request("/listings", { method: "POST", body: JSON.stringify(data) }),
  getBuyerRequests: () => request("/buyer-requests"),
  createBuyerRequest: (data) => request("/buyer-requests", { method: "POST", body: JSON.stringify(data) }),
  matchForBuyer: (buyerRequest) =>
    request("/match/for-buyer", { method: "POST", body: JSON.stringify(buyerRequest) }),
};
