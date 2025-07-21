import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  FaTint,
  FaHistory,
  FaPlus,
  FaCrosshairs,
  FaRedo,
} from "react-icons/fa";
import "./App.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api/water";

const BOTTLE_SIZES = [
  { name: "Small Glass", size: 200, icon: "🥤" },
  { name: "Regular Glass", size: 250, icon: "🥤" },
  { name: "Large Glass", size: 350, icon: "🥤" },
  { name: "Water Bottle", size: 500, icon: "💧" },
  { name: "Large Bottle", size: 750, icon: "💧" },
  { name: "Sports Bottle", size: 1000, icon: "🏃" },
];

function App() {
  const [todayData, setTodayData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [removeAmount, setRemoveAmount] = useState("");
  const [newGoal, setNewGoal] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);

  useEffect(() => {
    fetchTodayData();
    fetchHistory();
  }, []);

  const fetchTodayData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/today`);
      setTodayData(response.data);
    } catch (error) {
      console.error("Error fetching today data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/history`);
      setHistory(response.data);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const addWater = async (amount) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/add`, { amount });
      setTodayData(response.data);
      fetchHistory();
    } catch (error) {
      console.error("Error adding water:", error);
    }
  };

  const updateGoal = async () => {
    if (!newGoal || newGoal <= 0) return;
    try {
      const response = await axios.put(`${API_BASE_URL}/goal`, {
        goal: parseInt(newGoal),
      });
      setTodayData(response.data);
      setShowGoalModal(false);
      setNewGoal("");
    } catch (error) {
      console.error("Error updating goal:", error);
    }
  };

  const handleCustomAmount = () => {
    if (!customAmount || customAmount <= 0) return;
    addWater(parseInt(customAmount));
    setCustomAmount("");
  };

  const removeWater = async (entryId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/remove/${entryId}`);
      setTodayData(response.data);
      fetchHistory();
    } catch (error) {
      console.error("Error removing water:", error);
    }
  };

  const removeWaterAmount = async (amount) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/remove-amount`, {
        data: { amount: parseInt(amount) },
      });
      setTodayData(response.data);
      fetchHistory();
    } catch (error) {
      console.error("Error removing amount:", error);
    }
  };

  const handleRemoveAmount = () => {
    if (!removeAmount || removeAmount <= 0) return;
    removeWaterAmount(parseInt(removeAmount));
    setRemoveAmount("");
  };

  const getProgressPercentage = () => {
    if (!todayData) return 0;
    const goalInMl = todayData.goal * 1000;
    return Math.min((todayData.amount / goalInMl) * 100, 100);
  };

  const getProgressColor = () => {
    const percentage = getProgressPercentage();
    if (percentage >= 100) return "var(--success-green)";
    if (percentage >= 75) return "var(--warning-orange)";
    return "var(--primary-blue)";
  };

  const resetDay = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/reset`);
      setTodayData(response.data.waterEntry);
      fetchHistory();
      setShowResetModal(false);
    } catch (error) {
      alert("Failed to reset water data.");
      setShowResetModal(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="loading-spinner"
        >
          <FaTint />
        </motion.div>
        <p>Loading your hydration data...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="header-content"
        >
          <div className="logo">
            <FaTint className="logo-icon" />
            <h1>Water Tracker</h1>
          </div>
          <div className="header-actions">
            <button
              className="btn btn-secondary"
              onClick={() => setShowHistoryModal(true)}
            >
              <FaHistory /> History
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setShowGoalModal(true)}
            >
              <FaCrosshairs /> Goal
            </button>
            <button
              className="btn btn-danger"
              onClick={() => setShowResetModal(true)}
            >
              <FaRedo /> Reset Day
            </button>
          </div>
        </motion.div>
      </header>

      <main className="main">
        {/* Today's Progress */}
        <motion.section
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="progress-section"
        >
          <div className="progress-card">
            <div className="progress-header">
              <h2>Today's Progress</h2>
              <span className="date">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>

            <div className="progress-circle">
              <div className="progress-ring">
                <svg width="200" height="200">
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    stroke="#e5e7eb"
                    strokeWidth="12"
                    fill="transparent"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    stroke={getProgressColor()}
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 80}`}
                    strokeDashoffset={`$${
                      2 * Math.PI * 80 * (1 - getProgressPercentage() / 100)
                    }`}
                    transform="rotate(-90 100 100)"
                    style={{ transition: "stroke-dashoffset 0.5s ease" }}
                  />
                </svg>
                <div className="progress-content">
                  <div className="progress-amount">
                    <span className="current">
                      {(todayData?.amount || 0) / 1000}
                    </span>
                    <span className="unit">L</span>
                  </div>
                  <div className="progress-goal">
                    of {todayData?.goal || 3} L
                  </div>
                  <div className="progress-percentage">
                    {Math.round(getProgressPercentage())}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Goal Progress Info */}
        {todayData && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="goal-info-section"
          >
            <div className="goal-info-card">
              <div className="goal-info-item">
                <span className="goal-info-label">Current:</span>
                <span className="goal-info-value">
                  {(todayData.amount / 1000).toFixed(1)}L
                </span>
              </div>
              <div className="goal-info-item">
                <span className="goal-info-label">Goal:</span>
                <span className="goal-info-value">{todayData.goal}L</span>
              </div>
              <div className="goal-info-item">
                <span className="goal-info-label">Remaining:</span>
                <span className="goal-info-value remaining">
                  {Math.max(0, todayData.goal * 1000 - todayData.amount)}ml
                </span>
              </div>
            </div>
          </motion.section>
        )}

        {/* Quick Add Water */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="quick-add-section"
        >
          <h3>Quick Add Water</h3>
          <div className="bottle-grid">
            {BOTTLE_SIZES.map((bottle) => (
              <motion.button
                key={bottle.size}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bottle-btn"
                onClick={() => addWater(bottle.size)}
              >
                <span className="bottle-icon">{bottle.icon}</span>
                <span className="bottle-size">{bottle.size}ml</span>
                <span className="bottle-name">{bottle.name}</span>
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* Custom Amount */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="custom-amount-section"
        >
          <h3>Custom Amount</h3>
          <div className="custom-input">
            <input
              type="number"
              placeholder="Enter amount in ml"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleCustomAmount()}
            />
            <button className="btn btn-primary" onClick={handleCustomAmount}>
              <FaPlus /> Add
            </button>
          </div>
        </motion.section>

        {/* Remove Amount */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="remove-amount-section"
        >
          <h3>Remove Water</h3>
          <div className="custom-input">
            <input
              type="number"
              placeholder="Enter amount to remove in ml"
              value={removeAmount}
              onChange={(e) => setRemoveAmount(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleRemoveAmount()}
            />
            <button
              className="btn btn-danger"
              onClick={handleRemoveAmount}
              disabled={!removeAmount || removeAmount <= 0}
            >
              Remove
            </button>
          </div>
        </motion.section>

        {/* Today's Entries */}
        {todayData?.entries && todayData.entries.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="entries-section"
          >
            <h3>Today's Entries</h3>
            <div className="entries-list">
              {todayData.entries
                .slice()
                .reverse()
                .map((entry, index) => (
                  <motion.div
                    key={entry._id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="entry-item"
                  >
                    <FaTint
                      className={`entry-icon ${
                        entry.amount < 0 ? "removed" : ""
                      }`}
                    />
                    <div className="entry-details">
                      <span
                        className={`entry-amount ${
                          entry.amount < 0 ? "removed" : ""
                        }`}
                      >
                        {entry.amount > 0 ? "+" : ""}
                        {entry.amount}ml
                      </span>
                      <span className="entry-time">
                        {new Date(entry.timestamp).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {entry.note && (
                        <span className="entry-note">{entry.note}</span>
                      )}
                    </div>
                    <button
                      className={`remove-btn ${
                        entry.amount < 0 ? "restore-btn" : ""
                      }`}
                      onClick={() => removeWater(entry._id)}
                      title={
                        entry.amount < 0
                          ? "Restore this removed water"
                          : "Remove this entry"
                      }
                    >
                      {entry.amount < 0 ? "↺" : "×"}
                    </button>
                  </motion.div>
                ))}
            </div>
          </motion.section>
        )}
      </main>

      {/* Goal Modal */}
      {showGoalModal && (
        <div className="modal-overlay" onClick={() => setShowGoalModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Set Daily Goal</h3>
            <p>How much water do you want to drink today?</p>
            <input
              type="number"
              placeholder="Enter goal in liters (e.g., 3)"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
            />
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowGoalModal(false)}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={updateGoal}>
                Update Goal
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowHistoryModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="modal history-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Water History</h3>
            <div className="history-list">
              {history.map((entry) => (
                <div key={entry._id} className="history-item">
                  <div className="history-date">
                    {new Date(entry.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <div className="history-progress">
                    <div className="history-bar">
                      <div
                        className="history-fill"
                        style={{
                          width: `${Math.min(
                            (entry.amount / (entry.goal * 1000)) * 100,
                            100
                          )}%`,
                          backgroundColor:
                            entry.amount >= entry.goal * 1000
                              ? "var(--success-green)"
                              : "var(--primary-blue)",
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="history-amount">
                    {entry.amount}ml / {entry.goal}L
                  </div>
                </div>
              ))}
            </div>
            <button
              className="btn btn-primary"
              onClick={() => setShowHistoryModal(false)}
            >
              Close
            </button>
          </motion.div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="modal-overlay" onClick={() => setShowResetModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Reset All Water Data?</h3>
            <p>
              This will delete all added and removed water for today and reset
              your progress to zero. Are you sure?
            </p>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowResetModal(false)}
              >
                Cancel
              </button>
              <button className="btn btn-danger" onClick={resetDay}>
                Yes, Reset Day
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default App;
