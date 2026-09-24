import { useEffect, useState } from "react";
import Header from "./components/Header";
import Ticker from "./components/Ticker";
import PriceDashboard from "./components/PriceDashboard";
import ListingsBoard from "./components/ListingsBoard";
import MatchFinder from "./components/MatchFinder";
import { api } from "./api";
import { useCatalog } from "./CatalogContext";


import "leaflet/dist/leaflet.css";
import MapView from "./components/MapView";

const TABS = ["prices", "sell", "buy"];

function tabFromHash() {
  const id = window.location.hash.replace("#", "");
  return TABS.includes(id) ? id : "prices";
}

export default function App() {
  const [tab, setTab] = useState(tabFromHash);
  const [tickerItems, setTickerItems] = useState([]);
  const catalog = useCatalog();

  useEffect(() => {
    const onHash = () => setTab(tabFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const goTab = (id) => {
    setTab(id);
    window.location.hash = id;
  };

  useEffect(() => {
    const tickerCrops = ["maize", "mahangu", "cattle", "grapes", "tomatoes", "goats"];
    Promise.all(tickerCrops.map((crop) => api.getPrices({ crop })))
      .then((results) => {
        const items = [];
        results.forEach((rows, i) => {
          if (!rows.length) return;
          const latestMonth = rows[rows.length - 1].month;
          const latest = rows.filter((r) => r.month === latestMonth);
          const avg = latest.reduce((sum, r) => sum + r.price, 0) / latest.length;
          const firstMonth = rows[0].month;
          const first = rows.filter((r) => r.month === firstMonth);
          const firstAvg = first.reduce((sum, r) => sum + r.price, 0) / first.length;
          items.push({
            crop: tickerCrops[i].toUpperCase(),
            region: `${latest.length} regions`,
            price: avg,
            trend: firstAvg ? ((avg - firstAvg) / firstAvg) * 100 : 0,
          });
        });
        setTickerItems(items);
      })
      .catch(() => setTickerItems([]));
  }, []);

  return (
    <div className="min-h-screen bg-sand">
      <Header tab={tab} setTab={goTab} online={catalog.online} loading={catalog.loading} />

      {/* Hero / Information Banner Section */}
      <section className="bg-dusk text-sand">
        <div className="max-w-6xl mx-auto px-6 pt-14 pb-10">
          <p className="font-mono text-xs uppercase tracking-widest text-gold mb-3">
            Market intelligence for Namibian agriculture
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold leading-tight max-w-2xl">
            Know the price. Find the buyer. Move the harvest.
          </h1>
          <p className="text-sand/70 mt-4 max-w-xl">
            Regional pricing across 14 regions and an AI matching engine that ranks buyers and sellers by price
            fit, quantity, location and produce quality — built for how Namibian farmers and buyers actually trade.
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <button type="button" onClick={() => goTab("prices")} className="btn-gold">
              Browse prices
            </button>
            <button type="button" onClick={() => goTab("sell")} className="btn-ghost">
              Post a listing
            </button>
            <button type="button" onClick={() => goTab("buy")} className="btn-ghost">
              Find sellers
            </button>
          </div>
        </div>
        {tickerItems.length > 0 && <Ticker items={tickerItems} />}
      </section>

     
      <section className="max-w-6xl mx-auto px-6 pt-8">
        <div className="bg-white border border-ink/10 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="font-display text-xl font-bold text-ink">Agri-Spatial GeoView</h2>
              <p className="text-xs text-ink/60 mt-0.5">Visualizing live listings, buyer clusters, and regional pricing distributions</p>
            </div>
            <span className="text-[10px] font-mono uppercase bg-gold/10 border border-gold/30 text-ink/80 px-2 py-0.5 rounded-full font-bold">
              Spatial Sync Engine Active
            </span>
          </div>
          <MapView />
        </div>
      </section>

      {/* Network Alert Message Context Area */}
      {catalog.error && (
        <div className="max-w-6xl mx-auto px-6 pt-6">
          <div className="bg-clay/10 border border-clay/30 text-clay rounded-xl px-4 py-3 text-sm flex flex-wrap items-center justify-between gap-3">
            <span>{catalog.error}</span>
            <button type="button" onClick={catalog.reload} className="font-medium underline">
              Retry connection
            </button>
          </div>
        </div>
      )}

    
      <div className="mt-4">
        {tab === "prices" && <PriceDashboard />}
        {tab === "sell" && <ListingsBoard />}
        {tab === "buy" && <MatchFinder />}
      </div>

      <footer className="border-t border-ink/10 mt-10">
        <div className="max-w-6xl mx-auto px-6 py-8 text-sm text-ink/50 flex flex-wrap justify-between gap-2">
          <span>Otavi Market — prototype. Prices are illustrative, not live NAB/AMTA feeds.</span>
          <span className="font-mono">Windhoek, Namibia</span>
        </div>
      </footer>
    </div>
  );
}
