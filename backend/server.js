const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { connectDB, initializeDatabase } = require("./config/db");
const { seedInitialData } = require("./models/careerModel");
const careerRoutes = require("./routes/careerRoutes");

const app = express();
const PORT = Number(process.env.PORT || 5000);

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000"
  })
);

app.use(express.json());

app.get("/", (_request, response) => {
  response.json({ message: "Career Assessment API is running." });
});

app.use("/api", careerRoutes);

app.use((_request, response) => {
  response.status(404).json({ message: "Route not found." });
});

async function startServer() {
  try {
    await connectDB();
    await initializeDatabase();
    await seedInitialData();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
}

startServer();
