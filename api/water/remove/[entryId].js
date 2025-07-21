import { connectDB, WaterEntry } from "../../utils/db.js";

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

    const { entryId } = req.query;
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

    // Find the specific entry to remove
    const entryIndex = waterEntry.entries.findIndex(
      (entry) => entry._id.toString() === entryId
    );

    if (entryIndex === -1) {
      return res.status(404).json({ message: "Entry not found" });
    }

    const removedAmount = waterEntry.entries[entryIndex].amount;
    waterEntry.entries.splice(entryIndex, 1);

    // Update total amount (handle both positive and negative amounts)
    if (removedAmount > 0) {
      waterEntry.amount -= removedAmount;
    } else {
      // If it's a negative entry (removed water), add it back
      waterEntry.amount += Math.abs(removedAmount);
    }

    // Ensure amount doesn't go below 0
    if (waterEntry.amount < 0) {
      waterEntry.amount = 0;
    }

    await waterEntry.save();
    res.json(waterEntry);
  } catch (error) {
    console.error("Error removing water entry:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
