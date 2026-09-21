import { useEffect, useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { api } from "../api";
import { useCatalog } from "../CatalogContext";

const REGION_COLORS = ["#D9A441", "#7A8C5B", "#A8462F", "#1B2A4A", "#8A9BB5", "#C97B4A"];

export default function PriceDashboard() {
  const { crops, regionName, cropName } = useCatalog();
  const [selectedCrop, setSelectedCrop] = useState("maize");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!selectedCrop) return;
    setLoading(true);
    setError(null);
    api
      .getPrices({ crop: selectedCrop })
      .then(setPrices)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [selectedCrop]);

  const { chartData, regionIds, allRegionIds, unit, latestByRegion } = useMemo(() => {
    const allIds = [...new Set(prices.map((p) => p.region))];
    const scoped = selectedRegion ? prices.filter((p) => p.region === selectedRegion) : prices;
    if (!scoped.length) return { chartData: [], regionIds: [], allRegionIds: allIds, unit: "", latestByRegion: [] };
    const months = [...new Set(scoped.map((p) => p.month))];
    const rIds = [...new Set(prices.map((p) => p.region))];
    const chartIds = selectedRegion ? [selectedRegion] : rIds;
    const data = months.map((month) => {
      const row = { month };
      chartIds.forEach((rid) => {
        const point = scoped.find((p) => p.month === month && p.region === rid);
        row[rid] = point ? point.price : null;
      });
      return row;
    });
    const cropObj = crops.find((c) => c.id === selectedCrop);
    const latest = rIds.map((rid) => {
      const rowsForRegion = prices.filter((p) => p.region === rid);
      const last = rowsForRegion[rowsForRegion.length - 1];
      const first = rowsForRegion[0];
      const trend = first && last ? ((last.price - first.price) / first.price) * 100 : 0;
      return { region: rid, price: last?.price ?? 0, trend };
    });
    return { chartData: data, regionIds: chartIds, allRegionIds: rIds, unit: cropObj?.unit || "", latestByRegion: latest };
  }, [prices, crops, selectedCrop, selectedRegion]);

  return (
    <section className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-gold mb-1">12-month view</p>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-dusk">
            {cropName(selectedCrop)} prices across regions
          </h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            aria-label="Crop"
            value={selectedCrop}
            onChange={(e) => {
              setSelectedCrop(e.target.value);
              setSelectedRegion("");
            }}
            className="field !mt-0 min-w-[12rem]"
          >
            {crops.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            aria-label="Region filter"
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="field !mt-0 min-w-[12rem]"
          >
            <option value="">All producing regions</option>
            {allRegionIds.map((rid) => (
              <option key={rid} value={rid}>
                {regionName(rid)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="text-clay mb-4">{error}</p>}

      <div className="bg-white border border-ink/10 rounded-2xl p-6 shadow-sm mb-8">
        {loading ? (
          <div className="h-72 flex items-center justify-center text-ink/50 font-mono text-sm">Loading…</div>
        ) : chartData.length === 0 ? (
          <div className="h-72 flex items-center justify-center text-ink/50 text-sm">No price series for this filter.</div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#22201B10" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fontFamily: "IBM Plex Mono" }} />
              <YAxis
                tick={{ fontSize: 12, fontFamily: "IBM Plex Mono" }}
                width={70}
                label={{ value: `N$/${unit}`, angle: -90, position: "insideLeft", fontSize: 11 }}
              />
              <Tooltip
                formatter={(value, name) => [`N$${Number(value).toLocaleString()}`, regionName(name)]}
                labelFormatter={(l) => `Month: ${l}`}
              />
              <Legend formatter={(value) => regionName(value)} wrapperStyle={{ fontSize: 12 }} />
              {regionIds.map((rid, i) => (
                <Line
                  key={rid}
                  type="monotone"
                  dataKey={rid}
                  stroke={REGION_COLORS[i % REGION_COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {latestByRegion
          .sort((a, b) => b.price - a.price)
          .map((r) => (
            <button
              type="button"
              key={r.region}
              onClick={() => setSelectedRegion(r.region === selectedRegion ? "" : r.region)}
              className={`bg-white border rounded-xl p-4 text-left transition-colors ${
                selectedRegion === r.region ? "border-gold ring-1 ring-gold" : "border-ink/10 hover:border-gold/40"
              }`}
            >
              <p className="font-mono text-xs uppercase tracking-widest text-ink/50">{regionName(r.region)}</p>
              <p className="font-display text-2xl font-semibold text-dusk mt-1">
                N${r.price.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                <span className="text-sm font-body text-ink/50">/{unit}</span>
              </p>
              <p className={`text-sm font-mono mt-1 ${r.trend >= 0 ? "text-sage" : "text-clay"}`}>
                {r.trend >= 0 ? "▲" : "▼"} {Math.abs(r.trend).toFixed(1)}% over 12 months
              </p>
            </button>
          ))}
      </div>
    </section>
  );
}
