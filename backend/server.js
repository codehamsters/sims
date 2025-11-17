const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

require("./config/mqtt");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
const bridgeRoutes = require("./routes/bridges");
const alertRoutes = require("./routes/alerts");
const PushToken = require("./models/PushToken");

app.use("/api/bridges", bridgeRoutes);
app.use("/api/alerts", alertRoutes);

app.post("/api/register-push-token", async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: "Token is required" });
  }

  try {
    const existingToken = await PushToken.findOne({ token });
    if (existingToken) {
      return res.status(200).json({ message: "Token already registered" });
    }

    const newToken = new PushToken({ token });
    await newToken.save();
    res.status(201).json({ message: "Token registered successfully" });
  } catch (error) {
    console.error("Error registering push token:", error);
    res.status(500).json({ error: "Failed to register token" });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Bridge Alert System Backend is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
