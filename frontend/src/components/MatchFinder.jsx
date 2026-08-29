import { useEffect, useState } from "react";
import { api } from "../api";
import ScoreBar from "./ScoreBar";

const emptyForm = {
  buyerName: "",
  buyerType: "Buyer",
  region: "",
  crop: "",
  quantityNeeded: "",
  unit: "",
  maxPrice: "",
  description: "",
};

export default function MatchFinder() {
  const [regions, setRegions] = useState([]);
  const [crops, setCrops] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([api.getRegions(), api.getCrops()])
      .then(([r, c]) => {
        setRegions(r);
        setCrops(c);
      })
      .catch((e) => setError(e.message));
  }, []);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm((f) => ({
      ...f,
      [field]: value,
      ...(field === "crop" ? { unit: crops.find((c) => c.id === value)?.unit || "" } : {}),
    }));
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

  const regionName = (id) => regions.find((r) => r.id === id)?.name || id;
  const cropName = (id) => crops.find((c) => c.id === id)?.name || id;

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
            <label className="text-sm font-medium text-ink/80">Buyer / company name</label>
            <input
              required
              value={form.buyerName}
              onChange={handleChange("buyerName")}
              className="w-full mt-1 border border-ink/20 rounded-lg px-3 py-2"
              placeholder="e.g. Windhoek Fresh Produce Co."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-ink/80">Preferred region</label>
              <select
                required
                value={form.region}
                onChange={handleChange("region")}
                className="w-full mt-1 border border-ink/20 rounded-lg px-3 py-2"
              >
                <option value="">Select…</option>
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-ink/80">Crop / livestock needed</label>
              <select
                required
                value={form.crop}
                onChange={handleChange("crop")}
                className="w-full mt-1 border border-ink/20 rounded-lg px-3 py-2"
              >
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
              <label className="text-sm font-medium text-ink/80">Quantity needed {form.unit && `(${form.unit})`}</label>
              <input
                required
                type="number"
                min="0"
                value={form.quantityNeeded}
                onChange={handleChange("quantityNeeded")}
                className="w-full mt-1 border border-ink/20 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink/80">Max price (N$)</label>
              <input
                required
                type="number"
                min="0"
                value={form.maxPrice}
                onChange={handleChange("maxPrice")}
                className="w-full mt-1 border border-ink/20 rounded-lg px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-ink/80">What matters to you</label>
            <textarea
              value={form.description}
              onChange={handleChange("description")}
              rows={3}
              className="w-full mt-1 border border-ink/20 rounded-lg px-3 py-2"
              placeholder="e.g. export grade, vaccinated stock, weekly standing order…"
            />
          </div>

          {error && <p className="text-clay text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold text-duskdeep rounded-lg py-3 font-semibold hover:bg-goldlight transition-colors disabled:opacity-50"
          >
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

        <div className="space-y-4">
          {result?.matches.map((m, i) => (
            <div key={m.listing.id} className="bg-white border border-ink/10 rounded-xl p-5">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <p className="font-mono text-xs text-gold">#{i + 1} match</p>
                  <p className="font-display text-lg font-semibold text-dusk">{m.listing.farmerName}</p>
                  <p className="text-sm text-ink/60">
                    {cropName(m.listing.crop)} · {regionName(m.listing.region)} · {m.listing.qualityGrade}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-3xl font-bold text-sage">{m.score}</p>
                  <p className="text-xs text-ink/50 font-mono">match score</p>
                </div>
              </div>

              <p className="text-sm text-ink/70 mt-3">{m.listing.description}</p>

              <div className="flex justify-between items-center mt-3 text-sm font-mono text-ink/60">
                <span>
                  {m.listing.quantity.toLocaleString()} {m.listing.unit} available
                </span>
                <span>
                  N${m.listing.askingPrice.toLocaleString()}/{m.listing.unit} · {m.listing.contact}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-ink/10">
                <ScoreBar label="Price fit" value={m.breakdown.priceFit} />
                <ScoreBar label="Quantity fit" value={m.breakdown.quantityFit} />
                <ScoreBar label="Region proximity" value={m.breakdown.regionProximity} />
                <ScoreBar label="Listing relevance" value={m.breakdown.descriptionRelevance} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
