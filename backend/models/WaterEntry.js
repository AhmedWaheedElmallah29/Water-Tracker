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
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Create a compound index for userId and date to ensure one entry per user per day
waterEntrySchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("WaterEntry", waterEntrySchema);
