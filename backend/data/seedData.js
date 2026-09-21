// Seed / mock data representing Namibia's agricultural regions, crops and market activity.
// Prices are illustrative (modelled loosely on NAB/AMTA-style reporting patterns), not live data.

const QUALITY_GRADES = ["Grade A", "Grade B", "Export Grade", "Ungraded"];
const BUYER_TYPES = ["Buyer", "Retail supplier", "Processor", "Exporter"];

const REGIONS = [
  { id: "zambezi", name: "Zambezi", staples: ["maize", "rice", "sorghum"] },
  { id: "kavango-east", name: "Kavango East", staples: ["maize", "mahangu", "groundnuts"] },
  { id: "kavango-west", name: "Kavango West", staples: ["mahangu", "maize", "beans"] },
  { id: "ohangwena", name: "Ohangwena", staples: ["mahangu", "sorghum", "beans"] },
  { id: "omusati", name: "Omusati", staples: ["mahangu", "cattle", "goats"] },
  { id: "oshana", name: "Oshana", staples: ["mahangu", "cabbage", "onions"] },
  { id: "oshikoto", name: "Oshikoto", staples: ["mahangu", "maize", "cattle"] },
  { id: "otjozondjupa", name: "Otjozondjupa", staples: ["cattle", "maize", "watermelon"] },
  { id: "khomas", name: "Khomas", staples: ["tomatoes", "onions", "cabbage"] },
  { id: "erongo", name: "Erongo", staples: ["tomatoes", "grapes", "goats"] },
  { id: "hardap", name: "Hardap", staples: ["grapes", "wheat", "cattle"] },
  { id: "karas", name: "Karas", staples: ["grapes", "dates", "cattle"] },
  { id: "kunene", name: "Kunene", staples: ["cattle", "goats", "maize"] },
  { id: "omaheke", name: "Omaheke", staples: ["cattle", "goats", "sorghum"] },
];

const CROPS = [
  { id: "maize", name: "Maize", unit: "ton", category: "Grain", basePrice: 4200 },
  { id: "mahangu", name: "Mahangu (Pearl Millet)", unit: "ton", category: "Grain", basePrice: 3800 },
  { id: "sorghum", name: "Sorghum", unit: "ton", category: "Grain", basePrice: 3600 },
  { id: "wheat", name: "Wheat", unit: "ton", category: "Grain", basePrice: 5100 },
  { id: "groundnuts", name: "Groundnuts", unit: "ton", category: "Legume", basePrice: 9800 },
  { id: "beans", name: "Beans", unit: "ton", category: "Legume", basePrice: 8600 },
  { id: "tomatoes", name: "Tomatoes", unit: "kg", category: "Horticulture", basePrice: 14 },
  { id: "onions", name: "Onions", unit: "kg", category: "Horticulture", basePrice: 11 },
  { id: "cabbage", name: "Cabbage", unit: "kg", category: "Horticulture", basePrice: 7 },
  { id: "watermelon", name: "Watermelon", unit: "kg", category: "Horticulture", basePrice: 5 },
  { id: "grapes", name: "Table Grapes", unit: "kg", category: "Horticulture", basePrice: 32 },
  { id: "dates", name: "Dates", unit: "kg", category: "Horticulture", basePrice: 65 },
  { id: "cattle", name: "Cattle", unit: "head", category: "Livestock", basePrice: 9500 },
  { id: "goats", name: "Goats", unit: "head", category: "Livestock", basePrice: 1450 },
  { id: "rice", name: "Rice", unit: "ton", category: "Grain", basePrice: 7200 },
];

// Deterministic pseudo-random generator so price history is stable across restarts
function seededRandom(seed) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Generate 12 months of price history per crop per region that stocks it
function buildPriceHistory() {
  const history = [];
  const months = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];
  let seed = 1;

  CROPS.forEach((crop) => {
    const regionsForCrop = REGIONS.filter((r) => r.staples.includes(crop.id));
    const applicableRegions = regionsForCrop.length ? regionsForCrop : REGIONS.slice(0, 3);

    applicableRegions.forEach((region) => {
      months.forEach((month, i) => {
        seed += 1;
        const noise = (seededRandom(seed) - 0.5) * 0.16; // +/-8%
        const seasonalDrift = Math.sin((i / 12) * Math.PI * 2 + seed) * 0.06;
        const price = Math.max(1, crop.basePrice * (1 + noise + seasonalDrift));
        history.push({
          crop: crop.id,
          region: region.id,
          month,
          price: Math.round(price * 100) / 100,
        });
      });
    });
  });

  return history;
}

const PRICE_HISTORY = buildPriceHistory();

