const express = require("express");
const cors = require("cors");
const apiRouter = require("./routes/api");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "ok", service: "Namibia Agri Market API" });
});

app.use("/api", apiRouter);

app.use((req, res) => res.status(404).json({ error: "Not found" }));

app.listen(PORT, () => {
  console.log(`Namibia Agri Market API running on http://localhost:${PORT}`);
});
