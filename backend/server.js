const express = require("express");
const cors = require("cors");
const apiRouter = require("./routes/api");

const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins = (process.env.FRONTEND_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

app.disable("x-powered-by");
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Origin not allowed"));
    },
  })
);
app.use(express.json({ limit: "32kb" }));

app.get("/", (req, res) => {
  res.json({ status: "ok", service: "Namibia Agri Market API" });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", apiRouter);

app.use((req, res) => res.status(404).json({ error: "Not found" }));

app.use((err, req, res, next) => {
  if (err.message === "Origin not allowed") {
    return res.status(403).json({ error: "CORS blocked this origin" });
  }
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON body" });
  }
  console.error(err);
  res.status(500).json({ error: "Unexpected server error" });
});

app.listen(PORT, () => {
  console.log(`Namibia Agri Market API running on http://localhost:${PORT}`);
});
