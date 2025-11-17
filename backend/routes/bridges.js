const express = require("express");
const Bridge = require("../models/Bridge");

const router = express.Router();

// GET /api/bridges - Get all bridges
router.get("/", async (req, res) => {
  try {
    const bridges = await Bridge.find();
    res.json(bridges);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch bridges" });
  }
});

// GET /api/bridges/:id - Get a specific bridge
router.get("/:id", async (req, res) => {
  try {
    const bridge = await Bridge.findOne({ id: req.params.id });
    if (!bridge) {
      return res.status(404).json({ error: "Bridge not found" });
    }
    res.json(bridge);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch bridge" });
  }
});

module.exports = router;
