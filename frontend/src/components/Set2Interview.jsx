import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Mic,
  MicOff,
  Send,
  Bot,
  Clock3,
  CheckCircle2,
  AlertCircle,
  Volume2,
  VolumeX,
  MessageSquareText,
  Sparkles,
  ShieldCheck,
  LoaderCircle,
  ArrowRight,
  Headphones,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import malevideo from "../assets/Videos/male-ai.mp4";
import femalevideo from "../assets/Videos/female-ai.mp4";
import axios from "axios";

function Set2Interview({ interviewData, onFinish }) {
  const { interviewId, questions = [], userName } = interviewData || {};

  const [isIntroPhase, setIsIntroPhase] = useState(true);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isAIPlaying, setIsAIPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [timeLeft, setTimeLeft] = useState(questions[0]?.timeLimit || 60);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [voiceGender, setVoiceGender] = useState("female");
  const [subtitle, setSubtitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [error, setError] = useState("");
  const [voiceSupported, setVoiceSupported] = useState(false);

  const recognitionRef = useRef(null);
  const videoRef = useRef(null);
  const timerRef = useRef(null);
  const mountedRef = useRef(true);
  const micEnabledRef = useRef(false);
  const aiPlayingRef = useRef(false);
  const recognitionRunningRef = useRef(false);
  const answerRef = useRef("");
  const questionIndexRef = useRef(0);
  const submittedRef = useRef(false);
  const speakingRef = useRef(false);
  const finishInterviewRef = useRef(null);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const API_URL = import.meta.env.VITE_SERVER_URL;
  const videoSource = voiceGender === "female" ? femalevideo : malevideo;

  const progress =
    totalQuestions > 0
      ? ((currentIndex + (feedback ? 1 : 0)) / totalQuestions) * 100
      : 0;

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      micEnabledRef.current = false;
      aiPlayingRef.current = false;

      if (timerRef.current) clearInterval(timerRef.current);

      try {
        recognitionRef.current?.abort();
      } catch {
        // Recognition may already be stopped.
      }

      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Load available system voices.
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;

      const femaleVoice = voices.find((voice) =>
        /female|samantha|zira|karen|victoria/i.test(voice.name),
      );

      const maleVoice = voices.find((voice) =>
        /david|mark|daniel|alex|male/i.test(voice.name),
      );

      const voice = femaleVoice || maleVoice || voices[0];

      setSelectedVoice(voice);
      setVoiceGender(femaleVoice || !maleVoice ? "female" : "male");
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Prepare browser speech recognition when supported.
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceSupported(false);
      return;
    }

    setVoiceSupported(true);

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      recognitionRunningRef.current = true;
    };

    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript.trim()) {
        setAnswer((previous) => {
          const updated = previous
            ? `${previous.trim()} ${finalTranscript.trim()}`
            : finalTranscript.trim();

          answerRef.current = updated;
          return updated;
        });
      }

      if (interimTranscript.trim()) {
        setSubtitle(`Recognizing: ${interimTranscript.trim()}`);
      }
    };

    recognition.onerror = (event) => {
      if (event.error !== "no-speech" && event.error !== "aborted") {
        console.warn("Speech recognition:", event.error);
      }
    };

    recognition.onend = () => {
      recognitionRunningRef.current = false;

      if (
        mountedRef.current &&
        micEnabledRef.current &&
        !aiPlayingRef.current &&
        !speakingRef.current
      ) {
        try {
          recognition.start();
        } catch {
          // Browser may still be transitioning between states.
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch {
        // Ignore already-stopped recognition.
      }

      recognitionRef.current = null;
      recognitionRunningRef.current = false;
    };
  }, []);

  const stopMic = useCallback(() => {
    micEnabledRef.current = false;

    try {
      recognitionRef.current?.stop();
    } catch {
      // Mic may already be stopped.
    }
  }, []);

  const startMic = useCallback(() => {
    if (!voiceSupported || !recognitionRef.current) {
      setError(
        "Voice recognition is unavailable in this browser. You can still type your answer.",
      );
      return;
    }

    if (aiPlayingRef.current || speakingRef.current) return;

    setError("");
    micEnabledRef.current = true;
    setIsMicOn(true);

    try {
      if (!recognitionRunningRef.current) {
        recognitionRef.current.start();
      }
    } catch (err) {
      if (err?.name !== "InvalidStateError") {
        console.warn("Could not start microphone:", err);
      }
    }
  }, [voiceSupported]);

  const toggleMic = () => {
    if (micEnabledRef.current) {
      stopMic();
      setIsMicOn(false);
    } else {
      startMic();
    }
  };

  // Speak AI prompts and feedback.
  const speakText = useCallback(
    (text) =>
      new Promise((resolve) => {
        if (!text || !("speechSynthesis" in window) || !selectedVoice) {
          resolve();
          return;
        }

        window.speechSynthesis.cancel();
        stopMic();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = selectedVoice;
        utterance.rate = 0.92;
        utterance.pitch = 1.02;
        utterance.volume = 1;

        let resolved = false;

        const finishSpeaking = () => {
          if (resolved) return;
          resolved = true;

          speakingRef.current = false;
          aiPlayingRef.current = false;

          if (!mountedRef.current) {
            resolve();
            return;
          }

          setIsAIPlaying(false);
          videoRef.current?.pause();

          if (micEnabledRef.current) {
            try {
              recognitionRef.current?.start();
            } catch {
              // Recognition may already be running.
            }
          }

          resolve();
        };

        utterance.onstart = () => {
          if (!mountedRef.current) return;

          speakingRef.current = true;
          aiPlayingRef.current = true;
          setIsAIPlaying(true);

          if (videoRef.current) {
            videoRef.current.play().catch(() => {});
          }
        };

        utterance.onend = finishSpeaking;
        utterance.onerror = finishSpeaking;

        setSubtitle(text);
        window.speechSynthesis.speak(utterance);
      }),
    [selectedVoice, stopMic],
  );

  // Announce introduction and current question.
  useEffect(() => {
    if (!selectedVoice || !totalQuestions || !currentQuestion) return;

    let cancelled = false;

    const announceQuestion = async () => {
      if (isIntroPhase) {
        await speakText(
          `Hello ${userName || "there"}. Welcome to your AI interview. Take your time and answer each question clearly.`,
        );

        if (cancelled) return;

        await speakText(
          `I will ask you ${totalQuestions} questions. Let's get started.`,
        );

        if (cancelled) return;

        setIsIntroPhase(false);
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 500));

      if (cancelled) return;

      await speakText(
        `Question ${currentIndex + 1}. ${currentQuestion.question}`,
      );

      if (cancelled) return;

      if (micEnabledRef.current) {
        try {
          recognitionRef.current?.start();
        } catch {
          // Ignore duplicate start attempts.
        }
      }
    };

    announceQuestion();

    return () => {
      cancelled = true;
    };
  }, [
    selectedVoice,
    isIntroPhase,
    currentIndex,
    totalQuestions,
    currentQuestion,
    userName,
    speakText,
  ]);

  // Timer for the current question.
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (isIntroPhase || feedback || isFinishing || !currentQuestion) {
      return undefined;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((previous) => {
        if (previous <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isIntroPhase, currentIndex, feedback, isFinishing, currentQuestion]);

  useEffect(() => {
    if (currentQuestion) {
      setTimeLeft(currentQuestion.timeLimit || 60);
    }
  }, [currentIndex, currentQuestion]);

  // Finish interview and open the report.
  const finishInterview = useCallback(async () => {
    if (isFinishing) return;

    stopMic();
    setIsMicOn(false);
    setIsFinishing(true);
    setError("");

    if (timerRef.current) clearInterval(timerRef.current);

    if (!API_URL) {
      setError("Server URL missing hai. Frontend .env check karein.");
      setIsFinishing(false);
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/api/interview/finish`,
        { interviewId },
        { withCredentials: true },
      );

      if (response.data?.success) {
        window.speechSynthesis?.cancel();
        onFinish(response.data);
      } else {
        setError(response.data?.message || "Interview finish nahi ho paya.");
        setIsFinishing(false);
      }
    } catch (err) {
      console.error("Finish interview error:", err);

      setError(
        err.response?.data?.message ||
          "Interview finish nahi ho paya. Please retry karein.",
      );

      setIsFinishing(false);
    }
  }, [isFinishing, stopMic, API_URL, interviewId, onFinish]);

  finishInterviewRef.current = finishInterview;

  // Submit answer. Empty answers are allowed and should receive 0.
  const submitAnswer = useCallback(
    async (automatic = false) => {
      if (submittedRef.current || isSubmitting || feedback || isFinishing) {
        return;
      }

      const finalAnswer = answerRef.current.trim();

      if (!API_URL) {
        setError("Server URL missing hai. Frontend .env check karein.");
        return;
      }

      submittedRef.current = true;
      stopMic();
      setIsMicOn(false);
      setIsSubmitting(true);
      setError("");

      if (timerRef.current) clearInterval(timerRef.current);

      try {
        const response = await axios.post(
          `${API_URL}/api/interview/submit-answer`,
          {
            interviewId,
            questionIndex: currentIndex,
            answer: finalAnswer,
            timeTaken: Math.max(
              0,
              (currentQuestion?.timeLimit || 60) - timeLeft,
            ),
          },
          { withCredentials: true },
        );

        const data = response.data;

        if (!data?.success) {
          submittedRef.current = false;
          setError(
            data?.message || "Answer submit nahi hua. Please retry karein.",
          );
          return;
        }

        if (automatic) {
          // When the timer ends, save the answer and automatically advance.
          if (currentIndex + 1 >= totalQuestions) {
            await finishInterviewRef.current?.();
          } else {
            setAnswer("");
            answerRef.current = "";
            setFeedback("");
            setError("");
            submittedRef.current = false;
            questionIndexRef.current = currentIndex + 1;
            setCurrentIndex((previous) => previous + 1);
          }

          return;
        }

        setFeedback(
          data.feedback ||
            (finalAnswer
              ? "Answer submitted successfully."
              : "No answer submitted. Score: 0."),
        );

        if (data.feedback) {
          await speakText(data.feedback);
        }
      } catch (err) {
        submittedRef.current = false;
        console.error("Submit answer error:", err);

        setError(
          err.response?.data?.message ||
            "Answer submit nahi ho paya. Connection check karke retry karein.",
        );
      } finally {
        if (mountedRef.current) setIsSubmitting(false);
      }
    },
    [
      isSubmitting,
      feedback,
      isFinishing,
      API_URL,
      interviewId,
      currentIndex,
      currentQuestion,
      timeLeft,
      stopMic,
      speakText,
      totalQuestions,
    ],
  );

  // Automatically submit when the timer reaches zero, even if the answer is blank.
  useEffect(() => {
    if (
      timeLeft === 0 &&
      !isIntroPhase &&
      !feedback &&
      !isSubmitting &&
      !isFinishing
    ) {
      submitAnswer(true);
    }
  }, [
    timeLeft,
    isIntroPhase,
    feedback,
    isSubmitting,
    isFinishing,
    submitAnswer,
  ]);

  const handleNext = async () => {
    if (!feedback || isFinishing) return;

    if (currentIndex + 1 >= totalQuestions) {
      await finishInterview();
      return;
    }

    stopMic();
    setIsMicOn(false);
    setAnswer("");
    answerRef.current = "";
    setFeedback("");
    setError("");
    submittedRef.current = false;

    questionIndexRef.current = currentIndex + 1;
    setCurrentIndex((previous) => previous + 1);
  };

  const handleVoiceToggle = () => {
    if (!("speechSynthesis" in window)) return;

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      speakingRef.current = false;
      aiPlayingRef.current = false;
      setIsAIPlaying(false);
      videoRef.current?.pause();
    } else if (subtitle) {
      speakText(subtitle);
    }
  };

  if (!interviewData || totalQuestions === 0) {
    return (
      <div className="flex min-h-[300px] items-center justify-center p-6">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-3 text-[#ee5a2b]" size={28} />
          <h2 className="font-bold text-neutral-900">
            Interview questions unavailable
          </h2>
          <p className="mt-2 text-sm text-neutral-500">
            Please return to setup and generate the interview questions again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 text-[#171717]">
      <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[310px_minmax(0,1fr)] xl:gap-6">
        {/* AI interviewer panel */}
        <aside className="flex min-w-0 flex-col gap-4">
          <div className="relative overflow-hidden rounded-2xl bg-[#171717] p-4 text-white sm:rounded-3xl sm:p-5">
            <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#ee5a2b]/20 blur-3xl" />

            <div className="relative mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ee5a2b]">
                  <Bot size={19} />
                </div>
                <div>
                  <p className="text-sm font-bold">AI Interviewer</p>
                  <p className="mt-0.5 text-[10px] text-white/50">
                    Your practice partner
                  </p>
                </div>
              </div>

              <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1.5 text-[10px] font-bold text-white/80">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                LIVE
              </span>
            </div>

            <div className="relative mx-auto aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 sm:max-w-lg xl:max-w-none">
              <video
                ref={videoRef}
                src={videoSource}
                key={videoSource}
                muted
                playsInline
                loop
                preload="metadata"
                className="h-full w-full object-cover"
              />

              {!isAIPlaying && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-3 pt-8">
                  <div className="flex items-center gap-2 text-xs font-medium text-white">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15">
                      <Headphones size={14} />
                    </span>
                    Ready when you are
                  </div>
                </div>
              )}

              {isAIPlaying && (
                <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full border border-white/10 bg-black/45 px-3 py-2 text-[10px] font-semibold text-white backdrop-blur-md">
                  <Volume2 size={13} className="text-[#ff8058]" />
                  AI is speaking
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">
                  Voice assistant
                </p>
                <p className="mt-1 truncate text-sm font-semibold">
                  {selectedVoice?.name || "System voice"}
                </p>
              </div>

              <button
                type="button"
                onClick={handleVoiceToggle}
                aria-label={isAIPlaying ? "Stop AI voice" : "Replay AI voice"}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.07] text-white transition hover:bg-white/[0.12]"
              >
                {isAIPlaying ? <VolumeX size={17} /> : <Volume2 size={17} />}
              </button>
            </div>
          </div>

          {/* Live captions */}
          <div className="min-w-0 rounded-2xl border border-black/[0.07] bg-white p-4 sm:p-5">
            <div className="mb-3 flex items-center gap-2">
              <MessageSquareText size={16} className="text-[#ee5a2b]" />
              <h3 className="text-xs font-bold uppercase tracking-wider">
                Live captions
              </h3>
            </div>

            <p className="break-words text-sm leading-6 text-neutral-600">
              {subtitle || "Your interviewer's speech will appear here."}
            </p>
          </div>

          {/* Session stats */}
          <div className="rounded-2xl border border-black/[0.07] bg-white p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-sm font-bold">Session progress</h3>
              <span className="text-xs font-semibold text-[#ee5a2b]">
                {Math.round(progress)}%
              </span>
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
              <motion.div
                className="h-full rounded-full bg-[#ee5a2b]"
                initial={false}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-[#f8f7f5] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                  Question
                </p>
                <p className="mt-1.5 text-2xl font-extrabold">
                  {currentIndex + 1}
                  <span className="text-sm font-medium text-neutral-400">
                    {" "}
                    / {totalQuestions}
                  </span>
                </p>
              </div>

              <div className="rounded-xl bg-[#f8f7f5] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                  Time left
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Clock3
                    size={16}
                    className={
                      timeLeft <= 10 ? "text-red-500" : "text-[#ee5a2b]"
                    }
                  />
                  <span
                    className={`text-xl font-extrabold tabular-nums ${
                      timeLeft <= 10 ? "text-red-500" : "text-neutral-900"
                    }`}
                  >
                    {Math.floor(timeLeft / 60)
                      .toString()
                      .padStart(2, "0")}
                    :{(timeLeft % 60).toString().padStart(2, "0")}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-2 border-t border-black/[0.06] pt-4">
              <ShieldCheck
                size={15}
                className="mt-0.5 shrink-0 text-[#ee5a2b]"
              />
              <p className="text-[11px] leading-5 text-neutral-500">
                Focus on your answers. You can type or use voice input.
              </p>
            </div>
          </div>
        </aside>

        {/* Main interview area */}
        <section className="flex min-w-0 flex-col rounded-2xl border border-black/[0.07] bg-white p-4 shadow-[0_10px_40px_rgba(0,0,0,0.035)] sm:rounded-3xl sm:p-6 lg:p-8">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-black/[0.06] pb-5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ee5a2b]/10 text-[#ee5a2b]">
                <Sparkles size={19} />
              </div>

              <div className="min-w-0">
                <h2 className="text-sm font-extrabold sm:text-base">
                  AI Smart Interview
                </h2>
                <p className="mt-1 text-xs text-neutral-500">
                  Question {currentIndex + 1} of {totalQuestions}
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.07] bg-[#f8f7f5] px-3 py-2 text-[10px] font-semibold text-neutral-600">
              <span className="h-1.5 w-1.5 rounded-full bg-[#ee5a2b]" />
              {isIntroPhase
                ? "Getting ready"
                : feedback
                  ? "Feedback ready"
                  : "In progress"}
            </span>
          </header>

          <div className="mt-6 rounded-2xl border border-[#ee5a2b]/15 bg-[#fffaf7] p-4 sm:p-6">
            <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#d94b22]">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#ee5a2b]/10">
                <Bot size={14} />
              </span>
              Interview question
            </div>

            <h3 className="break-words text-lg font-bold leading-relaxed tracking-tight sm:text-xl lg:text-2xl">
              {currentQuestion?.question}
            </h3>

            <p className="mt-3 text-xs leading-5 text-neutral-500">
              Take a moment to organize your thoughts, then submit your
              response.
            </p>
          </div>

          <div className="mb-3 mt-6 flex flex-wrap items-center justify-between gap-2">
            <label
              htmlFor="interview-answer"
              className="text-sm font-bold text-neutral-800"
            >
              Your answer
            </label>

            <span className="text-[10px] font-medium text-neutral-400">
              {answer.trim() ? answer.trim().split(/\s+/).length : 0} words
            </span>
          </div>

          <div className="relative min-w-0">
            <textarea
              id="interview-answer"
              value={answer}
              onChange={(event) => {
                setAnswer(event.target.value);
                answerRef.current = event.target.value;
              }}
              placeholder="Start typing your answer here, or use the microphone to speak..."
              disabled={isSubmitting || Boolean(feedback) || isFinishing}
              rows={7}
              className="min-h-[180px] w-full resize-y rounded-2xl border border-black/10 bg-white p-4 text-sm leading-7 text-neutral-800 outline-none transition placeholder:text-neutral-400 hover:border-black/20 focus:border-[#ee5a2b] focus:ring-4 focus:ring-[#ee5a2b]/10 disabled:bg-neutral-50 sm:min-h-[220px] sm:p-5"
            />

            <div className="pointer-events-none absolute bottom-3 right-3 rounded-lg bg-white/90 px-2 py-1 text-[10px] text-neutral-400">
              {answer.length} characters
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs leading-5 text-red-700"
            >
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!voiceSupported && (
            <div className="mt-3 flex items-start gap-2 text-xs leading-5 text-neutral-500">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <span>
                Speech recognition is not supported in this browser. You can
                still type your answers.
              </span>
            </div>
          )}

          {/* Feedback */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 sm:p-5"
              >
                <div className="mb-3 flex items-center gap-2">
                  <CheckCircle2 size={19} className="text-emerald-700" />
                  <h3 className="text-sm font-extrabold text-emerald-900">
                    Feedback on your answer
                  </h3>
                </div>

                <p className="whitespace-pre-wrap break-words text-sm leading-7 text-emerald-950/80">
                  {feedback}
                </p>

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={isFinishing}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#ee5a2b] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#d94b22] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isFinishing ? (
                    <>
                      <LoaderCircle size={17} className="animate-spin" />
                      Finishing interview...
                    </>
                  ) : (
                    <>
                      {currentIndex < totalQuestions - 1
                        ? "Next question"
                        : "Finish interview"}
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          {!feedback && (
            <div className="mt-5 flex flex-col gap-3 border-t border-black/[0.06] pt-5 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={toggleMic}
                disabled={
                  isSubmitting || isFinishing || isAIPlaying || !voiceSupported
                }
                aria-label={
                  isMicOn ? "Turn microphone off" : "Turn microphone on"
                }
                className={`flex min-h-12 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto ${
                  isMicOn
                    ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                    : "border-black/10 bg-white text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                {isMicOn ? <MicOff size={17} /> : <Mic size={17} />}
                {isMicOn ? "Turn mic off" : "Use microphone"}
              </button>

              <button
                type="button"
                onClick={() => submitAnswer(false)}
                disabled={isSubmitting || isFinishing || Boolean(feedback)}
                className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#ee5a2b] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-900/10 transition hover:-translate-y-0.5 hover:bg-[#d94b22] disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-neutral-200 disabled:text-neutral-400 disabled:shadow-none"
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle size={18} className="animate-spin" />
                    Submitting answer...
                  </>
                ) : (
                  <>
                    Submit answer
                    <Send size={16} />
                  </>
                )}
              </button>
            </div>
          )}

          <div className="mt-5 flex items-start gap-2 text-[10px] leading-5 text-neutral-400">
            <ShieldCheck size={14} className="mt-0.5 shrink-0" />
            <p>
              Your answers are submitted to the interview service for
              evaluation. Avoid including sensitive personal information.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Set2Interview;
