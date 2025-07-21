import { connectDB, WaterEntry } from "../utils/db.js";

export default async (req, res) => {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await connectDB();

    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res
        .status(400)
        .json({ message: "Amount must be a positive number" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let waterEntry = await WaterEntry.findOne({
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    if (!waterEntry) {
      return res
        .status(404)
        .json({ message: "No water entry found for today" });
    }

    if (waterEntry.amount < amount) {
      return res
        .status(400)
        .json({ message: "Cannot remove more water than consumed today" });
    }

    // Remove the amount from total
    waterEntry.amount -= amount;

    // Add a negative entry to track the removal
    waterEntry.entries.push({
      amount: -amount,
      timestamp: new Date(),
      note: "Removed water",
    });

    await waterEntry.save();
    res.json(waterEntry);
  } catch (error) {
    console.error("Error removing water amount:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
