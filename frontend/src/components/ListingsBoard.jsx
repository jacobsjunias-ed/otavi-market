import { useEffect, useState } from "react";
import { api } from "../api";

const emptyForm = {
  farmerName: "",
  region: "",
  crop: "",
  quantity: "",
  unit: "",
  askingPrice: "",
  qualityGrade: "Grade A",
  description: "",
  contact: "",
};

export default function ListingsBoard() {
  const [regions, setRegions] = useState([]);
  const [crops, setCrops] = useState([]);
  const [listings, setListings] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const refresh = () => api.getListings().then(setListings).catch((e) => setError(e.message));

  useEffect(() => {
    Promise.all([api.getRegions(), api.getCrops()])
      .then(([r, c]) => {
        setRegions(r);
        setCrops(c);
      })
      .catch((e) => setError(e.message));
    refresh();
  }, []);

  const selectedCropObj = crops.find((c) => c.id === form.crop);

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

  const regionName = (id) => regions.find((r) => r.id === id)?.name || id;
  const cropName = (id) => crops.find((c) => c.id === id)?.name || id;

  return (
    <section className="max-w-6xl mx-auto px-6 py-10 grid lg:grid-cols-[1fr,1.2fr] gap-10">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-gold mb-1">List your harvest</p>
        <h1 className="font-display text-3xl font-semibold text-dusk mb-6">Post produce for sale</h1>

        <form onSubmit={handleSubmit} className="bg-white border border-ink/10 rounded-2xl p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-ink/80">Your name / farm</label>
            <input
              required
              value={form.farmerName}
              onChange={handleChange("farmerName")}
              className="w-full mt-1 border border-ink/20 rounded-lg px-3 py-2"
              placeholder="e.g. Nangolo Shikongo"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-ink/80">Region</label>
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
              <label className="text-sm font-medium text-ink/80">Crop / livestock</label>
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
              <label className="text-sm font-medium text-ink/80">
                Quantity {selectedCropObj ? `(${selectedCropObj.unit})` : ""}
              </label>
              <input
                required
                type="number"
                min="0"
                value={form.quantity}
                onChange={handleChange("quantity")}
                className="w-full mt-1 border border-ink/20 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink/80">Asking price (N$)</label>
              <input
                required
                type="number"
                min="0"
                value={form.askingPrice}
                onChange={handleChange("askingPrice")}
                className="w-full mt-1 border border-ink/20 rounded-lg px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-ink/80">Quality grade</label>
            <select
              value={form.qualityGrade}
              onChange={handleChange("qualityGrade")}
              className="w-full mt-1 border border-ink/20 rounded-lg px-3 py-2"
            >
              <option>Grade A</option>
              <option>Grade B</option>
              <option>Export Grade</option>
              <option>Ungraded</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-ink/80">Description</label>
            <textarea
              value={form.description}
              onChange={handleChange("description")}
              rows={3}
              className="w-full mt-1 border border-ink/20 rounded-lg px-3 py-2"
              placeholder="Condition, storage, transport availability…"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-ink/80">Contact number</label>
            <input
              value={form.contact}
              onChange={handleChange("contact")}
              className="w-full mt-1 border border-ink/20 rounded-lg px-3 py-2"
              placeholder="081 XXX XXXX"
            />
          </div>

          {error && <p className="text-clay text-sm">{error}</p>}
          {success && <p className="text-sage text-sm">Listing posted successfully.</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-dusk text-sand rounded-lg py-3 font-medium hover:bg-duskdeep transition-colors disabled:opacity-50"
          >
            {submitting ? "Posting…" : "Post listing"}
          </button>
        </form>
      </div>

      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-gold mb-1">Live board</p>
        <h2 className="font-display text-2xl font-semibold text-dusk mb-6">Current listings ({listings.length})</h2>
        <div className="space-y-3 max-h-[720px] overflow-y-auto pr-1">
          {listings.map((l) => (
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
              <p className="text-sm text-ink/70 mt-2">{l.description}</p>
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
