const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config({ path: __dirname + "/.env" });

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Error handling middleware for JSON parsing
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    console.error("JSON parsing error:", error.message);
    return res.status(400).json({ message: "Invalid JSON format" });
  }
  next();
});
app.use(
  cors({
    origin: [
      "https://water-front-2k86d9phd-ahmed-elmallahs-projects.vercel.app",
      "https://water-front-nflhajo0w-ahmed-elmallahs-projects.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Import WaterEntry model
const WaterEntry = require("./models/WaterEntry");

// Routes
app.get("/api/water/today", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let waterEntry = await WaterEntry.findOne({
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    if (!waterEntry) {
      // Create new entry for today
      waterEntry = new WaterEntry({
        date: today,
        amount: 0,
        goal: 3, // 3L default goal
        entries: [],
      });
      await waterEntry.save();
    }

    res.json(waterEntry);
  } catch (error) {
    console.error("Error fetching today data:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.post("/api/water/add", async (req, res) => {
  try {
    console.log("Received request body:", req.body);

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
      waterEntry = new WaterEntry({
        date: today,
        amount: 0,
        goal: 3, // 3L default goal
        entries: [],
      });
    }

    waterEntry.amount += amount;
    waterEntry.entries.push({
      amount: amount,
      timestamp: new Date(),
    });

    await waterEntry.save();
    res.json(waterEntry);
  } catch (error) {
    console.error("Error in add water:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.put("/api/water/goal", async (req, res) => {
  try {
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
});

// Get water history (last 30 days)
app.get("/api/water/history", async (req, res) => {
  try {
    const history = await WaterEntry.find().sort({ date: -1 }).limit(30);
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.get("/api/water/all", async (req, res) => {
  try {
    const allEntries = await WaterEntry.find().sort({ date: -1 });
    res.json(allEntries);
  } catch (error) {
    console.error("Error fetching all entries:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Remove water intake (remove specific entry)
app.delete("/api/water/remove/:entryId", async (req, res) => {
  try {
    const { entryId } = req.params;
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

    // Get the amount to remove
    const removedAmount = waterEntry.entries[entryIndex].amount;

    // Remove the entry
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
});

// Remove specific amount of water (latest entry)
app.delete("/api/water/remove-amount", async (req, res) => {
  try {
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
});

// Reset all water for today
app.post("/api/water/reset", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let waterEntry = await WaterEntry.findOne({
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    if (!waterEntry) {
      // If no entry, nothing to reset
      return res.json({ message: "Already reset.", reset: true });
    }

    waterEntry.amount = 0;
    waterEntry.entries = [];
    await waterEntry.save();
    res.json({
      message: "Water data reset for today.",
      reset: true,
      waterEntry,
    });
  } catch (error) {
    console.error("Error resetting water data:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Reset today's goal to default (3L)
app.post("/api/water/reset-goal", async (req, res) => {
  try {
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
        goal: 3,
        entries: [],
      });
    } else {
      waterEntry.goal = 3;
    }
    await waterEntry.save();
    res.json({ message: "Goal reset to 3L.", goal: 3, waterEntry });
  } catch (error) {
    console.error("Error resetting goal:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get goal reminder status
app.get("/api/water/reminder", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let waterEntry = await WaterEntry.findOne({
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    if (!waterEntry) {
      return res.json({
        currentAmount: 0,
        goal: 3,
        percentage: 0,
        needsReminder: true,
        message: "Start your hydration journey today!",
      });
    }

    const goalInMl = waterEntry.goal * 1000;
    const percentage = Math.min((waterEntry.amount / goalInMl) * 100, 100);
    const needsReminder = percentage < 100;
    const remainingMl = Math.max(0, goalInMl - waterEntry.amount);

    let message = "";
    if (percentage < 25) {
      message = `Time to start drinking water! You need ${remainingMl}ml to reach your goal.`;
    } else if (percentage < 50) {
      message = `Keep going! You're making progress. ${remainingMl}ml more to go.`;
    } else if (percentage < 75) {
      message = `Great job! You're more than halfway there. Just ${remainingMl}ml left.`;
    } else if (percentage < 100) {
      message = `Almost there! Just ${remainingMl}ml more to reach your goal.`;
    } else {
      message = "Congratulations! You've reached your daily goal!";
    }

    res.json({
      currentAmount: waterEntry.amount,
      goal: waterEntry.goal,
      percentage: Math.round(percentage),
      needsReminder: needsReminder,
      message: message,
      remainingMl: remainingMl,
    });
  } catch (error) {
    console.error("Error getting reminder:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Basic route
app.get("/", (req, res) => {
  res.json({ message: "Water Tracker API is running!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 API available at http://localhost:${PORT}`);
  console.log(`💾 Using MongoDB Atlas for data persistence`);
});
