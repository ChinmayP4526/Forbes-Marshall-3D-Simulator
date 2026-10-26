require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const layoutRoutes = require("./routes/layoutRoutes");

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "Forbes Marshall API" });
});

app.use("/api/layouts", layoutRoutes);

app.use((error, _req, res, _next) => {
  console.error(error);

  const status = error.name === "ValidationError" ? 400 : 500;

  res.status(status).json({
    message: status === 400 ? error.message : "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`API running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Could not connect to MongoDB:", error.message);
    process.exit(1);
  }
}

startServer();