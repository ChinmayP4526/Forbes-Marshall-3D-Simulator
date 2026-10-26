const mongoose = require("mongoose");

const equipmentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: { type: String, required: true },
    name: { type: String, default: "" },
    x: { type: Number, required: true },
    z: { type: Number, required: true },
    rotation: { type: Number, default: 0 },
    assetUrl: { type: String, default: "" },
  },
  { _id: false }
);

const layoutSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      default: "Factory Layout 1",
    },
    building: {
      length: { type: Number, default: 100 },
      width: { type: Number, default: 60 },
      corridorWidth: { type: Number, default: 8 },
    },
    objects: {
      type: [equipmentSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Layout", layoutSchema);