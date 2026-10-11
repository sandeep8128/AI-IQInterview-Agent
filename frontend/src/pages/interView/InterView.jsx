import React, { useState } from "react";

import { useNavigate } from "react-router-dom";

import { motion, AnimatePresence } from "framer-motion";

import {
  FaBrain,
  FaCheckCircle,
  FaClipboardCheck,
  FaMicrophone,
  FaShieldAlt,
  FaStar,
} from "react-icons/fa";

import Set1Setup from "../../components/Set1Steup";

import Set2Interview from "../../components/Set2Interview";

import Set3Report from "../../components/Set3Report";

const steps = [
  {
    id: 1,

    title: "Setup",

    subtitle: "Personalize your interview",

    icon: FaClipboardCheck,
  },

  {
    id: 2,

    title: "Interview",

    subtitle: "Show what you know",

    icon: FaMicrophone,
  },

  {
    id: 3,

    title: "Your Report",

    subtitle: "Review your performance",

    icon: FaBrain,
  },
];

function InterView() {
  const [step, setStep] = useState(1);

  const [interviewData, setInterviewData] = useState(null);

  const navigate = useNavigate();

  const goBack = () => {
    if (step === 1) {
      navigate("/");

      return;
    }

    if (step === 2) {
      setStep(1);

      return;
    }

    navigate("/history");
  };

  const currentStep = steps.find((item) => item.id === step);

  const CurrentIcon = currentStep.icon;

  return (
    <div
      className="min-h-screen overflow-x-clip bg-[#f6f5f3] text-[#171717]"
      style={{
        fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
      }}
    >
      <style>{`

        @import url('https\://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght\@400;500;600;700;800&display=swap');

        .interview-workspace,

        .interview-workspace * {

          min-width: 0;

        }

        .interview-workspace img,

        .interview-workspace video,

        .interview-workspace canvas {

          max-width: 100%;

        }

        @media (prefers-reduced-motion: reduce) {

          *,

          *::before,

          *::after {

            animation-duration: 0.01ms !important;

            animation-iteration-count: 1 !important;

            scroll-behavior: auto !important;

            transition-duration: 0.01ms !important;

          }

        }

      `}</style>

      <main className="mx-auto w-full max-w-[1440px] px-3 py-6 sm:px-6 sm:py-10 lg:px-12">
        {/* Hero heading */}

        <section className="mx-auto mb-8 w-full max-w-3xl text-center sm:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="mb-4 inline-flex max-w-full items-center justify-center gap-2 rounded-full border border-[#ee5a2b]/15 bg-[#ee5a2b]/[0.07] px-3 py-2 text-[9px] font-bold tracking-[0.08em] text-[#d94b22] sm:px-3.5 sm:text-xs">
              <FaStar className="shrink-0" />

              <span>YOUR NEXT INTERVIEW STARTS HERE</span>
            </div>

            <h1 className="text-2xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              Practice with <span className="text-[#ee5a2b]">confidence.</span>
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-neutral-500 sm:mt-4 sm:text-base sm:leading-7">
              Prepare for real-world interviews, test your skills, and get
              actionable insights to improve your performance.
            </p>
          </motion.div>
        </section>

        {/* Responsive progress tracker */}

        <section
          className="mx-auto mb-7 w-full max-w-3xl sm:mb-10"
          aria-label={`Interview progress: step ${step} of 3`}
        >
          <div className="relative">
            {/* Track */}

            <div className="absolute left-[16.66%] right-[16.66%] top-5 h-[2px] bg-black/[0.08] sm:top-[22px]" />

            {/* Progress line */}

            <motion.div
              className="absolute left-[16.66%] top-5 h-[2px] bg-[#ee5a2b] sm:top-[22px]"
              initial={false}
              animate={{
                width: step === 1 ? "0%" : step === 2 ? "33.34%" : "66.68%",
              }}
              transition={{ duration: 0.35 }}
            />

            <div className="relative grid grid-cols-3 gap-1 sm:gap-4">
              {steps.map((item) => {
                const Icon = item.icon;

                const active = step === item.id;

                const completed = step > item.id;

                return (
                  <div
                    key={item.id}
                    className="flex min-w-0 flex-col items-center text-center"
                  >
                    <motion.div
                      initial={false}
                      animate={{ scale: active ? 1.06 : 1 }}
                      className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors duration-300 sm:h-11 sm:w-11 ${
                        active
                          ? "border-[#ee5a2b] bg-[#ee5a2b] text-white shadow-lg shadow-orange-900/15"
                          : completed
                            ? "border-[#ee5a2b] bg-[#ee5a2b] text-white"
                            : "border-black/10 bg-[#f6f5f3] text-neutral-400"
                      }`}
                    >
                      {completed ? (
                        <FaCheckCircle size={15} />
                      ) : (
                        <Icon size={14} />
                      )}
                    </motion.div>

                    <p
                      className={`mt-2 text-[11px] font-bold sm:mt-3 sm:text-sm ${
                        active || completed
                          ? "text-[#171717]"
                          : "text-neutral-400"
                      }`}
                    >
                      {item.title}
                    </p>

                    <p className="mt-1 hidden text-[11px] text-neutral-400 sm:block">
                      {item.subtitle}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Main workspace */}

        <motion.section
          layout
          className="interview-workspace mx-auto w-full max-w-5xl overflow-hidden rounded-2xl border border-black/[0.07] bg-white shadow-[0_16px_60px_rgba(0,0,0,0.045)] sm:rounded-3xl"
        >
          {/* Workspace heading */}

          <div className="flex flex-col gap-3 border-b border-black/[0.06] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-7 sm:py-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ee5a2b]/10 text-[#ee5a2b] sm:h-11 sm:w-11">
                <CurrentIcon size={17} />
              </div>

              <div className="min-w-0">
                <h2 className="break-words text-sm font-extrabold sm:text-lg">
                  {step === 1
                    ? "Configure your interview"
                    : step === 2
                      ? "Your interview session"
                      : "Interview performance report"}
                </h2>

                <p className="mt-1 text-xs leading-5 text-neutral-500 sm:text-sm">
                  {step === 1
                    ? "Choose the details to personalize your session."
                    : step === 2
                      ? "Focus on your answers and do your best."
                      : "Review your results and identify opportunities to improve."}
                </p>
              </div>
            </div>

            <div className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border border-black/[0.07] bg-[#f8f7f5] px-3 py-2 text-[10px] font-semibold text-neutral-600 sm:text-[11px]">
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${
                  step === 2 ? "animate-pulse bg-red-500" : "bg-[#ee5a2b]"
                }`}
              />

              {step === 1
                ? "STEP 01 OF 03"
                : step === 2
                  ? "SESSION IN PROGRESS"
                  : "STEP 03 OF 03"}
            </div>
          </div>

          {/* Interview steps */}

          <div className="min-w-0 p-3 sm:p-6 lg:p-9">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22 }}
                className="min-w-0"
              >
                {step === 1 && (
                  <Set1Setup
                    onStart={(data) => {
                      setInterviewData(data);

                      setStep(2);
                    }}
                  />
                )}

                {step === 2 && (
                  <Set2Interview
                    interviewData={interviewData}
                    onFinish={(report) => {
                      setInterviewData(report);

                      setStep(3);
                    }}
                  />
                )}

                {step === 3 && <Set3Report report={interviewData} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.section>

        {/* Trust indicators */}

        <section className="mx-auto mt-7 flex w-full max-w-3xl flex-wrap items-center justify-center gap-x-5 gap-y-3 text-[11px] text-neutral-500 sm:mt-9 sm:gap-x-6 sm:text-xs">
          <span className="inline-flex items-center gap-2">
            <FaShieldAlt className="shrink-0 text-[#ee5a2b]" />
            Private practice workspace
          </span>

          <span className="hidden h-1 w-1 rounded-full bg-neutral-300 sm:block" />

          <span className="inline-flex items-center gap-2">
            <FaBrain className="shrink-0 text-[#ee5a2b]" />
            AI-powered preparation
          </span>

          <span className="hidden h-1 w-1 rounded-full bg-neutral-300 sm:block" />

          <span className="inline-flex items-center gap-2">
            <FaCheckCircle className="shrink-0 text-[#ee5a2b]" />
            Review your performance
          </span>
        </section>

        <footer className="mt-8 border-t border-black/[0.06] pt-5 text-center text-xs text-neutral-400 sm:mt-10">
          AI Interview Agent · Make every interview count.
        </footer>
      </main>
    </div>
  );
}

export default InterView;
