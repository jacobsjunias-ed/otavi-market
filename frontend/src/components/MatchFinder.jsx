import { useState } from "react";
import { api } from "../api";
import ScoreBar from "./ScoreBar";
import { useCatalog } from "../CatalogContext";

const emptyForm = {
  buyerName: "",
  buyerType: "Buyer",
  region: "",
  crop: "",
  quantityNeeded: "",
  maxPrice: "",
  description: "",
};

export default function MatchFinder() {
  const { regions, crops, buyerTypes, regionName, cropName } = useCatalog();
  const [form, setForm] = useState(emptyForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await api.matchForBuyer({
        ...form,
        quantityNeeded: Number(form.quantityNeeded),
        maxPrice: Number(form.maxPrice),
      });
      setResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedCrop = crops.find((c) => c.id === form.crop);

  return (
    <section className="max-w-6xl mx-auto px-6 py-10 grid lg:grid-cols-[1fr,1.3fr] gap-10">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-gold mb-1">AI matching engine</p>
        <h1 className="font-display text-3xl font-semibold text-dusk mb-2">Tell us what you need</h1>
        <p className="text-ink/60 mb-6 text-sm">
          The matcher scores every seller on price fit, quantity fit, regional proximity and listing relevance —
          then ranks them for you.
        </p>

        <form onSubmit={handleSubmit} className="bg-white border border-ink/10 rounded-2xl p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-ink/80" htmlFor="buyerName">
              Buyer / company name
            </label>
            <input
              id="buyerName"
              required
              value={form.buyerName}
              onChange={handleChange("buyerName")}
              className="field"
              placeholder="e.g. Windhoek Fresh Produce Co."
            />
          </div>

          <div>
            <label className="text-sm font-medium text-ink/80" htmlFor="buyerType">
              Buyer type
            </label>
            <select id="buyerType" value={form.buyerType} onChange={handleChange("buyerType")} className="field">
              {buyerTypes.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-ink/80" htmlFor="buyer-region">
                Preferred region
              </label>
              <select id="buyer-region" required value={form.region} onChange={handleChange("region")} className="field">
                <option value="">Select…</option>
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-ink/80" htmlFor="buyer-crop">
                Crop / livestock needed
              </label>
              <select id="buyer-crop" required value={form.crop} onChange={handleChange("crop")} className="field">
                <option value="">Select…</option>
                {crops.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-ink/80" htmlFor="quantityNeeded">
                Quantity needed {selectedCrop ? `(${selectedCrop.unit})` : ""}
              </label>
              <input
                id="quantityNeeded"
                required
                type="number"
                min="0.01"
                step="any"
                value={form.quantityNeeded}
                onChange={handleChange("quantityNeeded")}
                className="field"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink/80" htmlFor="maxPrice">
                Max price (N\$)
              </label>
              <input
                id="maxPrice"
                required
                type="number"
                min="0.01"
                step="any"
                value={form.maxPrice}
                onChange={handleChange("maxPrice")}
                className="field"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-ink/80" htmlFor="buyer-description">
              What matters to you
            </label>
            <textarea
              id="buyer-description"
              value={form.description}
              onChange={handleChange("description")}
              rows={3}
              maxLength={500}
              className="field"
              placeholder="e.g. export grade, vaccinated stock, weekly standing order…"
            />
          </div>

          {error && <p className="text-clay text-sm">{error}</p>}

          <button type="submit" disabled={loading} className="w-full btn-gold disabled:opacity-50">
            {loading ? "Matching…" : "Find matching sellers"}
          </button>
        </form>
      </div>

      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-gold mb-1">Ranked results</p>
        <h2 className="font-display text-2xl font-semibold text-dusk mb-6">
          {result ? `${result.matches.length} match${result.matches.length === 1 ? "" : "es"} found` : "No search yet"}
        </h2>

        {!result && (
          <div className="bg-white border border-dashed border-ink/20 rounded-2xl p-10 text-center text-ink/50">
            Submit a request to see ranked seller matches with a score breakdown.
          </div>
        )}

        {result && result.matches.length === 0 && (
          <div className="bg-white border border-dashed border-ink/20 rounded-2xl p-10 text-center text-ink/50">
            No sellers are listing {cropName(form.crop)} yet. Try another crop or post a listing first.
          </div>
        )}

        <div className="space-y-4">
          {result?.matches.map((m, i) => (
            <div key={m.listing.id} className="bg-white border border-ink/10 rounded-xl p-5 shadow-sm hover:shadow transition-shadow">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-gold font-bold">#{i + 1} match</span>
                    {/* === ⚡ PROXIMITY BADGE INJECTION === */}
                    {m.listing.distanceKm !== undefined && m.listing.distanceKm !== null && (
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                        m.listing.distanceKm <= 150 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        📍 {m.listing.distanceKm} km away {m.listing.distanceKm <= 150 ? '(Local Hub)' : ''}
                      </span>
                    )}
                  </div>
                  <p className="font-display text-lg font-semibold text-dusk mt-1">{m.listing.farmerName}</p>
                  <p className="text-sm text-ink/60">
                    {cropName(m.listing.crop)} · {regionName(m.listing.region)} · {m.listing.qualityGrade}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-3xl font-bold text-sage">{m.score}</p>
                  <p className="text-xs text-ink/50 font-mono">match score</p>
                </div>
              </div>

              {m.listing.description && <p className="text-sm text-ink/70 mt-3">{m.listing.description}</p>}

              <div className="flex flex-wrap justify-between items-center gap-2 mt-3 text-sm font-mono text-ink/60">
                <span>
                  {m.listing.quantity.toLocaleString()} {m.listing.unit} available
                </span>
                <span>
                  N\${m.listing.askingPrice.toLocaleString()}/{m.listing.unit}
                  {m.listing.contact ? ` · ${m.listing.contact}` : ""}
                </span>
              </div>

              {/* Component breakdown visualization panel matching loops */}
              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-ink/10">
                <ScoreBar label="Price Fit" score={m.breakdown?.priceFit ?? 0.5} />
                <ScoreBar label="Quantity Fit" score={m.breakdown?.quantityFit ?? 0.5} />
                <ScoreBar label="Description Match" score={m.breakdown?.textMatch ?? 0.5} />
                <ScoreBar label="Regional Proximity" score={m.breakdown?.proximityFit ?? 0.5} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
