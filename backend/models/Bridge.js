const mongoose = require("mongoose");

const bridgeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    location: { type: String, required: true },
    status: {
      type: String,
      enum: ["healthy", "warning", "critical"],
      default: "healthy",
    },
    lastInspection: { type: Date, default: Date.now },
    metrics: {
      vibration: { type: Number, required: true },
      stress: { type: Number, required: true },
      tilt: { type: Number, required: true },
      temperature: { type: Number, required: true },
    },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bridge", bridgeSchema);
