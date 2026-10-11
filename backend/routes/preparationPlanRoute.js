const express = require("express");
const router = express.Router();

const isAuth = require("../middlewares/isAuth");

const {
  generatePreparationPlan,
  getMyPreparationPlans,
  getPreparationPlanById,
  updatePreparationTask,
  deletePreparationPlan,
} = require("../controller/PreparationPlanController");

// Generate a new AI preparation plan
router.post("/generate", isAuth, generatePreparationPlan);

// Get all preparation plans of the logged-in user
router.get("/my-plans", isAuth, getMyPreparationPlans);

// Get a single preparation plan by ID
router.get("/:id", isAuth, getPreparationPlanById);

// Mark a task completed or incomplete
router.patch("/:id/tasks/:taskId", isAuth, updatePreparationTask);

// Delete a preparation plan
router.delete("/:id", isAuth, deletePreparationPlan);

module.exports = router;
