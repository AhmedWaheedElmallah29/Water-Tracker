const express = require("express");
const router = express.Router();
const WaterEntry = require("../models/WaterEntry");
const { body, validationResult } = require("express-validator");

// Get today's water data
router.get("/today", async (req, res) => {
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
        goal: 2000,
        entries: [],
      });
      await waterEntry.save();
    }

    res.json(waterEntry);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Add water intake
router.post(
  "/add",
  [
    body("amount").isNumeric().withMessage("Amount must be a number"),
    body("amount").isFloat({ min: 0 }).withMessage("Amount must be positive"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { amount } = req.body;
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
          goal: 2000,
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
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// Update daily goal
router.put(
  "/goal",
  [
    body("goal").isNumeric().withMessage("Goal must be a number"),
    body("goal").isFloat({ min: 0 }).withMessage("Goal must be positive"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { goal } = req.body;
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
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// Get water history (last 7 days)
router.get("/history", async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const history = await WaterEntry.find({
      date: { $gte: sevenDaysAgo },
    }).sort({ date: -1 });

    res.json(history);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get all water data
router.get("/all", async (req, res) => {
  try {
    const allEntries = await WaterEntry.find().sort({ date: -1 });
    res.json(allEntries);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