const SELLER_LISTINGS = [
  {
    id: "L001",
    farmerName: "Nangolo Shikongo",
    region: "ohangwena",
    crop: "mahangu",
    quantity: 12,
    unit: "ton",
    askingPrice: 3650,
    qualityGrade: "Grade A",
    description: "Fresh harvest mahangu, well dried, cleaned and bagged. Available for immediate pickup near Eenhana.",
    contact: "081 XXX 4521",
    postedDate: "2026-08-14",
  },
  {
    id: "L002",
    farmerName: "Maria Nakale",
    region: "omusati",
    crop: "cattle",
    quantity: 18,
    unit: "head",
    askingPrice: 9200,
    qualityGrade: "Grade B",
    description: "Mixed Brahman-cross cattle, weaned, healthy herd, vaccination records available.",
    contact: "081 XXX 7742",
    postedDate: "2026-08-20",
  },
  {
    id: "L003",
    farmerName: "Petrus Ganeb",
    region: "hardap",
    crop: "grapes",
    quantity: 4200,
    unit: "kg",
    askingPrice: 29,
    qualityGrade: "Export Grade",
    description: "Table grapes from Hardap irrigation scheme, export-quality, cold-chain ready.",
    contact: "081 XXX 1190",
    postedDate: "2026-08-22",
  },
  {
    id: "L004",
    farmerName: "Johannes /Uirab",
    region: "karas",
    crop: "dates",
    quantity: 800,
    unit: "kg",
    askingPrice: 58,
    qualityGrade: "Grade A",
    description: "Medjool dates from the Orange River valley, hand-sorted and packed.",
    contact: "081 XXX 3387",
    postedDate: "2026-08-10",
  },
  {
    id: "L005",
    farmerName: "Selma Amupolo",
    region: "khomas",
    crop: "tomatoes",
    quantity: 950,
    unit: "kg",
    askingPrice: 12,
    qualityGrade: "Grade A",
    description: "Greenhouse-grown tomatoes, harvested twice weekly, can supply on a standing order.",
    contact: "081 XXX 9903",
    postedDate: "2026-08-24",
  },
  {
    id: "L006",
    farmerName: "Frans Katjivikua",
    region: "otjozondjupa",
    crop: "maize",
    quantity: 30,
    unit: "ton",
    askingPrice: 4050,
    qualityGrade: "Grade A",
    description: "White maize, silo stored, moisture tested at 12.5%. Bulk transport can be arranged.",
    contact: "081 XXX 6650",
    postedDate: "2026-08-18",
  },
  {
    id: "L007",
    farmerName: "Ndapewa Iileka",
    region: "oshana",
    crop: "onions",
    quantity: 1600,
    unit: "kg",
    askingPrice: 10,
    qualityGrade: "Grade B",
    description: "Red and yellow onions, cured and ready for market, sold in 25kg pockets.",
    contact: "081 XXX 2214",
    postedDate: "2026-08-21",
  },
  {
    id: "L008",
    farmerName: "Erastus Tjombonde",
    region: "kunene",
    crop: "goats",
    quantity: 40,
    unit: "head",
    askingPrice: 1380,
    qualityGrade: "Grade B",
    description: "Boer-cross goats, communal grazing, available for bulk sale to abattoirs.",
    contact: "081 XXX 5518",
    postedDate: "2026-08-16",
  },
  {
    id: "L009",
    farmerName: "Rauna Shivute",
    region: "kavango-east",
    crop: "groundnuts",
    quantity: 6,
    unit: "ton",
    askingPrice: 9200,
    qualityGrade: "Grade A",
    description: "Shelled groundnuts, hand-sorted, low aflatoxin, tested at local extension office.",
    contact: "081 XXX 8834",
    postedDate: "2026-08-12",
  },
  {
    id: "L010",
    farmerName: "Gideon Basson",
    region: "omaheke",
    crop: "cattle",
    quantity: 25,
    unit: "head",
    askingPrice: 9700,
    qualityGrade: "Grade A",
    description: "Bonsmara cattle raised on Kalahari sandveld, ready for feedlot or direct sale.",
    contact: "081 XXX 4470",
    postedDate: "2026-08-19",
  },
];

const BUYER_REQUESTS = [
  {
    id: "B001",
    buyerName: "Windhoek Fresh Produce Co.",
    buyerType: "Retail supplier",
    region: "khomas",
    crop: "tomatoes",
    quantityNeeded: 800,
    unit: "kg",
    maxPrice: 13,
    description: "Weekly standing order for greenhouse tomatoes, needs reliable Grade A supply.",
  },
  {
    id: "B002",
    buyerName: "NamMills Grain Processors",
    buyerType: "Processor",
    region: "otjozondjupa",
    crop: "maize",
    quantityNeeded: 40,
    unit: "ton",
    maxPrice: 4300,
    description: "Milling-grade white maize, bulk purchase, own transport available for pickup.",
  },
  {
    id: "B003",
    buyerName: "Southern Cape Fruit Exports",
    buyerType: "Exporter",
    region: "hardap",
    crop: "grapes",
    quantityNeeded: 5000,
    unit: "kg",
    maxPrice: 31,
    description: "Sourcing export-grade table grapes for the European season, cold-chain logistics provided.",
  },
  {
    id: "B004",
    buyerName: "Meatco Feedlot",
    buyerType: "Processor",
    region: "omaheke",
    crop: "cattle",
    quantityNeeded: 30,
    unit: "head",
    maxPrice: 9800,
    description: "Buying weaner-to-feedlot cattle, prefers Bonsmara or Brahman-cross, vaccinated stock only.",
  },
];

module.exports = {
  REGIONS,
  CROPS,
  QUALITY_GRADES,
  BUYER_TYPES,
  PRICE_HISTORY,
  SELLER_LISTINGS,
  BUYER_REQUESTS,
};
