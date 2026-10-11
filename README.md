# 🤖 InterviewIQ.AI — AI-Powered Interview Platform

An AI-powered interview preparation platform built with the MERN stack. Practice HR and technical interviews, generate AI-powered questions, receive performance feedback, review interview reports, and manage interview credits.

**Live Demo:** https://ai-iq-interview-agent.vercel.app/

## ✨ Features

### 🔐 Authentication & User Management
- User signup and login
- JWT-based authentication
- Google OAuth integration
- Password reset functionality
- User profile management

### 🎯 AI Interview Practice
- AI-generated interview questions
- HR and technical interview modes
- Custom interview setup with role and difficulty selection
- Resume-based interview preparation
- Interactive interview experience

### 📊 Reports & Performance
- AI-powered answer evaluation
- Performance analytics
- Confidence, communication, and correctness scores
- Strengths and weaknesses analysis
- Downloadable PDF interview reports
- Interview history

### 📚 Interview Preparation Plan
- Preparation plan dashboard
- Backend API and database model for preparation plans

### 💳 Payments & Credits
- Credit-based interview system
- Razorpay payment integration
- Pricing page

## 🛠️ Tech Stack

### Frontend
- React.js
- Vite
- Tailwind CSS
- Redux Toolkit
- Axios
- Recharts
- Framer Motion
- jsPDF
- html2canvas

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- Passport.js
- Google OAuth
- Multer
- Razorpay
- OpenRouter AI
- Nodemailer

## 📂 Project Structure

```text
InterviewAgent/
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
│   │   ├── components/
│   │   └── pages/
│   ├── public/
│   └── package.json
├── backend/
│   ├── config/
│   ├── controller/
│   ├── middlewares/
│   ├── model/
│   ├── routes/
│   ├── services/
│   └── server.js
└── README.md
```

## ⚙️ Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/sandeep8128/AI-IQInterview-Agent.git
cd AI-IQInterview-Agent
```

### 2. Configure the backend

```bash
cd backend
npm install
```

Create a `backend/.env` file using the environment variables required by your backend configuration.

Example:

```env
PORT=8000
MONGODB_URL=YOUR_MONGODB_CONNECTION_STRING
JWT_SECRET_KEY=YOUR_SECRET
OPENROUTER_API_KEY=YOUR_OPENROUTER_KEY
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET
RAZORPAY_KEY_ID=YOUR_RAZORPAY_KEY
RAZORPAY_KEY_SECRET=YOUR_RAZORPAY_SECRET
CLIENT_URL=http://localhost:5173
```

Start the backend using the script configured in `backend/package.json`. For example:

```bash
npm run dev
```

### 3. Configure the frontend

Open a second terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_SERVER_URL=http://localhost:8000
VITE_RAZORPAY_KEY_ID=YOUR_RAZORPAY_KEY
```

Start the frontend:

```bash
npm run dev
```

Open the local URL printed by Vite in your terminal.

**Important:** Environment variable names and required values must match the application's current configuration. Never commit real API keys, passwords, database credentials, or `.env` files.

## 🔄 How It Works

1. Register or sign in.
2. Configure an interview using the available options.
3. Answer AI-generated interview questions.
4. Receive feedback and performance scores.
5. Review interview history and reports.
6. Use preparation features to support further practice.

## 🚀 Future Improvements

- Voice-based interviews
- Webcam-based interview practice
- Advanced speech analysis
- Coding interview support
- Admin dashboard
- Enhanced analytics

## 👨‍💻 Author

**Sandeep Prajapati**

GitHub: https://github.com/sandeep8128

## 🤝 Contributing

Contributions are welcome. Fork the repository, create a branch, make your changes, and submit a pull request.

## 📜 License

Refer to the repository's license file for licensing terms.

## ⭐ Support

If you find this project useful, consider giving the repository a star.