import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "./api";

const CatalogContext = createContext(null);

export function CatalogProvider({ children }) {
  const [regions, setRegions] = useState([]);
  const [crops, setCrops] = useState([]);
  const [qualityGrades, setQualityGrades] = useState(["Grade A", "Grade B", "Export Grade", "Ungraded"]);
  const [buyerTypes, setBuyerTypes] = useState(["Buyer", "Retail supplier", "Processor", "Exporter"]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(false);

  const reload = () => {
    setLoading(true);
    api
      .getMeta()
      .then((meta) => {
        setRegions(meta.regions || []);
        setCrops(meta.crops || []);
        if (meta.qualityGrades?.length) setQualityGrades(meta.qualityGrades);
        if (meta.buyerTypes?.length) setBuyerTypes(meta.buyerTypes);
        setOnline(true);
        setError(null);
      })
      .catch((e) => {
        setOnline(false);
        setError(e.message);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    reload();
  }, []);

  const value = useMemo(
    () => ({
      regions,
      crops,
      qualityGrades,
      buyerTypes,
      error,
      loading,
      online,
      reload,
      regionName: (id) => regions.find((r) => r.id === id)?.name || id,
      cropName: (id) => crops.find((c) => c.id === id)?.name || id,
    }),
    [regions, crops, qualityGrades, buyerTypes, error, loading, online]
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used within CatalogProvider");
  return ctx;
}
