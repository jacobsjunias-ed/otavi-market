import { useEffect, useState } from "react";
import Header from "./components/Header";
import Ticker from "./components/Ticker";
import PriceDashboard from "./components/PriceDashboard";
import ListingsBoard from "./components/ListingsBoard";
import MatchFinder from "./components/MatchFinder";
import { api } from "./api";

export default function App() {
  const [tab, setTab] = useState("prices");
  const [tickerItems, setTickerItems] = useState([]);
  const [tickerError, setTickerError] = useState(false);

  useEffect(() => {
    const tickerCrops = ["maize", "mahangu", "cattle", "grapes", "tomatoes", "goats"];
    Promise.all(tickerCrops.map((crop) => api.getPrices({ crop })))
      .then((results) => {
        const items = [];
        results.forEach((rows, i) => {
          const byRegion = {};
          rows.forEach((r) => {
            if (!byRegion[r.region]) byRegion[r.region] = [];
            byRegion[r.region].push(r);
          });
          const firstRegion = Object.keys(byRegion)[0];
          if (!firstRegion) return;
          const series = byRegion[firstRegion];
          const last = series[series.length - 1];
          const first = series[0];
          items.push({
            crop: tickerCrops[i].toUpperCase(),
            region: firstRegion,
            price: last.price,
            trend: first ? ((last.price - first.price) / first.price) * 100 : 0,
          });
        });
        setTickerItems(items);
      })
      .catch(() => setTickerError(true));
  }, []);

  return (
    <div className="min-h-screen bg-sand">
      <Header tab={tab} setTab={setTab} />

      <section className="bg-dusk text-sand">
        <div className="max-w-6xl mx-auto px-6 pt-14 pb-10">
          <p className="font-mono text-xs uppercase tracking-widest text-gold mb-3">
            Market intelligence for Namibian agriculture
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold leading-tight max-w-2xl">
            Know the price. Find the buyer. Move the harvest.
          </h1>
          <p className="text-sand/70 mt-4 max-w-xl">
            Live-style regional pricing across 14 regions and an AI matching engine that ranks buyers and sellers
            by price fit, quantity, location and produce quality — built for how Namibian farmers and buyers
            actually trade.
          </p>
        </div>
        {!tickerError && tickerItems.length > 0 && <Ticker items={tickerItems} />}
      </section>

      {tab === "prices" && <PriceDashboard />}
      {tab === "sell" && <ListingsBoard />}
      {tab === "buy" && <MatchFinder />}

      <footer className="border-t border-ink/10 mt-10">
        <div className="max-w-6xl mx-auto px-6 py-8 text-sm text-ink/50 flex flex-wrap justify-between gap-2">
          <span>Otavi Market — prototype built for portfolio demonstration. Prices are illustrative, not live.</span>
          <span className="font-mono">Windhoek, Namibia</span>
        </div>
      </footer>
    </div>
  );
}
