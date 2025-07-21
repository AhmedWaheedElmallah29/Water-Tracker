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

  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await connectDB();

    const { goal } = req.body;
    if (!goal || goal <= 0) {
      return res
        .status(400)
        .json({ message: "Goal must be a positive number" });
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
      waterEntry = new WaterEntry({
        date: today,
        amount: 0,
        goal: goal,
        entries: [],
      });
    } else {
      waterEntry.goal = goal;
    }

    await waterEntry.save();
    res.json(waterEntry);
  } catch (error) {
    console.error("Error updating goal:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
