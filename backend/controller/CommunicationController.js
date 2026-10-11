import CommunicationSession from "../model/CommunicationSession.js";
import askAi from "../services/openRouter.service.js";

const MAX_MESSAGE_LENGTH = 5000;
const MAX_STORED_MESSAGES = 200;
const MAX_CONTEXT_MESSAGES = 24;

const COACH_SYSTEM_PROMPT = `
You are a realistic, friendly AI girl named Ava, acting as an English
communication coach inside InterviewIQ.AI.

PERSONALITY:
- Be warm, natural, friendly, supportive, and conversational.
- Talk like a real conversation partner, not a robotic interviewer.
- Never claim to be a real human. You are an AI companion.
- Do not call the user "bro" in every message.

CONVERSATION:
- Understand the user's message and respond to what they actually said.
- Continue the conversation naturally with relevant follow-up questions.
- Do not turn every message into an interview question.
- Adapt to the user's English level and gradually help them improve.
- If the user makes grammar or vocabulary mistakes, gently explain them.
- Show a more natural English sentence when it would help.
- Do not interrupt the conversation with excessive corrections.
- If the user writes in Hindi or Hinglish, encourage them to express
  the same idea in English, while explaining things simply when needed.
- Keep most responses concise and easy to speak aloud.

COACHING:
- Help with fluency, grammar, vocabulary, clarity, and confidence.
- Never shame the user for mistakes.
- Do not invent errors that the user did not make.
- Distinguish between a genuine error and an acceptable alternative.
- End with a relevant conversational prompt when appropriate.

Return a normal conversational response. Do not return JSON unless
the user explicitly asks for JSON.
`;

const isValidObjectId = (id) =>
  typeof id === "string" && /^[a-f\d]{24}$/i.test(id);

const getAuthenticatedUserId = (req) =>
  req.userId || req.user?._id || req.user?.id;

/**
 * Create a new communication practice session.
 * POST /api/communication/sessions
 */
export const createCommunicationSession = async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please log in to start a communication session.",
      });
    }

    const title =
      typeof req.body?.title === "string" && req.body.title.trim()
        ? req.body.title.trim().slice(0, 100)
        : "English Communication Practice";

    const session = await CommunicationSession.create({
      userId,
      title,
      messages: [
        {
          role: "assistant",
          content:
            "Hey! I'm Ava, your English communication coach. 😊 Let's have a natural conversation in English. How has your day been so far?",
          createdAt: new Date(),
        },
      ],
      status: "active",
    });

    return res.status(201).json({
      success: true,
      message: "Communication session created successfully.",
      session,
    });
  } catch (error) {
    console.error("Create communication session error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create communication session.",
    });
  }
};

/**
 * Send a message and receive an AI coach response.
 * POST /api/communication/sessions/:id/message
 * Body: { "message": "I am learning English." }
 */
export const sendCommunicationMessage = async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const { id } = req.params;
    const message =
      typeof req.body?.message === "string" ? req.body.message.trim() : "";

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please log in to continue.",
      });
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid communication session ID.",
      });
    }

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Please enter a message.",
      });
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters.`,
      });
    }

    const session = await CommunicationSession.findOne({
      _id: id,
      userId,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Communication session not found.",
      });
    }

    if (session.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "This session is completed. Start a new session to continue.",
      });
    }

    if (session.messages.length >= MAX_STORED_MESSAGES) {
      return res.status(400).json({
        success: false,
        message:
          "This session has reached its message limit. Please start a new session.",
      });
    }

    const conversationHistory = session.messages
      .slice(-MAX_CONTEXT_MESSAGES)
      .map((item) => ({
        role: item.role,
        content: item.content,
      }));

    const aiMessages = [
      {
        role: "system",
        content: COACH_SYSTEM_PROMPT,
      },
      ...conversationHistory,
      {
        role: "user",
        content: message,
      },
    ];

    const aiResponse = await askAi(aiMessages);

    if (typeof aiResponse !== "string" || !aiResponse.trim()) {
      throw new Error("The AI service returned an empty response.");
    }

    const assistantMessage = aiResponse.trim();

    session.messages.push({
      role: "user",
      content: message,
      createdAt: new Date(),
    });

    session.messages.push({
      role: "assistant",
      content: assistantMessage,
      createdAt: new Date(),
    });

    await session.save();

    return res.status(200).json({
      success: true,
      message: "Message sent successfully.",
      sessionId: session._id,
      userMessage: message,
      assistantMessage,
      messages: session.messages,
    });
  } catch (error) {
    console.error("Send communication message error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get an AI response. Please try again.",
    });
  }
};

/**
 * Get the logged-in user's communication session history.
 * GET /api/communication/sessions
 */
export const getCommunicationSessions = async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please log in to view your session history.",
      });
    }

    const sessions = await CommunicationSession.find({ userId })
      .select("-messages")
      .sort({ updatedAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: sessions.length,
      sessions,
    });
  } catch (error) {
    console.error("Get communication sessions error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch communication session history.",
    });
  }
};

/**
 * Get one session, including its messages.
 * GET /api/communication/sessions/:id
 */
export const getCommunicationSession = async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please log in to view this session.",
      });
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid communication session ID.",
      });
    }

    const session = await CommunicationSession.findOne({
      _id: id,
      userId,
    }).lean();

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Communication session not found.",
      });
    }

    return res.status(200).json({
      success: true,
      session,
    });
  } catch (error) {
    console.error("Get communication session error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch communication session.",
    });
  }
};

/**
 * Finish a communication practice session.
 * PATCH /api/communication/sessions/:id/finish
 * Body: { "durationSeconds": 180 }
 */
export const finishCommunicationSession = async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please log in to finish this session.",
      });
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid communication session ID.",
      });
    }

    const session = await CommunicationSession.findOne({
      _id: id,
      userId,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Communication session not found.",
      });
    }

    if (session.status === "completed") {
      return res.status(200).json({
        success: true,
        message: "This session is already completed.",
        session,
      });
    }

    const requestedDuration = Number(req.body?.durationSeconds);

    if (
      req.body?.durationSeconds !== undefined &&
      (!Number.isFinite(requestedDuration) || requestedDuration < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "durationSeconds must be a non-negative number.",
      });
    }

    session.status = "completed";

    if (Number.isFinite(requestedDuration)) {
      session.durationSeconds = Math.floor(
        Math.min(requestedDuration, 24 * 60 * 60),
      );
    }

    await session.save();

    return res.status(200).json({
      success: true,
      message: "Communication session completed successfully.",
      session,
    });
  } catch (error) {
    console.error("Finish communication session error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to finish communication session.",
    });
  }
};
