const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    bridgeId: { type: String, required: true },
    bridgeName: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      required: true,
    },
    timestamp: { type: Date, default: Date.now },
    acknowledged: { type: Boolean, default: false },
    metric: { type: String },
    value: { type: Number },
    threshold: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Alert", alertSchema);
