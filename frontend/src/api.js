function resolveApiBase() {
  const raw = import.meta.env.VITE_API_URL;
  if (!raw || typeof raw !== "string") return "/api";
  const origin = raw.trim().replace(/\/$/, "");
  if (!origin) return "/api";
  return origin.endsWith("/api") ? origin : `${origin}/api`;
}

export const API_BASE = resolveApiBase();
const REQUEST_TIMEOUT_MS = 25000;

async function request(path, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      signal: controller.signal,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `Request failed (${res.status})`);
    }
    return res.json();
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("The API took too long to respond. Render free instances sleep after idle — wait a few seconds and try again.");
    }
    if (err instanceof TypeError) {
      throw new Error("Cannot reach the API. Check VITE_API_URL and that the Render service is running.");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export const api = {
  getMeta: () => request("/meta"),
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
