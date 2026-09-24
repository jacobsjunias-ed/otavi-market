import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import { API_BASE } from '../api';

// Generates custom modern glowing SVG pin-drops to replace default generic markers
const createCustomMarker = (type) => {
  const color = type === 'seller' ? '#10b981' : '#3b82f6';
  const svgHtml = `
    <div class="relative flex items-center justify-center w-6 h-6 rounded-full border-2 border-white shadow-xl" style="background: ${color};">
      <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
      <div class="absolute -bottom-1 w-1.5 h-1.5 rotate-45" style="background: ${color};"></div>
    </div>
  `;
  return L.divIcon({
    html: svgHtml,
    className: 'custom-spatial-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 24]
  });
};

const fallbackGeoJson = {
  "type": "FeatureCollection",
  "features": [
    { "type": "Feature", "properties": { "name": "Zambezi" }, "geometry": { "type": "Polygon", "coordinates": [[ [23.5, -17.5], [25.2, -17.4], [25.3, -18.0], [24.0, -18.2], [23.5, -17.5] ]] } },
    { "type": "Feature", "properties": { "name": "Kavango East" }, "geometry": { "type": "Polygon", "coordinates": [[ [19.5, -17.8], [21.5, -17.9], [21.4, -18.5], [20.0, -18.4], [19.5, -17.8] ]] } },
    { "type": "Feature", "properties": { "name": "Kavango West" }, "geometry": { "type": "Polygon", "coordinates": [[ [18.2, -17.5], [19.5, -17.8], [19.4, -18.6], [18.1, -18.4], [18.2, -17.5] ]] } },
    { "type": "Feature", "properties": { "name": "Ohangwena" }, "geometry": { "type": "Polygon", "coordinates": [[ [15.8, -17.3], [17.5, -17.4], [17.4, -17.7], [15.9, -17.6], [15.8, -17.3] ]] } },
    { "type": "Feature", "properties": { "name": "Omusati" }, "geometry": { "type": "Polygon", "coordinates": [[ [14.2, -17.2], [15.2, -17.3], [15.1, -18.3], [14.1, -18.2], [14.2, -17.2] ]] } },
    { "type": "Feature", "properties": { "name": "Oshana" }, "geometry": { "type": "Polygon", "coordinates": [[ [15.4, -17.6], [16.0, -17.7], [15.9, -18.4], [15.3, -18.3], [15.4, -17.6] ]] } },
    { "type": "Feature", "properties": { "name": "Oshikoto" }, "geometry": { "type": "Polygon", "coordinates": [[ [16.0, -17.6], [17.5, -17.8], [17.3, -19.2], [15.8, -19.0], [16.0, -17.6] ]] } },
    { "type": "Feature", "properties": { "name": "Otjozondjupa" }, "geometry": { "type": "Polygon", "coordinates": [[ [16.0, -19.2], [20.5, -19.3], [21.0, -21.2], [16.2, -21.0], [16.0, -19.2] ]] } },
    { "type": "Feature", "properties": { "name": "Khomas" }, "geometry": { "type": "Polygon", "coordinates": [[ [16.5, -22.1], [18.2, -22.2], [18.0, -23.2], [16.3, -23.0], [16.5, -22.1] ]] } },
    { "type": "Feature", "properties": { "name": "Erongo" }, "geometry": { "type": "Polygon", "coordinates": [[ [14.0, -21.0], [16.2, -21.0], [16.3, -23.0], [14.2, -23.1], [14.0, -21.0] ]] } },
    { "type": "Feature", "properties": { "name": "Hardap" }, "geometry": { "type": "Polygon", "coordinates": [[ [14.8, -23.1], [19.8, -23.3], [19.6, -25.5], [15.0, -25.2], [14.8, -23.1] ]] } },
    { "type": "Feature", "properties": { "name": "Karas" }, "geometry": { "type": "Polygon", "coordinates": [[ [15.0, -25.2], [20.0, -25.6], [19.8, -28.9], [16.2, -28.8], [15.0, -25.2] ]] } },
    { "type": "Feature", "properties": { "name": "Kunene" }, "geometry": { "type": "Polygon", "coordinates": [[ [11.7, -17.2], [14.2, -17.2], [15.8, -19.0], [13.2, -21.0], [11.7, -17.2] ]] } },
    { "type": "Feature", "properties": { "name": "Omaheke" }, "geometry": { "type": "Polygon", "coordinates": [[ [18.2, -21.2], [21.0, -21.2], [20.8, -24.0], [18.4, -23.8], [18.2, -21.2] ]] } }
  ]
};

