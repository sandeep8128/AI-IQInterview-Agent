import axios from "axios";

const openRouter = axios.create({
  baseURL: "https://openrouter.ai/api/v1",
  headers: {
    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    "Content-Type": "application/json",
  },
});

const askAi = async (messages) => {
  try {
    const response = await openRouter.post("/chat/completions", {
      model: "nvidia/nemotron-3-super-120b-a12b:free",
      messages,
      max_tokens: 1500,
      temperature: 0.7,
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error(
      "OpenRouter Error:",
      error.response?.data || error.message
    );

    throw new Error("AI Service Failed");
  }
};

const generateInterviewQuestions = async (
  role,
  experience,
  mode,
  resumeText
) => {
  const prompt = `
Generate 10 ${mode} interview questions.

Role: ${role}
Experience: ${experience}

Resume:
${resumeText || "Not Provided"}

Return ONLY valid JSON.

Format:

[
 {
   "question":"...",
   "difficulty":"Easy",
   "timeLimit":120
 }
]
`;

  const result = await askAi([
    {
      role: "user",
      content: prompt,
    },
  ]);

  return JSON.parse(result);
};

const evaluateAnswer = async (
  question,
  answer,
  role
) => {
  const prompt = `
Evaluate interview answer.

Role: ${role}

Question:
${question}

Answer:
${answer}

Return ONLY JSON.

{
  "feedback":"...",
  "score":85,
  "confidence":80,
  "communication":90,
  "correctness":85
}
`;

  const result = await askAi([
    {
      role: "user",
      content: prompt,
    },
  ]);

  return JSON.parse(result);
};

export { askAi, generateInterviewQuestions, evaluateAnswer };
export default askAi;