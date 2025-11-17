const express = require("express");
const Alert = require("../models/Alert");

const router = express.Router();

// GET /api/alerts - Get all alerts
router.get("/", async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ timestamp: -1 });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch alerts" });
  }
});

// POST /api/alerts/:id/acknowledge - Acknowledge an alert
router.post("/:id/acknowledge", async (req, res) => {
  try {
    const alert = await Alert.findOneAndUpdate(
      { id: req.params.id },
      { acknowledged: true },
      { new: true }
    );
    if (!alert) {
      return res.status(404).json({ error: "Alert not found" });
    }
    res.json(alert);
  } catch (error) {
    res.status(500).json({ error: "Failed to acknowledge alert" });
  }
});

module.exports = router;
