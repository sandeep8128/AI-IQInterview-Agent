import React from "react";

import {
  ArrowRight,
  Bot,
  BarChart3,
  Briefcase,
  CheckCircle2,
  Code2,
  Database,
  FileText,
  History,
  Layers3,
  Mic,
  Server,
  Users,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";

import { motion, useReducedMotion } from "framer-motion";

import { useSelector } from "react-redux";

import robotImage from "../../assets/ai-robot.png";

import answerImage from "../../assets/ai-ans.png";

import resumeImage from "../../assets/resume.png";

import pdfImage from "../../assets/pdf.png";

import historyImage from "../../assets/history.png";

const features = [
  {
    image: answerImage,

    icon: BarChart3,

    title: "AI Answer Evaluation",

    description:
      "Get useful feedback on your communication, technical accuracy and answer quality.",

    number: "01",
  },

  {
    image: resumeImage,

    icon: FileText,

    title: "Resume-Based Interviews",

    description:
      "Practise questions tailored to your resume, skills and target job role.",

    number: "02",
  },

  {
    image: pdfImage,

    icon: CheckCircle2,

    title: "Detailed Interview Reports",

    description:
      "Understand your strengths, identify weak areas and improve after every attempt.",

    number: "03",
  },

  {
    image: historyImage,

    icon: History,

    title: "Track Your Progress",

    description:
      "Review previous interviews and see where your preparation is improving.",

    number: "04",
  },
];

const roles = [
  { icon: Code2, title: "Frontend Developer" },

  { icon: Server, title: "Backend Developer" },

  { icon: Database, title: "Data Analyst" },

  { icon: Layers3, title: "Full Stack Developer" },

  { icon: Briefcase, title: "Product Manager" },

  { icon: Users, title: "HR Interview" },
];

const steps = [
  {
    icon: Briefcase,

    title: "Choose your interview",

    description:
      "Select your target role and prepare for a relevant interview session.",
  },

  {
    icon: Mic,

    title: "Answer the questions",

    description:
      "Practise explaining your ideas and responding to interview questions.",
  },

  {
    icon: BarChart3,

    title: "Review your feedback",

    description:
      "Use your report to understand where to improve before the real interview.",
  },
];

/* -------------------------------------------------------

   Responsive Navbar

\------------------------------------------------------- */

function PromptCard() {
  const list = roles.slice(1).map((role) => `${role.title} interview`);

  return (
    <div className="w-full max-w-[300px]">
      <div className="rounded-xl bg-white p-3 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#111111] text-white">
            <Bot size={15} />
          </span>

          <div className="min-w-0">
            <p className="text-[10px] text-neutral-400">I want to practise</p>

            <p className="truncate text-xs font-semibold text-[#111111]">
              {roles[0].title} interview
            </p>
          </div>
        </div>
      </div>

      <ul className="mt-3 space-y-2 pl-3 text-xs font-medium text-[#111111]">
        {list.map((item, index) => (
          <li
            key={item}
            style={{ opacity: Math.max(0.15, 0.75 - index * 0.16) }}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ScoreCard() {
  return (
    <div className="w-full max-w-[230px] rounded-xl bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-neutral-500">Answer score</p>

        <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[9px] font-medium text-neutral-500">
          Sample
        </span>
      </div>

      <p className="mt-3 text-right text-2xl font-semibold leading-none text-[#111111]">
        86/100
      </p>

      <p className="mt-2 text-right text-[11px] font-medium text-[#ee5a2b]">
        ▲ +12% vs last attempt
      </p>
    </div>
  );
}

/* -------------------------------------------------------

   Feature Card

\------------------------------------------------------- */

function FeatureCard({ image, icon: Icon, title, description, number }) {
  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group h-full rounded-2xl bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.05)] sm:p-6"
    >
      <div className="mb-6 flex items-center justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#111111] text-white transition group-hover:bg-[#ee5a2b]">
          <Icon size={19} />
        </span>

        <span className="text-sm font-semibold text-[#ee5a2b]">{number}</span>
      </div>

      <div className="mb-5 flex h-36 items-center justify-center overflow-hidden rounded-xl bg-[#f6f5f3] p-4 sm:h-40">
        <img
          src={image}
          alt={title}
          loading="lazy"
          className="h-full w-full object-contain transition duration-500 group-hover:scale-105"
        />
      </div>

      <h3 className="text-lg font-semibold tracking-tight text-[#111111]">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-neutral-500">{description}</p>
    </motion.article>
  );
}

/* -------------------------------------------------------

   Home Page

\------------------------------------------------------- */

function Home() {
  const navigate = useNavigate();

  const userData = useSelector((state) => state.user?.userData);

  const reduceMotion = useReducedMotion();

  const fadeUp = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 18 },

    visible: {
      opacity: 1,

      y: 0,

      transition: {
        duration: reduceMotion ? 0 : 0.6,

        ease: "easeOut",
      },
    },
  };

  const stagger = {
    hidden: {},

    visible: {
      transition: {
        staggerChildren: reduceMotion ? 0 : 0.12,
      },
    },
  };

  const handleCreateAccount = () => {
    navigate("/auth");
  };

  const handleStartInterview = () => {
    if (!userData) {
      navigate("/auth");

      return;
    }

    navigate("/interview");
  };

  return (
    <div className="min-h-screen overflow-x-clip bg-[#f6f5f3] font-sans text-[#111111]">
      <main>
        {/* HERO */}

        <motion.section
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="mx-auto max-w-7xl px-4 pb-6 pt-6 sm:px-6 md:pt-10 lg:px-8"
        >
          <div className="grid items-center gap-10 lg:min-h-[600px] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,0.95fr)]">
            <div className="relative z-10 flex flex-col justify-between gap-10 text-center lg:h-[560px] lg:text-left">
              <div className="lg:pt-6">
                <motion.div
                  variants={fadeUp}
                  className="mx-auto mb-5 flex w-fit items-center gap-2 rounded-full bg-white px-2 py-1 shadow-sm lg:mx-0"
                >
                  <span className="rounded-full bg-[#ee5a2b] px-2 py-0.5 text-[10px] font-bold text-white">
                    NEW
                  </span>

                  <span className="pr-1 text-[10px] font-medium uppercase tracking-wider text-neutral-500">
                    Your personal AI interview coach
                  </span>
                </motion.div>

                <motion.h1
                  variants={fadeUp}
                  className="text-4xl font-semibold leading-[1.02] tracking-tight sm:text-5xl xl:text-[58px]"
                >
                  Prepare smarter.
                  <br />
                  Interview better.
                </motion.h1>

                <motion.p
                  variants={fadeUp}
                  className="mx-auto mt-5 max-w-[360px] text-sm leading-relaxed text-neutral-600 lg:mx-0"
                >
                  Practise realistic interviews with AI, get instant feedback
                  and build the confidence to land your next opportunity.
                </motion.p>

                <motion.div
                  variants={fadeUp}
                  className="mt-7 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start"
                >
                  <button
                    type="button"
                    onClick={handleStartInterview}
                    className="group inline-flex items-center gap-4 rounded-full bg-[#111111] py-1.5 pl-6 pr-1.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(0,0,0,0.18)] transition hover:opacity-90"
                  >
                    Start a Mock Interview
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ee5a2b] transition group-hover:translate-x-0.5">
                      <ArrowRight size={16} />
                    </span>
                  </button>

                  {userData ? (
                    <Link
                      to="/history"
                      className="text-sm font-semibold text-neutral-700 underline-offset-4 transition hover:text-black hover:underline"
                    >
                      View my history
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={handleCreateAccount}
                      className="text-sm font-semibold text-neutral-700 underline-offset-4 transition hover:text-black hover:underline"
                    >
                      Create free account
                    </button>
                  )}
                </motion.div>
              </div>

              <motion.div
                variants={fadeUp}
                className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-neutral-600 lg:justify-start"
              >
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-[#ee5a2b]" />
                  Role-based practice
                </span>

                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-[#ee5a2b]" />
                  Instant feedback
                </span>

                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-[#ee5a2b]" />
                  Resume-based questions
                </span>
              </motion.div>
            </div>

            {/* Center: Robot */}

            <motion.div
              variants={fadeUp}
              className="relative mx-auto h-[380px] w-full max-w-[440px] sm:h-[480px] lg:h-[580px]"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 h-[70%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white blur-[70px]"
              />

              <img
                src={robotImage}
                alt="AI interviewer"
                fetchPriority="high"
                className="relative h-full w-full object-contain mix-blend-multiply"
                style={{
                  WebkitMaskImage:
                    "linear-gradient(to bottom, black 72%, transparent 100%)",

                  maskImage:
                    "linear-gradient(to bottom, black 72%, transparent 100%)",
                }}
              />
            </motion.div>

            {/* Right */}

            <div className="flex flex-col items-center gap-8 lg:h-[560px] lg:items-end lg:justify-between">
              <motion.div
                variants={fadeUp}
                className="flex w-full justify-center lg:justify-end"
              >
                <PromptCard />
              </motion.div>

              <motion.div
                variants={fadeUp}
                className="flex w-full justify-center lg:justify-end"
              >
                <ScoreCard />
              </motion.div>

              <motion.h2
                variants={fadeUp}
                className="text-center text-3xl font-semibold leading-[1.05] tracking-tight lg:text-right lg:text-[38px]"
              >
                Your AI Interviewer
                <br />
                Never Sleeps.
              </motion.h2>
            </div>
          </div>
        </motion.section>

        {/* ROLES */}

        <section
          id="roles"
          className="scroll-mt-24 px-4 pb-20 pt-8 text-center sm:px-6 lg:px-8"
        >
          <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-400">
            Prepare for the role you want
          </p>

          <div className="mx-auto grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-2xl bg-neutral-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.05)] sm:grid-cols-3 lg:grid-cols-6">
            {roles.map(({ icon: Icon, title }) => (
              <button
                key={title}
                type="button"
                onClick={handleStartInterview}
                className="flex items-center justify-center gap-2 bg-white px-3 py-4 text-xs font-semibold transition hover:bg-[#fff4ef]"
              >
                <Icon size={14} className="shrink-0 text-[#ee5a2b]" />

                {title}
              </button>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}

        <section
          id="how"
          className="scroll-mt-24 px-4 pb-20 sm:px-6 sm:pb-24 lg:px-8"
        >
          <div className="mx-auto max-w-7xl">
            <h2 className="mx-auto mb-12 max-w-2xl text-center text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
              Three steps. More confidence.
            </h2>

            <div className="grid gap-5 md:grid-cols-3">
              {steps.map(({ icon: Icon, title, description }, index) => (
                <motion.article
                  key={title}
                  whileHover={{ y: -4 }}
                  className="rounded-2xl bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.05)] sm:p-8"
                >
                  <div className="mb-8 flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#111111] text-white">
                      <Icon size={20} />
                    </span>

                    <span className="text-sm font-semibold text-[#ee5a2b]">
                      0{index + 1}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold sm:text-xl">{title}</h3>

                  <p className="mt-2 text-sm leading-7 text-neutral-500">
                    {description}
                  </p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}

        <section
          id="features"
          className="scroll-mt-24 px-4 pb-20 sm:px-6 sm:pb-24 lg:px-8"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
                One platform. Better preparation.
              </h2>

              <p className="max-w-sm text-sm leading-7 text-neutral-500">
                Practise, review and improve with tools designed to support your
                interview journey.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:gap-6">
              {features.map((feature) => (
                <FeatureCard key={feature.number} {...feature} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}

        <section className="px-4 pb-16 sm:px-6 sm:pb-24 lg:px-8">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-[#111111] px-5 py-14 text-center sm:px-10 sm:py-20">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 left-1/2 h-56 w-[28rem] -translate-x-1/2 rounded-full bg-[#ee5a2b] opacity-40 blur-[90px]"
            />

            <div className="relative mx-auto max-w-3xl">
              <h2 className="text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
                Your next interview deserves your best preparation.
              </h2>

              <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-neutral-300 sm:text-base">
                Practise your answers, learn from feedback and walk into your
                interview with confidence.
              </p>

              <button
                type="button"
                onClick={handleStartInterview}
                className="mt-8 inline-flex items-center gap-4 rounded-full bg-white py-1.5 pl-6 pr-1.5 text-sm font-semibold text-[#111111] transition hover:opacity-90"
              >
                Start Practising
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ee5a2b] text-white">
                  <ArrowRight size={16} />
                </span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}

      <footer className="border-t border-black/5 px-4 py-7 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
          <Link
            to="/"
            className="text-sm font-semibold uppercase tracking-wide text-[#111111]"
          >
            AI Interview Agent
          </Link>

          <p className="text-xs text-neutral-500">
            © {new Date().getFullYear()} AI Interview Agent. Keep learning. Keep
            improving.
          </p>

          <Link
            to="/pricing"
            className="text-xs font-semibold text-neutral-600 transition hover:text-black"
          >
            Explore Pricing
          </Link>
        </div>
      </footer>
    </div>
  );
}

export default Home;
