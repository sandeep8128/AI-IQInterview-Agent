const mongoose = require("mongoose");
const PreparationPlan = require("../model/preparationPlan.model");
const Interview = require("../model/interview.model");
const { askAi } = require("../services/openRouter.service");

// Generate a personalized preparation plan
const generatePreparationPlan = async (req, res) => {
  try {
    const userId = req.userId;
    const { targetRole, experience = "Fresher", durationDays = 7 } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!targetRole || !targetRole.trim()) {
      return res.status(400).json({
        success: false,
        message: "Target role is required.",
      });
    }

    const days = Number(durationDays);

    if (!Number.isInteger(days) || days < 1 || days > 90) {
      return res.status(400).json({
        success: false,
        message: "Duration must be between 1 and 90 days.",
      });
    }

    // Fetch the user's completed interviews
    const interviews = await Interview.find({
      userId,
      status: "completed",
    })
      .sort({ updatedAt: -1 })
      .limit(10)
      .select(
        "role experience mode finalScore averageConfidence averageCommunication averageCorrectness overallFeedback questions",
      )
      .lean();

    // Extract performance information
    const weakAreas = [];
    const strengths = [];

    interviews.forEach((interview) => {
      if (interview.overallFeedback?.areasToImprove) {
        const areas = interview.overallFeedback.areasToImprove;

        if (Array.isArray(areas)) {
          weakAreas.push(...areas);
        } else if (typeof areas === "string") {
          weakAreas.push(areas);
        }
      }

      if (interview.overallFeedback?.strengths) {
        const items = interview.overallFeedback.strengths;

        if (Array.isArray(items)) {
          strengths.push(...items);
        } else if (typeof items === "string") {
          strengths.push(items);
        }
      }

      (interview.questions || []).forEach((question) => {
        if (Number(question.score) <= 5) {
          weakAreas.push(
            question.question
              ? `Improve answer quality: ${question.question}`
              : "Improve interview answer quality",
          );
        }
      });
    });

    const uniqueWeakAreas = [...new Set(weakAreas)].slice(0, 10);
    const uniqueStrengths = [...new Set(strengths)].slice(0, 10);

    const interviewSummary = interviews.map((interview) => ({
      role: interview.role,
      experience: interview.experience,
      mode: interview.mode,
      finalScore: interview.finalScore,
      averageConfidence: interview.averageConfidence,
      averageCommunication: interview.averageCommunication,
      averageCorrectness: interview.averageCorrectness,
      feedback: interview.overallFeedback,
      questions: (interview.questions || []).map((question) => ({
        question: question.question,
        difficulty: question.difficulty,
        score: question.score,
        feedback: question.feedback,
      })),
    }));

    const prompt = `
You are an expert interview preparation coach.

Create a personalized interview preparation plan using the following information.

Target role: ${targetRole.trim()}
Experience level: ${experience}
Plan duration: ${days} days

Weak areas identified:
${JSON.stringify(uniqueWeakAreas)}

Strengths identified:
${JSON.stringify(uniqueStrengths)}

Previous completed interviews:
${JSON.stringify(interviewSummary)}

Create practical daily tasks for this candidate.
If no interview history is available, create a suitable beginner-friendly plan
based on the target role and experience level.

Requirements:
1. Generate 2 to 4 tasks per day.
2. Cover relevant topics such as DSA, technical concepts, HR, communication,
   resume and projects when appropriate for the target role.
3. Every task must have a clear title and actionable description.
4. Estimated time must be between 5 and 180 minutes.
5. Difficulty must be Easy, Medium or Hard.
6. Use dayNumber values from 1 to ${days}.
7. Do not claim the candidate has weaknesses unsupported by the supplied data.
8. Return valid JSON only, without Markdown or code fences.

Use exactly this JSON structure:
{
  "weakAreas": ["topic"],
  "strengths": ["strength"],
  "dailyTasks": [
    {
      "title": "Practice arrays",
      "description": "Solve array problems and review time complexity.",
      "category": "DSA",
      "topic": "Arrays",
      "difficulty": "Easy",
      "estimatedMinutes": 30,
      "dayNumber": 1
    }
  ]
}

Allowed category values:
DSA, Technical, HR, Communication, Resume, Project, General

Return a reasonable number of tasks for the full duration.
`;

    // Request the plan from the AI service
    const aiResponse = await askAi([
      {
        role: "system",
        content:
          "You generate structured interview preparation plans. Return valid JSON only.",
      },
      {
        role: "user",
        content: prompt,
      },
    ]);

    // Parse AI JSON response
    let parsedPlan;

    try {
      const cleanedResponse = aiResponse
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      parsedPlan = JSON.parse(cleanedResponse);
    } catch (error) {
      console.error("Preparation plan JSON parsing failed:", error.message);

      return res.status(502).json({
        success: false,
        message: "AI returned an invalid preparation plan. Please try again.",
      });
    }

    if (
      !parsedPlan ||
      !Array.isArray(parsedPlan.dailyTasks) ||
      parsedPlan.dailyTasks.length === 0
    ) {
      return res.status(502).json({
        success: false,
        message: "AI could not generate a valid preparation plan.",
      });
    }

    // Validate and normalize generated tasks
    const allowedCategories = [
      "DSA",
      "Technical",
      "HR",
      "Communication",
      "Resume",
      "Project",
      "General",
    ];

    const allowedDifficulties = ["Easy", "Medium", "Hard"];

    const dailyTasks = parsedPlan.dailyTasks
      .filter((task) => {
        return (
          task &&
          typeof task.title === "string" &&
          task.title.trim() &&
          Number.isInteger(Number(task.dayNumber)) &&
          Number(task.dayNumber) >= 1 &&
          Number(task.dayNumber) <= days
        );
      })
      .slice(0, Math.min(days * 4, 300))
      .map((task) => ({
        title: task.title.trim().slice(0, 200),
        description:
          typeof task.description === "string"
            ? task.description.trim().slice(0, 1000)
            : "",
        category: allowedCategories.includes(task.category)
          ? task.category
          : "General",
        topic:
          typeof task.topic === "string" ? task.topic.trim().slice(0, 150) : "",
        difficulty: allowedDifficulties.includes(task.difficulty)
          ? task.difficulty
          : "Medium",
        estimatedMinutes: Math.min(
          180,
          Math.max(5, Number(task.estimatedMinutes) || 30),
        ),
        dayNumber: Number(task.dayNumber),
        completed: false,
        completedAt: null,
      }));

    if (dailyTasks.length === 0) {
      return res.status(502).json({
        success: false,
        message: "The generated plan contains no valid tasks.",
      });
    }

    // Save the plan in MongoDB
    const preparationPlan = await PreparationPlan.create({
      userId,
      targetRole: targetRole.trim().slice(0, 150),
      experience: String(experience).trim().slice(0, 100),
      durationDays: days,
      basedOnInterviewIds: interviews.map((interview) => interview._id),
      weakAreas: Array.isArray(parsedPlan.weakAreas)
        ? parsedPlan.weakAreas
            .filter((item) => typeof item === "string")
            .map((item) => item.trim())
            .filter(Boolean)
            .slice(0, 20)
        : uniqueWeakAreas,
      strengths: Array.isArray(parsedPlan.strengths)
        ? parsedPlan.strengths
            .filter((item) => typeof item === "string")
            .map((item) => item.trim())
            .filter(Boolean)
            .slice(0, 20)
        : uniqueStrengths,
      dailyTasks,
      status: "active",
    });

    return res.status(201).json({
      success: true,
      message: "Preparation plan generated successfully.",
      plan: preparationPlan,
    });
  } catch (error) {
    console.error("Generate preparation plan error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to generate preparation plan.",
    });
  }
};

