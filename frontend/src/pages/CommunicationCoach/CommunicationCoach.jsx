import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
  AlertCircle,
  ArrowRight,
  AudioLines,
  CheckCircle2,
  Gauge,
  Languages,
  LoaderCircle,
  MessageCircle,
  Mic,
  MicOff,
  PhoneOff,
  Send,
  Sparkles,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Config                                                              */
/* ------------------------------------------------------------------ */
const API_URL = (
  import.meta.env.VITE_SERVER_URL || "http://localhost:8000"
).replace(/\/$/, "");

const api = axios.create({
  baseURL: `${API_URL}/api/communication`,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

/* Put your video files inside  public/ava/  (see notes).
   Idle  = Ava listening / smiling / blinking (loop)
   Speaking = Ava talking to the camera (loop)                        */
const AVA_VIDEO = {
  idle: "/ava/idle.mp4",
  speaking: "/ava/speaking.mp4",
  poster: "/ava/poster.jpg",
};

const TOPICS = [
  { label: "Introduce yourself", prompt: "introducing myself professionally" },
  { label: "Describe a project", prompt: "describing a project I worked on" },
  {
    label: "Handle a conflict",
    prompt: "answering how I handle conflict at work",
  },
  {
    label: "Explain simply",
    prompt: "explaining a technical idea in simple words",
  },
  {
    label: "My strengths",
    prompt: "talking about my strengths and weaknesses",
  },
  { label: "Career goals", prompt: "sharing my career goals" },
];

const FILLER_RE =
  /\b(um+|uh+|erm?|hmm+|you know|i mean|basically|actually|literally)\b/g;

const getErrorMessage = (error) =>
  error.response?.data?.message ||
  error.message ||
  "Something went wrong. Please try again.";

const stripForSpeech = (text) =>
  String(text || "")
    .replace(/[\p{Extended_Pictographic}\uFE0F]/gu, "")
    .replace(/[*_`#]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

/* ------------------------------------------------------------------ */
/* Small UI pieces                                                     */
/* ------------------------------------------------------------------ */
function AudioBars({ active, className = "" }) {
  return (
    <span
      className={`flex h-4 items-end gap-[3px] ${className}`}
      aria-hidden="true"
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className="w-[3px] rounded-full bg-current"
          style={{
            height: active ? "100%" : "25%",
            animation: active
              ? `avaBar 0.9s ease-in-out ${i * 0.12}s infinite`
              : "none",
          }}
        />
      ))}
    </span>
  );
}

function FallbackAvatar({ speaking, listening }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_50%_40%,#3a1d10,#111114_70%)]">
      <div className="relative flex h-40 w-40 items-center justify-center sm:h-52 sm:w-52">
        {(speaking || listening) && (
          <>
            <span className="absolute inset-0 animate-ping rounded-full bg-orange-500/20" />
            <span className="absolute -inset-4 rounded-full border border-orange-400/20" />
          </>
        )}
        <div className="flex h-full w-full items-center justify-center rounded-full border border-orange-300/30 bg-gradient-to-br from-orange-300 via-orange-500 to-rose-600 shadow-[0_0_80px_rgba(249,115,22,0.3)]">
          <span className="text-6xl font-semibold text-white sm:text-7xl">
            A
          </span>
        </div>
      </div>
    </div>
  );
}

function ScoreRing({ value, size = 128 }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(10, value)) * 10;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="9"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="#f97316"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 600ms ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-semibold text-white">
          {value.toFixed(1)}
        </span>
        <span className="text-[10px] uppercase tracking-widest text-gray-500">
          out of 10
        </span>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, hint }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#121215] p-4">
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400">
          <Icon size={15} />
        </span>
        {label}
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-white">
        {value}
      </p>
      <p className="mt-1 text-[11px] text-gray-500">{hint}</p>
    </div>
  );
}

function ControlButton({
  label,
  onClick,
  active = false,
  danger = false,
  disabled = false,
  children,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      aria-pressed={active}
      className={`flex h-11 min-w-11 items-center justify-center rounded-xl border px-3 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 disabled:cursor-not-allowed disabled:opacity-40 ${
        danger
          ? "border-red-400/30 bg-red-500/10 text-red-300 hover:bg-red-500/20"
          : active
            ? "border-orange-400/40 bg-orange-500/15 text-orange-300"
            : "border-white/10 bg-white/5 text-gray-300 hover:border-white/20 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */
const CommunicationCoach = () => {
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [handsFree, setHandsFree] = useState(false);
  const [captionsOn, setCaptionsOn] = useState(true);
  const [caption, setCaption] = useState("");
  const [camOn, setCamOn] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [voiceStats, setVoiceStats] = useState({ words: 0, ms: 0 });
  const [idleFailed, setIdleFailed] = useState(false);
  const [speakFailed, setSpeakFailed] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [report, setReport] = useState(null);

  /* refs (always hold the latest values for async / speech callbacks) */
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const camVideoRef = useRef(null);
  const camStreamRef = useRef(null);
  const voicesRef = useRef([]);
  const speakTokenRef = useRef(0);
  const startedAtRef = useRef(Date.now());
  const manualStopRef = useRef(false);
  const silentRetriesRef = useRef(0);
  const startingMicRef = useRef(false);

  const sessionRef = useRef(null);
  const reportRef = useRef(null);
  const loadingRef = useRef(false);
  const finishingRef = useRef(false);
  const listeningRef = useRef(false);
  const voiceEnabledRef = useRef(true);
  const handsFreeRef = useRef(false);
  const sendRef = useRef(null);
  const startListeningRef = useRef(null);

  sessionRef.current = session;
  reportRef.current = report;
  loadingRef.current = loading;
  finishingRef.current = finishing;
  voiceEnabledRef.current = voiceEnabled;
  handsFreeRef.current = handsFree;

  /* ---------------- effects ---------------- */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, loading]);

  useEffect(() => {
    if (!session || report) return undefined;
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [session, report]);

  useEffect(() => {
    if (!("speechSynthesis" in window)) return undefined;
    const load = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  useEffect(() => {
    if (camOn && camVideoRef.current && camStreamRef.current) {
      camVideoRef.current.srcObject = camStreamRef.current;
    }
  }, [camOn]);

  useEffect(() => {
    return () => {
      manualStopRef.current = true;
      recognitionRef.current?.stop();
      camStreamRef.current?.getTracks().forEach((track) => track.stop());
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  /* ---------------- speech output ---------------- */
  const pickVoice = () => {
    const all = voicesRef.current.length
      ? voicesRef.current
      : window.speechSynthesis.getVoices();
    const english = all.filter((v) => v.lang.toLowerCase().startsWith("en"));
    const prefs = [
      /aria|jenny|ava|emma|natural/i,
      /google us english/i,
      /samantha|karen|victoria|allison|serena|moira/i,
      /zira|female|woman/i,
    ];
    for (const pref of prefs) {
      const found = english.find((v) => pref.test(v.name));
      if (found) return found;
    }
    return english.find((v) => v.lang === "en-US") || english[0] || null;
  };

  const stopSpeaking = () => {
    speakTokenRef.current += 1;
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  const afterAvaDone = () => {
    if (
      handsFreeRef.current &&
      sessionRef.current &&
      !reportRef.current &&
      !loadingRef.current &&
      !finishingRef.current
    ) {
      setTimeout(() => startListeningRef.current?.(), 450);
    }
  };

  const speak = (text) => {
    const clean = stripForSpeech(text);

    if (!voiceEnabledRef.current || !("speechSynthesis" in window) || !clean) {
      setCaption(clean);
      afterAvaDone();
      return;
    }

    const synth = window.speechSynthesis;
    synth.cancel();

    const token = ++speakTokenRef.current;
    const chunks = (clean.match(/[^.!?]+[.!?]*/g) || [clean])
      .map((s) => s.trim())
      .filter(Boolean);
    const voice = pickVoice();

    setSpeaking(true);

    chunks.forEach((chunk, index) => {
      const utterance = new SpeechSynthesisUtterance(chunk);
      utterance.lang = "en-US";
      utterance.rate = 0.95;
      utterance.pitch = 1;
      if (voice) utterance.voice = voice;

      utterance.onstart = () => {
        if (token === speakTokenRef.current) setCaption(chunk);
      };

      utterance.onend = () => {
        if (token !== speakTokenRef.current) return;
        if (index === chunks.length - 1) {
          setSpeaking(false);
          afterAvaDone();
        }
      };

      utterance.onerror = (event) => {
        if (token !== speakTokenRef.current) return;
        if (event.error === "interrupted" || event.error === "canceled") return;
        speakTokenRef.current += 1;
        synth.cancel();
        setSpeaking(false);
        afterAvaDone();
      };

      synth.speak(utterance);
    });
  };

  /* ---------------- speech input ---------------- */
  const stopListening = () => {
    manualStopRef.current = true;
    recognitionRef.current?.stop();
  };

  const MIC_BLOCKED_HELP =
    "Microphone is blocked for this site. Click the icon left of the address bar → Site settings → Microphone → Allow, then reload the page. On Mac also check System Settings → Privacy & Security → Microphone → turn on your browser.";

  const ensureMicPermission = async () => {
    if (!navigator.mediaDevices?.getUserMedia) return { ok: true };

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      return { ok: true };
    } catch (err) {
      if (err.name === "NotFoundError") {
        return {
          ok: false,
          message:
            "No microphone was found. Connect a microphone and try again.",
        };
      }
      if (err.name === "NotReadableError") {
        return {
          ok: false,
          message:
            "Your microphone is being used by another app. Close it and try again.",
        };
      }
      return { ok: false, message: MIC_BLOCKED_HELP };
    }
  };

  const startListening = async () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        "Speech recognition is not supported in this browser. Please use Chrome or Edge, or type your message.",
      );
      setHandsFree(false);
      handsFreeRef.current = false;
      return;
    }

    if (listeningRef.current || startingMicRef.current) return;

    startingMicRef.current = true;
    const permission = await ensureMicPermission();
    startingMicRef.current = false;

    if (!permission.ok) {
      setHandsFree(false);
      handsFreeRef.current = false;
      setError(permission.message);
      return;
    }

    stopSpeaking();
    manualStopRef.current = false;
    setError("");

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;

    let latest = "";
    let errorType = "";
    const startedAt = Date.now();

    recognition.onstart = () => {
      listeningRef.current = true;
      setListening(true);
    };

    recognition.onresult = (event) => {
      latest = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(" ")
        .trim();
      setInput(latest);
    };

    recognition.onerror = (event) => {
      errorType = event.error;
    };

    recognition.onend = () => {
      listeningRef.current = false;
      setListening(false);

      const text = latest.trim();

      if (
        errorType === "not-allowed" ||
        errorType === "service-not-allowed" ||
        errorType === "network" ||
        errorType === "audio-capture"
      ) {
        setHandsFree(false);
        handsFreeRef.current = false;

        if (errorType === "not-allowed") {
          setError(MIC_BLOCKED_HELP);
        } else if (errorType === "service-not-allowed") {
          setError(
            "Your browser's speech recognition service is not available. Use the latest Chrome or Edge, turn off any VPN or ad blocker for this site, and check your internet connection.",
          );
        } else if (errorType === "network") {
          setError(
            "Speech recognition needs an internet connection. Please check your network and try again.",
          );
        } else {
          setError(
            "No working microphone was detected. Check your input device in system settings.",
          );
        }
        return;
      }

      if (manualStopRef.current) return;

      if (text) {
        silentRetriesRef.current = 0;
        if (handsFreeRef.current) {
          sendRef.current?.(text, { voice: true, ms: Date.now() - startedAt });
        }
        return;
      }

      if (handsFreeRef.current) {
        silentRetriesRef.current += 1;
        if (silentRetriesRef.current < 3) {
          setTimeout(() => startListeningRef.current?.(), 400);
        } else {
          setHandsFree(false);
          handsFreeRef.current = false;
          setNotice(
            "Voice mode paused because I couldn't hear you. Tap “Start talking” when you're ready.",
          );
        }
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      listeningRef.current = false;
      setListening(false);
      setError("Could not start the microphone. Please try again.");
    }
  };

  startListeningRef.current = startListening;

  const toggleHandsFree = () => {
    setNotice("");
    if (handsFreeRef.current) {
      setHandsFree(false);
      handsFreeRef.current = false;
      stopListening();
      return;
    }
    setHandsFree(true);
    handsFreeRef.current = true;
    silentRetriesRef.current = 0;
    if (!speaking) startListening();
  };

  const toggleDictation = () => {
    if (listening) {
      stopListening();
      return;
    }
    startListening();
  };

  /* ---------------- camera preview ---------------- */
  const toggleCamera = async () => {
    if (camOn) {
      camStreamRef.current?.getTracks().forEach((track) => track.stop());
      camStreamRef.current = null;
      setCamOn(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      camStreamRef.current = stream;
      setCamOn(true);
    } catch {
      setError(
        "Could not access the camera. Check your browser's camera permission.",
      );
    }
  };

  /* ---------------- session flow ---------------- */
  const startSession = async () => {
    try {
      setStarting(true);
      setError("");
      setNotice("");
      setReport(null);

      const response = await api.post("/sessions", {
        title: "Ava English Communication Practice",
      });

      const newSession = response.data.session;
      sessionRef.current = newSession;
      startedAtRef.current = Date.now();

      setElapsed(0);
      setVoiceStats({ words: 0, ms: 0 });
      setSession(newSession);

      const welcomeMessage = {
        role: "assistant",
        content:
          "Hey! I'm Ava, your English communication coach. 😊 Let's have a natural conversation. Don't worry about making mistakes — I'll help you improve along the way. First, tell me a little about yourself. What do you do, and what would you like to improve in your English?",
      };

      setMessages([welcomeMessage]);
      speak(welcomeMessage.content);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setStarting(false);
    }
  };

  const sendMessageText = async (raw, options = {}) => {
    const content = String(raw || "").trim();
    const current = sessionRef.current;

    if (!content || !current || loadingRef.current || finishingRef.current)
      return;

    if (content.length > 4000) {
      setError("Please keep your message under 4000 characters.");
      return;
    }

    setError("");
    setNotice("");
    setInput("");
    stopSpeaking();

    if (options.voice) {
      const wordCount = (content.match(/[A-Za-z']+/g) || []).length;
      setVoiceStats((prev) => ({
        words: prev.words + wordCount,
        ms: prev.ms + (options.ms || 0),
      }));
    }

    setMessages((previous) => [
      ...previous,
      { role: "user", content, createdAt: new Date().toISOString() },
    ]);

    loadingRef.current = true;
    setLoading(true);

    try {
      const response = await api.post(`/sessions/${current._id}/message`, {
        message: content,
      });

      const assistantMessage = {
        role: "assistant",
        content:
          response.data?.assistantMessage ||
          response.data?.messages
            ?.filter((item) => item.role === "assistant")
            .at(-1)?.content ||
          "Ava returned an empty reply. Please try again.",
        createdAt: new Date().toISOString(),
      };

      loadingRef.current = false;
      setLoading(false);
      setMessages((previous) => [...previous, assistantMessage]);
      speak(assistantMessage.content);
    } catch (err) {
      loadingRef.current = false;
      setError(getErrorMessage(err));
      // The user's message stays visible so they can try again.
      afterAvaDone();
    } finally {
      loadingRef.current = false;
      setLoading(false);
      if (!handsFreeRef.current) inputRef.current?.focus();
    }
  };

  sendRef.current = sendMessageText;

  const sendMessage = (event) => {
    event?.preventDefault();
    sendMessageText(input);
  };

  const finishSession = async () => {
    if (!session || finishing || loading) return;

    if (
      !window.confirm(
        "Finish this practice session and generate your communication report?",
      )
    ) {
      return;
    }

    try {
      setFinishing(true);
      setError("");
      setNotice("");

      setHandsFree(false);
      handsFreeRef.current = false;
      stopListening();
      stopSpeaking();

      const response = await api.patch(`/sessions/${session._id}/finish`);

      setReport(response.data.report || response.data.session?.report);
      setSession(response.data.session || session);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setFinishing(false);
    }
  };

  const startNewSession = () => {
    stopSpeaking();
    stopListening();
    setHandsFree(false);
    handsFreeRef.current = false;
    sessionRef.current = null;

    setSession(null);
    setMessages([]);
    setInput("");
    setReport(null);
    setError("");
    setNotice("");
    setCaption("");
    setElapsed(0);
    setVoiceStats({ words: 0, ms: 0 });
  };

  /* ---------------- derived data ---------------- */
  const metrics = useMemo(() => {
    const userMessages = messages.filter((m) => m.role === "user");
    const text = userMessages
      .map((m) => m.content)
      .join(" ")
      .toLowerCase();
    const words = text.match(/[a-z']+/g) || [];
    const unique = new Set(words);
    const fillers = (text.match(FILLER_RE) || []).length;

    return {
      replies: userMessages.length,
      totalWords: words.length,
      variety:
        words.length >= 20
          ? Math.round((unique.size / words.length) * 100)
          : null,
      fillers,
    };
  }, [messages]);

  const pace =
    voiceStats.ms >= 3000
      ? Math.round(voiceStats.words / (voiceStats.ms / 60000))
      : null;

  const scoreItems = report
    ? [
        ["Grammar", report.grammar],
        ["Vocabulary", report.vocabulary],
        ["Clarity", report.clarity],
        ["Relevance", report.relevance],
        ["Fluency", report.fluency],
      ]
    : [];

  const status = finishing
    ? { label: "Preparing report", dot: "bg-amber-400" }
    : loading
      ? { label: "Thinking", dot: "bg-amber-400 animate-pulse" }
      : speaking
        ? { label: "Speaking", dot: "bg-orange-400 animate-pulse" }
        : listening
          ? { label: "Listening to you", dot: "bg-emerald-400 animate-pulse" }
          : session
            ? { label: "Ready", dot: "bg-emerald-400" }
            : { label: "Online", dot: "bg-emerald-400" };

  const captionText = listening
    ? input
      ? `You: ${input}`
      : "Listening… speak in English"
    : speaking
      ? caption
      : loading
        ? "Ava is thinking…"
        : "";

  const metricCards = (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard
        icon={Languages}
        label="Words spoken"
        value={metrics.totalWords}
        hint={`${metrics.replies} ${metrics.replies === 1 ? "reply" : "replies"}`}
      />
      <StatCard
        icon={Gauge}
        label="Speaking pace"
        value={pace ? `${pace} wpm` : "—"}
        hint="Natural range ≈ 120–160"
      />
      <StatCard
        icon={Sparkles}
        label="Vocabulary variety"
        value={metrics.variety !== null ? `${metrics.variety}%` : "—"}
        hint="Higher means richer words"
      />
      <StatCard
        icon={AlertCircle}
        label="Possible fillers"
        value={metrics.fillers}
        hint="um, uh, you know… fewer is better"
      />
    </div>
  );

  /* ---------------- render ---------------- */
  return (
    <main className="min-h-screen bg-[#09090b] font-sans text-white">
      <style>{`
        @keyframes avaBar { 0%,100% { height: 25%; } 50% { height: 100%; } }
        @media (prefers-reduced-motion: reduce) { .ava-anim, .ava-anim * { animation: none !important; } }
      `}</style>

      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:py-8">
        {(error || notice) && (
          <div className="mb-5 space-y-3">
            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200"
              >
                <span className="flex-1">{error}</span>
                <button
                  type="button"
                  onClick={() => setError("")}
                  aria-label="Dismiss error"
                >
                  <X size={17} />
                </button>
              </div>
            )}
            {notice && (
              <div
                role="status"
                className="flex items-start gap-3 rounded-xl border border-orange-400/20 bg-orange-400/10 p-3 text-sm text-orange-100"
              >
                <span className="flex-1">{notice}</span>
                <button
                  type="button"
                  onClick={() => setNotice("")}
                  aria-label="Dismiss message"
                >
                  <X size={17} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ============ Report ============ */}
        {report ? (
          <div className="mx-auto max-w-4xl space-y-5">
            <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#21150f] via-[#151215] to-[#101013] p-6 sm:p-8">
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-orange-500/20 blur-3xl" />
              <div className="relative flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
                <ScoreRing value={Number(report.overallScore || 0)} />
                <div className="flex-1">
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                    <CheckCircle2 size={14} />
                    Session complete · {formatTime(elapsed)}
                  </div>
                  <h2 className="text-2xl font-semibold tracking-tight">
                    Your practice report
                  </h2>
                  <p className="mt-2 text-sm leading-7 text-gray-400">
                    {report.summary || "Keep practising regularly."}
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="mb-3 text-sm font-semibold text-gray-300">
                Session metrics
              </h3>
              {metricCards}
            </section>

            <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {scoreItems.map(([label, score]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/10 bg-[#121215] p-4"
                >
                  <p className="text-sm text-gray-400">{label}</p>
                  <p className="mt-2 text-2xl font-semibold">
                    {Number(score || 0).toFixed(1)}
                    <span className="ml-1 text-sm text-gray-600">/10</span>
                  </p>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-orange-400"
                      style={{
                        width: `${Math.max(0, Math.min(100, Number(score || 0) * 10))}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </section>

            <div className="grid gap-4 md:grid-cols-2">
              {Array.isArray(report.strengths) &&
                report.strengths.length > 0 && (
                  <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-5">
                    <h4 className="font-semibold text-emerald-300">
                      What you did well
                    </h4>
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-gray-300">
                      {report.strengths.map((item, index) => (
                        <li key={index}>✓ {item}</li>
                      ))}
                    </ul>
                  </div>
                )}

              {Array.isArray(report.improvements) &&
                report.improvements.length > 0 && (
                  <div className="rounded-2xl border border-orange-400/20 bg-orange-400/5 p-5">
                    <h4 className="font-semibold text-orange-300">
                      Areas to improve
                    </h4>
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-gray-300">
                      {report.improvements.map((item, index) => (
                        <li key={index}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>

            {Array.isArray(report.corrections) &&
              report.corrections.length > 0 && (
                <div className="rounded-2xl border border-white/10 bg-[#121215] p-5">
                  <h4 className="font-semibold">Sentence corrections</h4>
                  <div className="mt-4 space-y-4">
                    {report.corrections.map((item, index) => (
                      <div
                        key={index}
                        className="border-b border-white/10 pb-4 last:border-0 last:pb-0"
                      >
                        <p className="text-sm text-red-300">{item.original}</p>
                        <p className="mt-1 text-sm text-emerald-300">
                          {item.corrected}
                        </p>
                        {item.explanation && (
                          <p className="mt-2 text-xs leading-5 text-gray-500">
                            {item.explanation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            <button
              type="button"
              onClick={startNewSession}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3.5 font-semibold transition hover:bg-orange-400"
            >
              <Sparkles size={18} />
              Start another session
            </button>
          </div>
        ) : (
          /* ============ Live room ============ */
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(340px,1fr)]">
            {/* ---- Left: stage, controls, metrics ---- */}
            <div className="min-w-0 space-y-5">
              <div className="ava-anim relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-white/10 bg-[#0e0e11] shadow-[0_30px_80px_rgba(0,0,0,0.5)] sm:aspect-video">
                {/* Ava video layers */}
                {!idleFailed ? (
                  <>
                    <video
                      src={AVA_VIDEO.idle}
                      poster={AVA_VIDEO.poster}
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="auto"
                      onError={() => setIdleFailed(true)}
                      aria-hidden="true"
                      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                        speaking && !speakFailed ? "opacity-0" : "opacity-100"
                      }`}
                    />
                    {!speakFailed && (
                      <video
                        src={AVA_VIDEO.speaking}
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="auto"
                        onError={() => setSpeakFailed(true)}
                        aria-hidden="true"
                        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                          speaking ? "opacity-100" : "opacity-0"
                        }`}
                      />
                    )}
                  </>
                ) : (
                  <FallbackAvatar speaking={speaking} listening={listening} />
                )}

                <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/55 to-transparent" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/70 to-transparent" />

                {/* Status chip */}
                <div
                  aria-live="polite"
                  className="absolute left-4 top-4 flex items-center gap-2.5 rounded-full bg-black/50 px-3.5 py-2 text-xs font-medium backdrop-blur"
                >
                  <span className={`h-2 w-2 rounded-full ${status.dot}`} />
                  <span>
                    Ava <span className="text-gray-400">· {status.label}</span>
                  </span>
                  {(speaking || listening) && (
                    <AudioBars
                      active
                      className={
                        speaking ? "text-orange-400" : "text-emerald-400"
                      }
                    />
                  )}
                </div>

                {session && (
                  <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-black/50 px-3 py-2 text-xs font-medium tabular-nums backdrop-blur">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-60" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                    </span>
                    LIVE · {formatTime(elapsed)}
                  </div>
                )}

                {/* User camera preview */}
                {camOn && (
                  <video
                    ref={camVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute bottom-4 right-4 aspect-video w-28 -scale-x-100 rounded-xl border border-white/20 object-cover shadow-xl sm:w-44"
                  />
                )}

                {/* Captions */}
                {session && captionsOn && captionText && (
                  <div
                    className={`absolute bottom-4 left-4 rounded-2xl bg-black/60 px-4 py-3 text-center text-xs font-medium leading-relaxed backdrop-blur sm:bottom-6 sm:left-6 sm:text-sm ${
                      camOn ? "right-36 sm:right-56" : "right-4 sm:right-6"
                    }`}
                  >
                    {captionText}
                  </div>
                )}

                {/* Pre-session overlay */}
                {!session && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/55 px-6 text-center backdrop-blur-[2px]">
                    <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                      Talk to Ava, face to face
                    </h2>
                    <p className="mt-3 max-w-md text-sm leading-7 text-gray-300">
                      Have a natural English conversation, get live captions and
                      speaking metrics, and receive a detailed report when you
                      finish.
                    </p>
                    <button
                      type="button"
                      onClick={startSession}
                      disabled={starting}
                      className="group mt-7 inline-flex items-center gap-4 rounded-full bg-orange-500 py-1.5 pl-6 pr-1.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {starting ? "Starting session..." : "Start conversation"}
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/25">
                        {starting ? (
                          <LoaderCircle size={18} className="animate-spin" />
                        ) : (
                          <ArrowRight
                            size={18}
                            className="transition group-hover:translate-x-0.5"
                          />
                        )}
                      </span>
                    </button>
                  </div>
                )}
              </div>

              {/* Controls */}
              {session && (
                <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-[#121215] p-3">
                  <button
                    type="button"
                    onClick={toggleHandsFree}
                    disabled={finishing}
                    aria-pressed={handsFree}
                    className={`inline-flex min-h-11 items-center gap-3 rounded-xl px-5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 disabled:opacity-50 ${
                      handsFree
                        ? "bg-white text-black hover:bg-gray-200"
                        : "bg-orange-500 text-white shadow-lg shadow-orange-500/20 hover:bg-orange-400"
                    }`}
                  >
                    {handsFree ? (
                      <>
                        <AudioBars
                          active={listening}
                          className="text-orange-500"
                        />
                        Pause voice mode
                      </>
                    ) : (
                      <>
                        <Mic size={18} />
                        Start talking
                      </>
                    )}
                  </button>

                  <ControlButton
                    label={
                      voiceEnabled ? "Mute Ava's voice" : "Unmute Ava's voice"
                    }
                    active={voiceEnabled}
                    onClick={() => {
                      if (voiceEnabled) stopSpeaking();
                      setVoiceEnabled((value) => !value);
                    }}
                  >
                    {voiceEnabled ? (
                      <Volume2 size={19} />
                    ) : (
                      <VolumeX size={19} />
                    )}
                  </ControlButton>

                  <ControlButton
                    label={camOn ? "Turn camera off" : "Turn camera on"}
                    active={camOn}
                    onClick={toggleCamera}
                  >
                    {camOn ? <Video size={19} /> : <VideoOff size={19} />}
                  </ControlButton>

                  <ControlButton
                    label={captionsOn ? "Hide captions" : "Show captions"}
                    active={captionsOn}
                    onClick={() => setCaptionsOn((value) => !value)}
                  >
                    <span className="text-xs">CC</span>
                  </ControlButton>

                  <div className="ml-auto">
                    <button
                      type="button"
                      onClick={finishSession}
                      disabled={finishing || loading}
                      className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-red-400/30 bg-red-500/10 px-4 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
                    >
                      {finishing ? (
                        <LoaderCircle size={16} className="animate-spin" />
                      ) : (
                        <PhoneOff size={16} />
                      )}
                      {finishing ? "Generating report..." : "Finish"}
                    </button>
                  </div>
                </div>
              )}

              {session && metricCards}
            </div>

            {/* ---- Right: conversation ---- */}
            <section className="flex min-h-[560px] min-w-0 flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#111114] lg:max-h-[calc(100vh-7.5rem)] lg:min-h-[640px]">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-400/10 text-orange-300">
                    <MessageCircle size={20} />
                  </div>
                  <div>
                    <h2 className="font-semibold">Conversation</h2>
                    <p className="text-xs text-gray-500">
                      {session
                        ? `${messages.length} messages`
                        : "Ready when you are"}
                    </p>
                  </div>
                </div>
              </div>

              {!session ? (
                <div className="flex-1 space-y-6 overflow-y-auto p-5">
                  <div>
                    <h3 className="flex items-center gap-2 font-semibold">
                      <AudioLines size={18} className="text-orange-400" />
                      Your practice goals
                    </h3>
                    <div className="mt-4 space-y-3">
                      {[
                        "Speak more confidently",
                        "Improve grammar and vocabulary",
                        "Express ideas clearly",
                        "Practise everyday conversations",
                      ].map((goal) => (
                        <div
                          key={goal}
                          className="flex items-start gap-3 text-sm text-gray-400"
                        >
                          <CheckCircle2
                            size={17}
                            className="mt-0.5 shrink-0 text-orange-400"
                          />
                          {goal}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-6">
                    <h3 className="font-semibold">How it works</h3>
                    <ol className="mt-4 space-y-4 text-sm text-gray-400">
                      {[
                        "Start a conversation with Ava.",
                        "Tap “Start talking” and speak, or type your reply.",
                        "Finish to review your feedback and scores.",
                      ].map((step, index) => (
                        <li key={step} className="flex gap-3">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-400/10 text-orange-300">
                            {index + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-5">
                    {messages.map((message, index) => {
                      const isAssistant = message.role === "assistant";

                      return (
                        <div
                          key={`${message.role}-${index}`}
                          className={`flex items-start gap-3 ${isAssistant ? "" : "flex-row-reverse"}`}
                        >
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-semibold ${
                              isAssistant
                                ? "bg-gradient-to-br from-orange-400 to-rose-500"
                                : "border border-white/10 bg-white/5 text-gray-300"
                            }`}
                          >
                            {isAssistant ? "A" : "Y"}
                          </div>

                          <div
                            className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                              isAssistant
                                ? "rounded-tl-md border border-white/10 bg-[#1b1b20]"
                                : "rounded-tr-md bg-orange-500 text-white"
                            }`}
                          >
                            <p className="mb-1 text-xs font-medium opacity-60">
                              {isAssistant ? "Ava" : "You"}
                            </p>
                            <p className="whitespace-pre-wrap text-sm leading-7">
                              {message.content}
                            </p>

                            {isAssistant && voiceEnabled && (
                              <button
                                type="button"
                                onClick={() => speak(message.content)}
                                className="mt-3 flex items-center gap-1.5 text-xs text-orange-300 transition hover:text-orange-200"
                              >
                                <Volume2 size={14} />
                                Listen again
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {loading && (
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-rose-500 text-sm font-semibold">
                          A
                        </div>
                        <div className="flex items-center gap-2 rounded-2xl rounded-tl-md border border-white/10 bg-[#1b1b20] px-4 py-3 text-sm text-gray-400">
                          <LoaderCircle
                            size={16}
                            className="animate-spin text-orange-300"
                          />
                          Ava is thinking...
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Topics */}
                  <div className="border-t border-white/10 px-4 pt-3 sm:px-5">
                    <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-gray-500">
                      Practise a topic
                    </p>
                    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-3">
                      {TOPICS.map((topic) => (
                        <button
                          key={topic.label}
                          type="button"
                          disabled={loading || finishing}
                          onClick={() =>
                            sendMessageText(`Let's practise ${topic.prompt}.`)
                          }
                          className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-gray-300 transition hover:border-orange-400/40 hover:text-orange-300 disabled:opacity-40"
                        >
                          {topic.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <form
                    onSubmit={sendMessage}
                    className="border-t border-white/10 bg-[#151518] p-4"
                  >
                    <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-[#0e0e11] p-2 focus-within:border-orange-400/40">
                      <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(event) => setInput(event.target.value)}
                        onKeyDown={(event) => {
                          if (
                            event.key === "Enter" &&
                            !event.shiftKey &&
                            !event.nativeEvent.isComposing
                          ) {
                            event.preventDefault();
                            sendMessage();
                          }
                        }}
                        rows={1}
                        maxLength={4000}
                        placeholder={
                          listening
                            ? "Listening... speak in English"
                            : "Type your message in English..."
                        }
                        aria-label="Message Ava"
                        className="max-h-36 min-h-11 flex-1 resize-y bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-gray-600"
                        disabled={loading || finishing}
                      />

                      <button
                        type="button"
                        onClick={toggleDictation}
                        disabled={loading || finishing}
                        title={
                          listening ? "Stop microphone" : "Dictate your message"
                        }
                        aria-label={
                          listening ? "Stop microphone" : "Dictate your message"
                        }
                        className={`mb-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition disabled:opacity-50 ${
                          listening
                            ? "animate-pulse bg-red-500 text-white"
                            : "bg-white/5 text-gray-300 hover:bg-orange-400/10 hover:text-orange-300"
                        }`}
                      >
                        {listening ? <MicOff size={19} /> : <Mic size={19} />}
                      </button>

                      <button
                        type="submit"
                        disabled={!input.trim() || loading || finishing}
                        title="Send message"
                        aria-label="Send message"
                        className="mb-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Send size={18} />
                      </button>
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-3 px-1 text-xs text-gray-600">
                      <span>
                        {handsFree
                          ? "Voice mode is on · just speak and Ava will reply"
                          : "Enter to send · Shift + Enter for a new line"}
                      </span>
                      <span>{input.length}/4000</span>
                    </div>
                  </form>
                </>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
};

export default CommunicationCoach;
