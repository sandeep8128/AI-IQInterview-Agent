# 🤖 AI Interview Agent — InterviewIQ.AI

**Prepare smarter. Interview better.**

AI Interview Agent is an AI-powered interview preparation platform designed to help students, freshers, and job seekers prepare for interviews, practice technical and HR questions, improve English communication, and track their interview preparation journey.

🔗 **Live Demo:** https://ai-iq-interview-agent.vercel.app/

---

## 📸 Screenshots

## 📸 Project Screenshots

### 🏠 Home Page
![AI Interview Agent Home Page](![Uploading image.png…]()
)

### 🎯 Interview Setup
![Interview Configuration](PASTE_INTERVIEW_SCREENSHOT_DIRECT_URL_HERE)

### 📚 Preparation Dashboard
![Preparation Dashboard](PASTE_PREPARATION_SCREENSHOT_DIRECT_URL_HERE)

### 🗣️ Ava AI Coach
![Ava AI Coach](PASTE_AVA_SCREENSHOT_DIRECT_URL_HERE)





## 📸 Project Overview

AI Interview Agent provides an interactive platform for interview preparation with AI-powered tools, personalized practice, learning roadmaps, and performance insights.

The platform combines interview simulation, career preparation, resume analysis, and communication practice in one place.

## ✨ Features

### 🏠 1. Home

- Clean and modern landing page.
- Start a Mock Interview call to action.
- Role-based interview preparation options.
- Quick access to the platform's main features.
- Account registration and sign-in options.

### 🎯 2. Interview

Configure an interview session according to your goals.

- Select your target job role.
- Enter your experience level.
- Choose an interview type, such as Technical or HR.
- Upload your resume for resume-based interview preparation, where supported.
- Generate personalized interview questions.
- Practice answering interview questions.

### 📜 3. Interview History

- Access previous interview sessions.
- Review saved interview details and reports, where available.
- Track your interview preparation over time.

### 📚 4. Preparation Dashboard

Prepare for your target role with structured learning tools.

- **AI Study Plan:** Generate a personalized interview preparation plan.
- **Career Roadmap:** Create a learning roadmap based on your target role and selected semester.
- **Progress Tracking:** Organize learning activities and monitor preparation progress.
- **Learning Resources:** Access relevant learning topics and resources.

The roadmap generator is designed to focus on the semester selected by the user instead of generating unnecessary semesters.

### 🗣️ 5. Ava AI Coach

An AI-powered English communication practice interface.

- Interactive conversation with the AI coach.
- Practice speaking and written communication.
- Topic suggestions for guided practice.
- Voice and audio controls, where supported.
- Speaking statistics such as words spoken, speaking pace, vocabulary variety, and possible filler words, where available.

### 💳 6. Pricing

- Dedicated pricing page.
- Credit balance display for signed-in users.
- Access to available plans and supported payment workflows.

### 👤 7. Account & Authentication

- User registration and sign-in.
- Authentication-protected features.
- Personalized preparation experience.
- User profile and credit information, where configured.

### 📄 8. Resume Analysis

- Upload a resume for supported analysis workflows.
- Extract resume text from supported document formats.
- Use resume information to assist interview preparation, where implemented.

### 📊 9. AI Feedback & Reports

- Review interview performance where reports are generated.
- Identify strengths and improvement areas.
- Use feedback to guide future preparation.

*Feature availability may depend on the current application configuration and enabled modules.*

---

## 🖥️ Application Pages

| Page | Purpose |
|---|---|
| Home | Landing page and entry point |
| Interview | Configure and practice interviews |
| History | Review previous interview sessions |
| Preparation | AI study plans and career roadmaps |
| Ava AI Coach | English communication practice |
| Pricing | View available plans and pricing |
| Sign in | Access the user account |

---

## 🛠️ Technology Stack

The application uses a modern web development stack. The exact dependencies and integrations may vary by module.

### Frontend
- React.js
- JavaScript
- HTML5
- CSS3
- Axios

