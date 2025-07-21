import mongoose from "mongoose";
import process from "process";

// MongoDB Connection
export const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      return; // Already connected
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    throw err;
  }
};

// WaterEntry Schema
const waterEntrySchema = new mongoose.Schema({
  date: { type: Date, required: true },
  amount: { type: Number, default: 0 },
  goal: { type: Number, default: 3 },
  entries: [
    {
      amount: { type: Number, required: true },
      timestamp: { type: Date, default: Date.now },
      note: { type: String },
    },
  ],
});

export const WaterEntry =
  mongoose.models.WaterEntry || mongoose.model("WaterEntry", waterEntrySchema);
