const ALLOWED_CHANNELS = [
  "freeCodeCamp.org",
  "Apna College",
  "CodeWithHarry",
  "take U forward",
  "Abdul Bari",
  "Gate Smashers",
  "Jenny's Lectures CS IT",
  "Neso Academy",
  "NPTEL",
  "Traversy Media",
  "Fireship",
  "Programming with Mosh",
  "Krish Naik",
  "CampusX",
  "Kunal Kushwaha",
];

const ALLOWED_SITES = [
  "geeksforgeeks.org",
  "developer.mozilla.org",
  "w3schools.com",
  "freecodecamp.org",
  "tutorialspoint.com",
  "javatpoint.com",
  "nptel.ac.in",
  "roadmap.sh",
  "leetcode.com",
  "kaggle.com",
  "react.dev",
  "nodejs.org",
  "docs.python.org",
  "learn.microsoft.com",
  "aws.amazon.com",
  "owasp.org",
  "scikit-learn.org",
];

const HOURS_OPTIONS = [5, 10, 15, 20];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];

const channelMap = new Map(
  ALLOWED_CHANNELS.map((channel) => [channel.toLowerCase(), channel]),
);

const siteSet = new Set(ALLOWED_SITES);

const clampText = (value, max = 160) =>
  String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);

const asArray = (value) => (Array.isArray(value) ? value : []);

const httpError = (message, statusCode = 502) =>
  Object.assign(new Error(message), { statusCode });

