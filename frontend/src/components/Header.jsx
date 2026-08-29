export default function Header({ tab, setTab }) {
  const tabs = [
    { id: "prices", label: "Market Prices" },
    { id: "sell", label: "Sell Produce" },
    { id: "buy", label: "Find Sellers" },
  ];

  return (
    <header className="sticky top-0 z-20 bg-dusk text-sand border-b border-white/10">
      <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-2xl font-semibold tracking-tight">Otavi</span>
          <span className="font-mono text-xs uppercase tracking-widest text-gold">Market</span>
        </div>
        <nav className="flex gap-1 bg-white/5 rounded-full p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
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
    </header>
  );
}