### Backend
- Node.js
- Express.js
- REST APIs

### Database
- MongoDB
- Mongoose

### AI & Integrations
- OpenRouter API for AI-powered generation
- Firebase authentication integration, where configured
- Razorpay for supported payment workflows
- PDF parsing for resume processing

---

## 🏗️ Project Architecture

The application follows a frontend-backend architecture.

```text
AI-Interview-Agent/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── assets/
│   │   └── ...
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── server.js
│   ├── package.json
│   └── ...
│
├── .gitignore
└── README.md
```

*This is an illustrative structure; use the actual folder names from your repository if they differ.*

---

## 🚀 Live Demo

Try the application here:

### 👉 [AI Interview Agent — Live Application](https://ai-iq-interview-agent.vercel.app/)

Open the live website to explore the available pages and features.

---

## ⚙️ Run Locally

### Prerequisites

Install the following before starting:

- Node.js and npm
- MongoDB or a MongoDB Atlas connection
- An OpenRouter API key if using AI-powered features
- Any additional credentials required by enabled integrations

### Step 1: Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd AI-Interview-Agent
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with your actual GitHub repository URL.

### Step 2: Install Frontend Dependencies

```bash
cd frontend
npm install
npm run dev
```

Use the local URL displayed by your frontend development server.

### Step 3: Install Backend Dependencies

Open another terminal at the project root:

```bash
cd backend
npm install
```

### Step 4: Configure Environment Variables

Create a `.env` file inside the backend directory.

Example configuration:

```env
PORT=8000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret

OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=openai/gpt-4o-mini
OPENROUTER_MAX_TOKENS=2500

FRONTEND_URL=http://localhost:5173
```

Add any other environment variables required by your existing authentication, payment, email, or AI modules.

**Never upload real API keys, database passwords, JWT secrets, or payment credentials to GitHub.**

### Step 5: Start the Backend

```bash
npm run dev
```

Run this command from the backend directory if it is defined in `backend/package.json`. Otherwise, use the start command configured in your project.

### Step 6: Connect Frontend and Backend

Ensure the frontend API base URL points to the correct backend address. For local development, this is commonly `http://localhost:8000`, depending on your configuration.

---

## 🧠 AI Career Roadmap API

The roadmap module generates a focused learning plan for the selected role and semester.

**Endpoint:** `POST /api/roadmap/generate`

Example request:

```json
{
  "role": "Full Stack Developer",
  "semester": 5,
  "hoursPerWeek": 10
}
```

The request includes:

- `role`: Target career role.
- `semester`: Selected semester from 1 to 8.
- `hoursPerWeek`: Available study time; supported values are 5, 10, 15, or 20.

The expected successful response contains the generated roadmap under `roadmap`, including the selected semester, topics, project ideas, and milestones.

---

## 🔐 Security

- Keep secrets in environment variables.
- Do not commit `.env` files.
- Validate incoming API requests on the backend.
- Protect private routes with appropriate authentication middleware.
- Restrict CORS to trusted origins.
- Keep private API keys on the server rather than exposing them in frontend code.

---

## 🎯 Project Objectives

- Help students and freshers prepare for job interviews.
- Provide role-based interview practice.
- Make interview preparation more structured and accessible.
- Encourage consistent communication practice.
- Help users identify learning gaps and improve over time.

---

## 🔮 Future Improvements

Potential future enhancements include:

- More realistic AI voice interviews.
- Advanced communication and pronunciation feedback.
- More detailed interview analytics.
- Additional role-specific interview question sets.
- Enhanced progress visualizations.
- More personalized preparation recommendations.

---

## 👨‍💻 Author

**Sandeep Prajapati**

B.Tech — Computer Science Engineering

---

## 📄 License

No open-source license is specified yet. Add a `LICENSE` file if you decide to distribute this project under a particular license.

---

⭐ **If you find this project useful, consider starring the repository on GitHub.**
