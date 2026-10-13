const express = require("express");
const { generateRoadmap } = require("../controller/roadmapController");

const router = express.Router();

// POST /api/roadmap/generate
router.post("/generate", generateRoadmap);

module.exports = router;