// Get the current user's preparation plans
const getMyPreparationPlans = async (req, res) => {
  try {
    const userId = req.userId;

    const plans = await PreparationPlan.find({ userId })
      .sort({ updatedAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: plans.length,
      plans,
    });
  } catch (error) {
    console.error("Get preparation plans error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch preparation plans.",
    });
  }
};

// Get one preparation plan
const getPreparationPlanById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid preparation plan ID.",
      });
    }

    const plan = await PreparationPlan.findOne({
      _id: id,
      userId: req.userId,
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Preparation plan not found.",
      });
    }

    return res.status(200).json({
      success: true,
      plan,
    });
  } catch (error) {
    console.error("Get preparation plan error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch preparation plan.",
    });
  }
};

// Mark a task completed or incomplete
const updatePreparationTask = async (req, res) => {
  try {
    const { id, taskId } = req.params;
    const { completed } = req.body;

    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(taskId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid preparation plan or task ID.",
      });
    }

    if (typeof completed !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Completed must be true or false.",
      });
    }

    const plan = await PreparationPlan.findOne({
      _id: id,
      userId: req.userId,
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Preparation plan not found.",
      });
    }

    const task = plan.dailyTasks.id(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Preparation task not found.",
      });
    }

    task.completed = completed;
    task.completedAt = completed ? new Date() : null;

    const allTasksCompleted =
      plan.dailyTasks.length > 0 &&
      plan.dailyTasks.every((item) => item.completed);

    plan.status = allTasksCompleted ? "completed" : "active";
    plan.completedAt = allTasksCompleted ? new Date() : null;

    await plan.save();

    return res.status(200).json({
      success: true,
      message: completed
        ? "Task marked as completed."
        : "Task marked as incomplete.",
      plan,
    });
  } catch (error) {
    console.error("Update preparation task error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to update preparation task.",
    });
  }
};

// Delete a preparation plan
const deletePreparationPlan = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid preparation plan ID.",
      });
    }

    const deletedPlan = await PreparationPlan.findOneAndDelete({
      _id: id,
      userId: req.userId,
    });

    if (!deletedPlan) {
      return res.status(404).json({
        success: false,
        message: "Preparation plan not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Preparation plan deleted successfully.",
    });
  } catch (error) {
    console.error("Delete preparation plan error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to delete preparation plan.",
    });
  }
};

module.exports = {
  generatePreparationPlan,
  getMyPreparationPlans,
  getPreparationPlanById,
  updatePreparationTask,
  deletePreparationPlan,
};
