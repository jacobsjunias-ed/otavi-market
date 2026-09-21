export default function Header({ tab, setTab, online, loading }) {
  const tabs = [
    { id: "prices", label: "Market Prices" },
    { id: "sell", label: "Sell Produce" },
    { id: "buy", label: "Find Sellers" },
  ];

  return (
    <header className="sticky top-0 z-20 bg-dusk text-sand border-b border-white/10">
      <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <a href="#prices" onClick={() => setTab("prices")} className="flex items-baseline gap-2">
          <span className="font-display text-2xl font-semibold tracking-tight">Otavi</span>
          <span className="font-mono text-xs uppercase tracking-widest text-gold">Market</span>
        </a>
        <div className="flex items-center gap-3">
          <span
            className={`hidden sm:inline font-mono text-[10px] uppercase tracking-widest ${
              loading ? "text-sand/50" : online ? "text-sage" : "text-clay"
            }`}
          >
            {loading ? "Connecting…" : online ? "API online" : "API offline"}
          </span>
          <nav className="flex gap-1 bg-white/5 rounded-full p-1" role="tablist" aria-label="Main sections">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  tab === t.id ? "bg-gold text-duskdeep" : "text-sand/80 hover:text-sand"
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
