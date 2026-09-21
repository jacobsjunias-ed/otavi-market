import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { useCatalog } from "../CatalogContext";

const emptyForm = {
  farmerName: "",
  region: "",
  crop: "",
  quantity: "",
  askingPrice: "",
  qualityGrade: "Grade A",
  description: "",
  contact: "",
};

export default function ListingsBoard() {
  const { regions, crops, qualityGrades, regionName, cropName } = useCatalog();
  const [listings, setListings] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [filterCrop, setFilterCrop] = useState("");
  const [filterRegion, setFilterRegion] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const refresh = () =>
    api
      .getListings()
      .then(setListings)
      .catch((e) => setError(e.message));

  useEffect(() => {
    refresh();
  }, []);

  const selectedCropObj = crops.find((c) => c.id === form.crop);

  const visible = useMemo(
    () =>
      listings.filter(
        (l) => (!filterCrop || l.crop === filterCrop) && (!filterRegion || l.region === filterRegion)
      ),
    [listings, filterCrop, filterRegion]
  );

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    try {
      await api.createListing({
        ...form,
        quantity: Number(form.quantity),
        askingPrice: Number(form.askingPrice),
      });
      setForm(emptyForm);
      setSuccess(true);
      refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-6 py-10 grid lg:grid-cols-[1fr,1.2fr] gap-10">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-gold mb-1">List your harvest</p>
        <h1 className="font-display text-3xl font-semibold text-dusk mb-6">Post produce for sale</h1>

        <form onSubmit={handleSubmit} className="bg-white border border-ink/10 rounded-2xl p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-ink/80" htmlFor="farmerName">
              Your name / farm
            </label>
            <input
              id="farmerName"
              required
              value={form.farmerName}
              onChange={handleChange("farmerName")}
              className="field"
              placeholder="e.g. Nangolo Shikongo"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-ink/80" htmlFor="listing-region">
                Region
              </label>
              <select id="listing-region" required value={form.region} onChange={handleChange("region")} className="field">
                <option value="">Select…</option>
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-ink/80" htmlFor="listing-crop">
                Crop / livestock
              </label>
              <select id="listing-crop" required value={form.crop} onChange={handleChange("crop")} className="field">
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
              <label className="text-sm font-medium text-ink/80" htmlFor="quantity">
                Quantity {selectedCropObj ? `(${selectedCropObj.unit})` : ""}
              </label>
              <input
                id="quantity"
                required
                type="number"
                min="0.01"
                step="any"
                value={form.quantity}
                onChange={handleChange("quantity")}
                className="field"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink/80" htmlFor="askingPrice">
                Asking price (N$)
              </label>
              <input
                id="askingPrice"
                required
                type="number"
                min="0.01"
                step="any"
                value={form.askingPrice}
                onChange={handleChange("askingPrice")}
                className="field"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-ink/80" htmlFor="qualityGrade">
              Quality grade
            </label>
            <select id="qualityGrade" value={form.qualityGrade} onChange={handleChange("qualityGrade")} className="field">
              {qualityGrades.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-ink/80" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              value={form.description}
              onChange={handleChange("description")}
              rows={3}
              maxLength={500}
              className="field"
              placeholder="Condition, storage, transport availability…"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-ink/80" htmlFor="contact">
              Contact number
            </label>
            <input
              id="contact"
              value={form.contact}
              onChange={handleChange("contact")}
              className="field"
              placeholder="081 XXX XXXX"
            />
          </div>

          {error && <p className="text-clay text-sm">{error}</p>}
          {success && <p className="text-sage text-sm">Listing posted successfully.</p>}

          <button type="submit" disabled={submitting} className="w-full btn-primary disabled:opacity-50">
            {submitting ? "Posting…" : "Post listing"}
          </button>
        </form>
      </div>

      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-gold mb-1">Live board</p>
        <h2 className="font-display text-2xl font-semibold text-dusk mb-4">Current listings ({visible.length})</h2>
        <div className="flex flex-wrap gap-3 mb-4">
          <select aria-label="Filter crop" value={filterCrop} onChange={(e) => setFilterCrop(e.target.value)} className="field !mt-0">
            <option value="">All crops</option>
            {crops.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter region"
            value={filterRegion}
            onChange={(e) => setFilterRegion(e.target.value)}
            className="field !mt-0"
          >
            <option value="">All regions</option>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-3 max-h-[720px] overflow-y-auto pr-1">
          {visible.length === 0 && (
            <div className="bg-white border border-dashed border-ink/20 rounded-2xl p-8 text-center text-ink/50 text-sm">
              No listings match these filters.
            </div>
          )}
          {visible.map((l) => (
            <div key={l.id} className="bg-white border border-ink/10 rounded-xl p-4">
              <div className="flex justify-between items-start gap-3">
                <div>
                  <p className="font-display text-lg font-semibold text-dusk">{cropName(l.crop)}</p>
                  <p className="text-sm text-ink/60">
                    {l.farmerName} · {regionName(l.region)}
                  </p>
                </div>
                <span className="font-mono text-xs bg-sage/15 text-sage px-2 py-1 rounded-full whitespace-nowrap">
                  {l.qualityGrade}
                </span>
              </div>
              {l.description && <p className="text-sm text-ink/70 mt-2">{l.description}</p>}
              <div className="flex justify-between items-center mt-3 text-sm">
                <span className="font-mono text-ink/60">
                  {l.quantity.toLocaleString()} {l.unit} available
                </span>
                <span className="font-display font-semibold text-dusk">
                  N${l.askingPrice.toLocaleString()}/{l.unit}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