const sanitizeRole = (value) =>
  String(value ?? "")
    .replace(/[^\w\s+#.&/()-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);

// --------------------------------------------------
// Build a concise prompt for faster AI generation
// --------------------------------------------------

function buildPrompt({ role, semester, hoursPerWeek }) {
  return `
Create a practical career roadmap for a college student in India.

Target role: ${role}
Starting semester: ${semester}
Final semester: 8
Study time: ${hoursPerWeek} hours per week.

Return ONLY a valid JSON object. No markdown or explanations.

Create one entry for every semester from ${semester} through 8.

Every semester must contain:
- semester: number
- focus: short string
- topics: exactly 3 topic objects
- projects: array with 1 project string
- milestones: array with 1 milestone string

Every topic must contain:
- name: string
- why: short string
- level: Beginner, Intermediate, or Advanced
- estimatedHours: number from 1 to 60
- searchQuery: short search phrase
- channels: array containing only approved channel names
- sites: array containing only approved website domains

Approved channels:
${ALLOWED_CHANNELS.join(", ")}

Approved websites:
${ALLOWED_SITES.join(", ")}

Roadmap requirements:
- Start with fundamentals.
- Progress to practical skills and projects.
- Include DSA, internships, resume building and interview preparation where relevant.
- Keep descriptions short and actionable.
- Do not invent direct video URLs.
- Use searchQuery to help users find learning resources.

Return this JSON structure:
{
  "title": "Career Roadmap",
  "summary": "Short personalised summary",
  "semesters": [
    {
      "semester": ${semester},
      "focus": "Semester focus",
      "topics": [
        {
          "name": "Topic name",
          "why": "Why this topic matters",
          "level": "Beginner",
          "estimatedHours": 8,
          "searchQuery": "Topic tutorial",
          "channels": ["freeCodeCamp.org"],
          "sites": ["geeksforgeeks.org"]
        }
      ],
      "projects": ["Project idea"],
      "milestones": ["Learning milestone"]
    }
  ]
}
`.trim();
}

// --------------------------------------------------
// Parse AI JSON safely
// --------------------------------------------------

function extractJson(content) {
  let raw = "";

  if (typeof content === "string") {
    raw = content.trim();
  } else if (Array.isArray(content)) {
    raw = content
      .map((part) => {
        if (typeof part === "string") return part;
        return part?.text || part?.content || "";
      })
      .join("\n")
      .trim();
  }

  if (!raw) {
    throw httpError(
      "AI returned an empty response. Check the model, API credits and OpenRouter response.",
    );
  }

  raw = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");

  if (start === -1 || end <= start) {
    throw httpError(
      "AI did not return a complete JSON object. Please try again.",
    );
  }

  try {
    return JSON.parse(raw.slice(start, end + 1));
  } catch (error) {
    console.error("Roadmap JSON parsing error:", error.message);

    throw httpError(
      "AI returned invalid JSON. Please retry or select another model.",
    );
  }
}

// --------------------------------------------------
// Validate and normalize the roadmap
// --------------------------------------------------

function normalizeRoadmap(raw, startingSemester) {
  const bySemester = new Map();

  asArray(raw?.semesters).forEach((item) => {
    const semester = Number(item?.semester);

    if (
      !Number.isInteger(semester) ||
      semester < startingSemester ||
      semester > 8 ||
      bySemester.has(semester)
    ) {
      return;
    }

    const topics = asArray(item.topics)
      .slice(0, 3)
      .map((topic) => {
        const name = clampText(topic?.name, 90);

        if (!name) return null;

        const hours = Number(topic?.estimatedHours);

        const channels = asArray(topic?.channels)
          .map((channel) =>
            channelMap.get(String(channel).toLowerCase().trim()),
          )
          .filter(Boolean)
          .slice(0, 2);

        const sites = asArray(topic?.sites)
          .map((site) => String(site).toLowerCase().trim())
          .filter((site) => siteSet.has(site))
          .slice(0, 2);

        return {
          name,
          why: clampText(topic?.why, 180),
          level: LEVELS.includes(topic?.level) ? topic.level : "Beginner",
          estimatedHours: Number.isFinite(hours)
            ? Math.max(1, Math.min(60, Math.round(hours)))
            : 5,
          searchQuery: clampText(topic?.searchQuery, 80) || name,
          channels,
          sites,
        };
      })
      .filter(Boolean);

    if (!topics.length) return;

    bySemester.set(semester, {
      semester,
      focus: clampText(item?.focus, 200),
      topics,
      projects: asArray(item?.projects)
        .map((project) => clampText(project, 140))
        .filter(Boolean)
        .slice(0, 1),
      milestones: asArray(item?.milestones)
        .map((milestone) => clampText(milestone, 140))
        .filter(Boolean)
        .slice(0, 1),
    });
  });

  const semesters = [...bySemester.values()].sort(
    (a, b) => a.semester - b.semester,
  );

  if (!semesters.length) {
    throw httpError("AI response did not contain usable semester data.");
  }

  return {
    title: clampText(raw?.title, 120) || "Your Career Roadmap",
    summary: clampText(raw?.summary, 400),
    semesters,
  };
}

// --------------------------------------------------
// OpenRouter request with empty-response diagnostics
// --------------------------------------------------

async function requestOpenRouter({ apiKey, model, prompt, maxTokens }) {
  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.FRONTEND_URL || "http://localhost:5173",
        "X-Title": "Interview Agent Career Roadmap",
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        max_tokens: maxTokens,
        response_format: {
          type: "json_object",
        },
        messages: [
          {
            role: "system",
            content:
              "Return only a valid JSON object. Follow the requested schema. Keep every field concise.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
      signal: AbortSignal.timeout(30000),
    },
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const providerMessage =
      data?.error?.message || response.statusText || "Unknown OpenRouter error";

    console.error("OpenRouter API error:", {
      status: response.status,
      model,
      message: providerMessage,
    });

    if (response.status === 401) {
      throw httpError(
        "OpenRouter API key is invalid. Check OPENROUTER_API_KEY.",
        502,
      );
    }

    if (response.status === 402) {
      throw httpError(
        "OpenRouter requires available credits for this request.",
        502,
      );
    }

    if (response.status === 429) {
      throw httpError(
        "OpenRouter rate limit reached. Please retry shortly.",
        429,
      );
    }

    throw httpError(
      `OpenRouter request failed (${response.status}): ${providerMessage}`,
    );
  }

  const choice = data?.choices?.[0];
  const content = choice?.message?.content;

  if (
    content == null ||
    content === "" ||
    (Array.isArray(content) && content.length === 0)
  ) {
    console.error("OpenRouter returned no content:", {
      requestedModel: model,
      returnedModel: data?.model,
      finishReason: choice?.finish_reason,
      usage: data?.usage,
      responseKeys: Object.keys(data || {}),
    });

    throw httpError(
      `Model "${model}" returned no text. Try another available model or check provider availability.`,
    );
  }

  return content;
}

// --------------------------------------------------
// Generate roadmap
// --------------------------------------------------

async function askOpenRouter(prompt) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw httpError("OPENROUTER_API_KEY is missing from backend .env.", 503);
  }

  // Always read the model from the backend environment.
  const primaryModel = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";

  const maxTokens = Math.min(
    5000,
    Math.max(1000, Number(process.env.OPENROUTER_MAX_TOKENS) || 4000),
  );

  // Try the configured model first. If it returns an empty
  // response, try the fallback once.
  const models = [
    primaryModel,
    ...(primaryModel !== "openai/gpt-4o-mini" ? ["openai/gpt-4o-mini"] : []),
  ];

  let lastError;

  for (const model of models) {
    try {
      console.log("Generating roadmap with model:", model);

      const content = await requestOpenRouter({
        apiKey,
        model,
        prompt,
        maxTokens,
      });

      return content;
    } catch (error) {
      lastError = error;

      console.error("Roadmap model attempt failed:", {
        model,
        message: error.message,
      });

      // Do not retry configuration, authentication,
      // credit, or rate-limit errors using another model.
      if (
        error.statusCode === 429 ||
        /API key is invalid|requires available credits|missing from backend/i.test(
          error.message,
        )
      ) {
        throw error;
      }
    }
  }

  throw lastError || httpError("Unable to generate a roadmap.");
}

// --------------------------------------------------
// POST /api/roadmap/generate
// --------------------------------------------------

async function generateRoadmap(req, res) {
  try {
    const role = sanitizeRole(req.body?.role);
    const semester = Number(req.body?.semester);
    const hoursPerWeek = Number(req.body?.hoursPerWeek);

    if (role.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid target role.",
      });
    }

    if (!Number.isInteger(semester) || semester < 1 || semester > 8) {
      return res.status(400).json({
        success: false,
        message: "Semester must be between 1 and 8.",
      });
    }

    if (!HOURS_OPTIONS.includes(hoursPerWeek)) {
      return res.status(400).json({
        success: false,
        message: "Study time must be 5, 10, 15, or 20 hours per week.",
      });
    }

    const prompt = buildPrompt({
      role,
      semester,
      hoursPerWeek,
    });

    const aiContent = await askOpenRouter(prompt);
    const parsedRoadmap = extractJson(aiContent);
    const roadmap = normalizeRoadmap(parsedRoadmap, semester);

    return res.status(200).json({
      success: true,
      roadmap,
    });
  } catch (error) {
    console.error("Roadmap generation failed:", error.message);

    return res.status(error.statusCode || 502).json({
      success: false,
      message: error.message || "Could not generate roadmap.",
    });
  }
}

module.exports = {
  generateRoadmap,
  buildPrompt,
  normalizeRoadmap,
};