export default function MapView() {
  const [mapData, setMapData] = useState({ sellers: [], buyers: [] });
  const [selectedCrop, setSelectedCrop] = useState('maize');
  const [regionalStats, setRegionalStats] = useState({});
  const [activeRegion, setActiveRegion] = useState(null);
  const [loading, setLoading] = useState(true);
  const geoJsonRef = useRef(null);

  useEffect(() => {
    fetch(`${API_BASE}/map-data`)
      .then(res => res.json())
      .then(data => {
        setMapData(data);
        processRegionalMetrics(data.sellers, data.buyers, selectedCrop);
        setLoading(false);
      })
      .catch(err => console.error("Metrics sync barrier:", err));
  }, [selectedCrop]);

  const processRegionalMetrics = (sellers, buyers, crop) => {
    const stats = {};

    fallbackGeoJson.features.forEach(f => {
      const id = f.properties.name.toLowerCase().replace(/\s+/g, '-');
      stats[id] = { name: f.properties.name, avgPrice: 0, sellerCount: 0, buyerCount: 0, totalVolume: 0 };
    });

    sellers.forEach(s => {
      if (s.crop && s.crop.toLowerCase() === crop.toLowerCase()) {
        const id = s.region;
        if (stats[id]) {
          stats[id].avgPrice += Number(s.askingPrice);
          stats[id].sellerCount += 1;
          stats[id].totalVolume += Number(s.quantity || 0);
        }
      }
    });

    buyers.forEach(b => {
      if (b.crop && b.crop.toLowerCase() === crop.toLowerCase()) {
        const id = b.region;
        if (stats[id]) stats[id].buyerCount += 1;
      }
    });

    Object.keys(stats).forEach(id => {
      if (stats[id].sellerCount > 0) {
        stats[id].avgPrice = stats[id].avgPrice / stats[id].sellerCount;
      }
    });

    setRegionalStats(stats);
    if (!activeRegion) {
      setActiveRegion(stats['khomas'] || Object.values(stats)[0]);
    }
  };

  const getHeatmapColor = (price) => {
    if (!price) return 'rgba(30, 41, 59, 0.4)';
    return price > 25 ? 'rgba(16, 185, 129, 0.75)' :
           price > 20 ? 'rgba(52, 211, 153, 0.6)'  :
           price > 15 ? 'rgba(59, 130, 246, 0.55)' :
                        'rgba(96, 165, 250, 0.4)';
  };

  const styleGeoJsonFeature = (feature) => {
    const id = feature.properties.name.toLowerCase().replace(/\s+/g, '-');
    const metric = regionalStats[id];
    const isFocused = activeRegion && activeRegion.name === feature.properties.name;

    return {
      fillColor: getHeatmapColor(metric?.avgPrice),
      weight: isFocused ? 2.5 : 1,
      opacity: 1,
      color: isFocused ? '#38bdf8' : '#475569',
      dashArray: isFocused ? '' : '3',
      fillOpacity: isFocused ? 0.75 : 0.4
    };
  };

  const onEachFeatureHandler = (feature, layer) => {
    const id = feature.properties.name.toLowerCase().replace(/\s+/g, '-');

    layer.on({
      mouseover: (e) => {
        e.target.setStyle({ fillOpacity: 0.7, weight: 2, color: '#f3f4f6' });
      },
      mouseout: (e) => {
        if (geoJsonRef.current) geoJsonRef.current.resetStyle(e.target);
      },
      click: () => {
        setActiveRegion(regionalStats[id]);
      }
    });
  };

  if (loading) return <div className="p-8 text-slate-400 font-mono text-sm animate-pulse">Initializing Spatial Analytics Environment...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-2xl">

      {/* LEFT PANEL: Analytics Workspace Sidebar */}
      <div className="lg:col-span-1 flex flex-col justify-between space-y-4 bg-slate-900/60 backdrop-blur-xl p-5 rounded-xl border border-slate-800/80">
        <div>
          <label className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase">Telemetry Filter</label>
          <select
            className="w-full mt-1.5 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-bold text-slate-200 focus:outline-none focus:border-sky-500 transition-all cursor-pointer"
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
          >
            <option value="maize">White Maize (Staple)</option>
            <option value="mahangu">Mahangu (Millet)</option>
            <option value="sorghum">Sorghum</option>
            <option value="cattle">Beef Cattle</option>
          </select>

          {activeRegion && (
            <div className="mt-6 space-y-4">
              <div className="border-b border-slate-800 pb-2">
                <span className="text-[9px] font-mono font-extrabold px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20 text-sky-400 uppercase">Selected Zone</span>
                <h3 className="text-xl font-black text-white mt-1.5 tracking-tight">{activeRegion.name}</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/50">
                  <div className="text-[10px] font-mono text-slate-500">Market Average</div>
                  <div className="text-sm font-black text-emerald-400 mt-0.5">
                    {activeRegion.avgPrice > 0 ? `N$ ${activeRegion.avgPrice.toFixed(2)}/kg` : 'No Data'}
                  </div>
                </div>
                <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/50">
                  <div className="text-[10px] font-mono text-slate-500">Trade Volume</div>
                  <div className="text-sm font-black text-slate-200 mt-0.5">{activeRegion.totalVolume.toLocaleString()} kg</div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs border-b border-slate-800/30 pb-1">
                  <span className="text-slate-400">Active Farmers</span>
                  <span className="font-bold text-emerald-400 font-mono">{activeRegion.sellerCount} nodes</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Registered Buyers</span>
                  <span className="font-bold text-blue-400 font-mono">{activeRegion.buyerCount} clusters</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="text-[9px] font-mono text-slate-600 text-center pt-4 border-t border-slate-800/50">
          OTAVI MARKET // GEOVIEW
        </div>
      </div>

      {/* RIGHT PANEL: The actual map */}
      <div className="lg:col-span-3 rounded-xl overflow-hidden border border-slate-800/80 relative z-10" style={{ height: '600px' }}>
        <MapContainer center={[-22.0000, 17.0000]} zoom={6} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <GeoJSON
            ref={geoJsonRef}
            data={fallbackGeoJson}
            style={styleGeoJsonFeature}
            onEachFeature={onEachFeatureHandler}
          />

          {mapData.sellers.map(s => s.lat && s.lng && (
            <Marker key={`seller-${s.id}`} position={[s.lat, s.lng]} icon={createCustomMarker('seller')}>
              <Popup>
                <div className="text-xs font-sans">
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded">Seller</span>
                  <div className="font-bold text-sm mt-1">{s.crop}</div>
                  <div>Quantity: {s.quantity} {s.unit}</div>
                  <div className="text-emerald-700 font-bold mt-0.5">Price: N$ {s.askingPrice}</div>
                </div>
              </Popup>
            </Marker>
          ))}

          {mapData.buyers.map(b => b.lat && b.lng && (
            <Marker key={`buyer-${b.id}`} position={[b.lat, b.lng]} icon={createCustomMarker('buyer')}>
              <Popup>
                <div className="text-xs font-sans">
                  <span className="bg-blue-100 text-blue-800 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded">Buyer</span>
                  <div className="font-bold text-sm mt-1">{b.crop} Demand</div>
                  <div>Looking for: {b.quantityNeeded || b.quantity || 'Bulk'} {b.unit || ''}</div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}