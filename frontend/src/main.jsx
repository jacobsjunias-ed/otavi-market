import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { CatalogProvider } from "./CatalogContext.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <CatalogProvider>
      <App />
    </CatalogProvider>
  </React.StrictMode>
);
