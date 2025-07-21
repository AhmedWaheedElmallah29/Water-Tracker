const mongoose = require("mongoose");

const waterEntrySchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    goal: {
      type: Number,
      required: true,
      default: 3, // Default 3L goal
      min: 0,
    },
    entries: [
      {
        amount: {
          type: Number,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        note: {
          type: String,
          default: "",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create a compound index for date to ensure one entry per day
waterEntrySchema.index({ date: 1 }, { unique: true });

module.exports = mongoose.model("WaterEntry", waterEntrySchema);
