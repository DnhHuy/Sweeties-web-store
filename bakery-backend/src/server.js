require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./config/db");
const productRoutes = require("./routes/productRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Bakery API!",
    status: "success",
  });
});

app.get("/api/health", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS result");

    res.json({
      message: "Bakery server and MySQL are connected!",
      database: rows[0].result === 1 ? "connected" : "unknown",
    });
  } catch (error) {
    console.error("Database connection error:", error.message);

    res.status(500).json({
      message: "Cannot connect to MySQL",
    });
  }
});

app.use("/api/products", productRoutes);

app.listen(PORT, () => {
  console.log(`Bakery server running at http://localhost:${PORT}`);
});
