import React, { useRef, useState } from "react";

import { motion, AnimatePresence } from "framer-motion";

import {
  UserRound,
  Mic,
  ChartNoAxesColumnIncreasing,
  BriefcaseBusiness,
  FileUp,
  ChevronDown,
  CheckCircle2,
  GraduationCap,
  LoaderCircle,
  Sparkles,
  X,
  FileText,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Brain,
  WandSparkles,
} from "lucide-react";

import axios from "axios";

import { useDispatch, useSelector } from "react-redux";

import { setUser } from "../redux/userSlice";

const features = [
  {
    icon: UserRound,

    title: "Personalized questions",

    description: "Based on your role and experience",
  },

  {
    icon: Mic,

    title: "Interactive interview",

    description: "Practice with your AI interviewer",
  },

  {
    icon: ChartNoAxesColumnIncreasing,

    title: "Performance insights",

    description: "Discover your strengths and gaps",
  },
];

function Set1Setup({ onStart }) {
  const { userData } = useSelector((state) => state.user);

  const dispatch = useDispatch();

  const fileInputRef = useRef(null);

  const [role, setRole] = useState("");

  const [experience, setExperience] = useState("");

  const [mode, setMode] = useState("technical");

  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(false);

  const [project, setProject] = useState([]);

  const [skills, setSkills] = useState([]);

  const [resumeText, setResumeText] = useState("");

  const [analyzing, setAnalyzing] = useState(false);

  const [analysisDone, setAnalysisDone] = useState(false);

  const [error, setError] = useState("");

  const [analysisError, setAnalysisError] = useState("");

  const API_URL = import.meta.env.VITE_SERVER_URL;

  const isButtonDisabled =
    !role.trim() || !experience.trim() || !mode || loading;

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    setError("");

    setAnalysisError("");

    if (!selectedFile) return;

    const allowedTypes = [
      "application/pdf",

      "application/msword",

      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const extensionIsValid = /\.(pdf|doc|docx)$/i.test(selectedFile.name);

    if (!extensionIsValid) {
      setError("Please upload a PDF, DOC, or DOCX resume.");

      event.target.value = "";

      return;
    }

    if (
      selectedFile.type &&
      !allowedTypes.includes(selectedFile.type) &&
      !extensionIsValid
    ) {
      setError("Unsupported file format.");

      event.target.value = "";

      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("Resume file must be smaller than 10 MB.");

      event.target.value = "";

      return;
    }

    setFile(selectedFile);

    setAnalysisDone(false);

    setProject([]);

    setSkills([]);

    setResumeText("");
  };

  const handleRemoveFile = () => {
    setFile(null);

    setAnalysisDone(false);

    setAnalysisError("");

    setProject([]);

    setSkills([]);

    setResumeText("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAnalyzeResume = async () => {
    if (!file || analyzing) return;

    if (!API_URL) {
      setAnalysisError("Server URL missing hai. Frontend .env check karein.");

      return;
    }

    setAnalyzing(true);

    setAnalysisError("");

    setError("");

    const formData = new FormData();

    formData.append("resume", file);

    try {
      const response = await axios.post(
        `${API_URL}/api/interview/resume`,

        formData,

        {
          withCredentials: true,
        },
      );

      const data = response.data;

      if (data.role) setRole(data.role);

      if (data.experience) setExperience(data.experience);

      if (Array.isArray(data.projects)) setProject(data.projects);

      if (Array.isArray(data.skills)) setSkills(data.skills);

      if (data.resumeText) setResumeText(data.resumeText);

      setAnalysisDone(true);
    } catch (err) {
      console.error("Resume analysis error:", err);

      setAnalysisError(
        err.response?.data?.message ||
          "Resume analyze nahi ho paya. Please dobara try karein.",
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const handleStart = async () => {
    if (isButtonDisabled) return;

    if (!API_URL) {
      setError("Server URL missing hai. Frontend .env check karein.");

      return;
    }

    setLoading(true);

    setError("");

    try {
      const result = await axios.post(
        `${API_URL}/api/interview/generate-questions`,

        {
          role: role.trim(),

          experience: experience.trim(),

          mode,

          project,

          skills,

          resumeText,
        },

        { withCredentials: true },
      );

      if (!result.data) {
        throw new Error("Server se interview data nahi mila.");
      }

      if (userData && result.data.creditsLeft !== undefined) {
        dispatch(
          setUser({
            ...userData,

            credits: result.data.creditsLeft,
          }),
        );
      }

      onStart(result.data);
    } catch (err) {
      console.error("Generate interview error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Interview start nahi ho paya. Please dobara try karein.",
      );
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 12 },

    visible: {
      opacity: 1,

      y: 0,

      transition: { duration: 0.4, staggerChildren: 0.07 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },

    visible: { opacity: 1, y: 0 },
  };

  const inputClass =
    "w-full min-w-0 rounded-xl border border-black/10 bg-white py-3.5 pl-11 pr-4 text-sm text-[#171717] outline-none transition placeholder:text-neutral-400 hover:border-black/20 focus:border-[#ee5a2b] focus:ring-4 focus:ring-[#ee5a2b]/10 disabled:opacity-60";

  const labelClass = "mb-2 block text-sm font-semibold text-[#262626]";

  return (
    <div className="min-h-[calc(100vh-120px)] w-full min-w-0">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto w-full min-w-0"
      >
        <div className="grid min-w-0 grid-cols-1 gap-5 sm:gap-7 xl:grid-cols-[minmax(300px,0.78fr)_minmax(0,1.22fr)] xl:gap-10">
          {/* LEFT: Intro panel */}

          <motion.aside
            variants={itemVariants}
            className="relative min-w-0 overflow-hidden rounded-2xl bg-[#171717] p-5 text-white sm:rounded-3xl sm:p-7 lg:p-8 xl:sticky xl:top-6 xl:self-start"
          >
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#ee5a2b]/20 blur-[70px]" />

            <div className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-orange-400/10 blur-[70px]" />

            <div className="relative z-10">
              <div className="mb-6 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-[10px] font-bold tracking-[0.12em] text-white/80 sm:mb-8 sm:w-fit">
                <Sparkles size={14} className="text-[#ff8058]" />
                AI-POWERED PREPARATION
              </div>

              <h2 className="text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
                Your next big
                <br />
                opportunity
                <br />
                <span className="text-[#ff8058]">starts here.</span>
              </h2>

              <p className="mt-4 max-w-sm text-sm leading-6 text-white/60">
                Get ready for the real thing. Build confidence through
                personalized interview practice and actionable insights.
              </p>

              <div className="mt-7 space-y-3 sm:mt-9">
                {features.map((feature, index) => {
                  const Icon = feature.icon;

                  return (
                    <motion.div
                      variants={itemVariants}
                      key={feature.title}
                      className="flex min-w-0 items-start gap-3 rounded-xl border border-white/[0.08] bg-white/[0.045] p-3.5 transition hover:border-[#ee5a2b]/40 hover:bg-white/[0.07] sm:p-4"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ee5a2b]/15 text-[#ff8058]">
                        <Icon size={18} />
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-sm font-bold">{feature.title}</h3>

                        <p className="mt-1 text-xs leading-5 text-white/50">
                          {feature.description}
                        </p>
                      </div>

                      <CheckCircle2
                        size={16}
                        className="ml-auto mt-1 shrink-0 text-white/25"
                      />
                    </motion.div>
                  );
                })}
              </div>

              <div className="mt-7 flex items-center gap-3 border-t border-white/10 pt-5 sm:mt-8">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#ee5a2b]">
                  <ShieldCheck size={18} />
                </div>

                <div>
                  <p className="text-xs font-semibold">
                    Your personal practice space
                  </p>

                  <p className="mt-1 text-[11px] text-white/45">
                    Focus on learning and improving.
                  </p>
                </div>
              </div>
            </div>
          </motion.aside>

          {/* RIGHT: Setup form */}

          <motion.section
            variants={itemVariants}
            className="min-w-0 py-1 sm:py-2"
          >
            <div className="mb-6 sm:mb-7">
              <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#d94b22]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#ee5a2b]" />
                INTERVIEW CONFIGURATION
              </div>

              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                Set up your interview
              </h2>

              <p className="mt-2 text-sm leading-6 text-neutral-500">
                Tell us a little about your goals. We’ll prepare your interview
                session accordingly.
              </p>
            </div>

            {/* Form errors */}

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  role="alert"
                  className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm leading-5 text-red-700"
                >
                  <AlertCircle size={17} className="mt-0.5 shrink-0" />

                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-5 sm:space-y-6">
              {/* Role */}

              <motion.div variants={itemVariants}>
                <label htmlFor="interview-role" className={labelClass}>
                  Target job role
                </label>

                <div className="relative">
                  <UserRound
                    size={17}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
                  />

                  <input
                    id="interview-role"
                    type="text"
                    value={role}
                    onChange={(event) => setRole(event.target.value)}
                    placeholder="e.g. React Developer"
                    maxLength={120}
                    autoComplete="organization-title"
                    disabled={loading || analyzing}
                    className={inputClass}
                  />
                </div>

                <p className="mt-2 text-xs text-neutral-400">
                  Choose the role you want to prepare for.
                </p>
              </motion.div>

              {/* Experience */}

              <motion.div variants={itemVariants}>
                <label htmlFor="interview-experience" className={labelClass}>
                  Experience level
                </label>

                <div className="relative">
                  <BriefcaseBusiness
                    size={17}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
                  />

                  <input
                    id="interview-experience"
                    type="text"
                    value={experience}
                    onChange={(event) => setExperience(event.target.value)}
                    placeholder="e.g. Fresher, 1 year"
                    maxLength={80}
                    disabled={loading || analyzing}
                    className={inputClass}
                  />
                </div>
              </motion.div>

              {/* Interview type */}

              <motion.div variants={itemVariants}>
                <label htmlFor="interview-mode" className={labelClass}>
                  Interview type
                </label>

                <div className="relative">
                  <GraduationCap
                    size={18}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
                  />

                  <select
                    id="interview-mode"
                    value={mode}
                    onChange={(event) => setMode(event.target.value)}
                    disabled={loading || analyzing}
                    className={`${inputClass} cursor-pointer appearance-none pr-10`}
                  >
                    <option value="technical">Technical Interview</option>

                    <option value="HR">HR Interview</option>
                  </select>

                  <ChevronDown
                    size={17}
                    className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
                  />
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setMode("technical")}
                    disabled={loading || analyzing}
                    className={`flex min-w-0 items-center gap-2 rounded-xl border p-3 text-left transition ${
                      mode === "technical"
                        ? "border-[#ee5a2b]/40 bg-[#ee5a2b]/[0.06]"
                        : "border-black/[0.07] bg-white hover:border-black/15"
                    }`}
                  >
                    <Brain
                      size={17}
                      className={
                        mode === "technical"
                          ? "shrink-0 text-[#ee5a2b]"
                          : "shrink-0 text-neutral-400"
                      }
                    />

                    <span className="min-w-0 text-xs font-semibold">
                      Technical
                    </span>

                    {mode === "technical" && (
                      <CheckCircle2
                        size={15}
                        className="ml-auto shrink-0 text-[#ee5a2b]"
                      />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode("HR")}
                    disabled={loading || analyzing}
                    className={`flex min-w-0 items-center gap-2 rounded-xl border p-3 text-left transition ${
                      mode === "HR"
                        ? "border-[#ee5a2b]/40 bg-[#ee5a2b]/[0.06]"
                        : "border-black/[0.07] bg-white hover:border-black/15"
                    }`}
                  >
                    <UserRound
                      size={17}
                      className={
                        mode === "HR"
                          ? "shrink-0 text-[#ee5a2b]"
                          : "shrink-0 text-neutral-400"
                      }
                    />

                    <span className="min-w-0 text-xs font-semibold">
                      HR Interview
                    </span>

                    {mode === "HR" && (
                      <CheckCircle2
                        size={15}
                        className="ml-auto shrink-0 text-[#ee5a2b]"
                      />
                    )}
                  </button>
                </div>
              </motion.div>

              {/* Resume upload */}

              <motion.div variants={itemVariants}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label className={labelClass + " mb-0"}>Resume</label>

                  <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-semibold text-neutral-500">
                    OPTIONAL
                  </span>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  disabled={loading || analyzing}
                  className="hidden"
                  aria-label="Upload resume"
                />

                {!file ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading || analyzing}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();

                      const droppedFile = event.dataTransfer.files?.[0];

                      if (!droppedFile) return;

                      const transfer = {
                        target: {
                          files: [droppedFile],

                          value: "",
                        },
                      };

                      handleFileChange(transfer);
                    }}
                    className="group flex w-full min-w-0 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-black/10 bg-[#faf9f7] px-4 py-7 text-center transition hover:border-[#ee5a2b]/50 hover:bg-[#ee5a2b]/[0.025] disabled:opacity-50 sm:py-8"
                  >
                    <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ee5a2b]/10 text-[#ee5a2b] transition group-hover:scale-105">
                      <FileUp size={22} />
                    </span>

                    <span className="text-sm font-bold text-[#171717]">
                      Upload your resume
                    </span>

                    <span className="mt-1.5 max-w-full break-words text-xs leading-5 text-neutral-500">
                      Tap to browse or drag and drop your file
                    </span>

                    <span className="mt-3 text-[10px] font-medium text-neutral-400">
                      PDF, DOC or DOCX · Max 10 MB
                    </span>
                  </button>
                ) : (
                  <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-[#ee5a2b]/20 bg-[#ee5a2b]/[0.035] p-3.5 sm:p-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#ee5a2b]/10 text-[#ee5a2b]">
                      <FileText size={20} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="break-all text-sm font-semibold text-[#171717]">
                        {file.name}
                      </p>

                      <p className="mt-1 text-xs text-neutral-500">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                        {" · "}
                        {analysisDone
                          ? "Analysis complete"
                          : "Ready to analyze"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      disabled={loading || analyzing}
                      aria-label="Remove resume"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    >
                      <X size={17} />
                    </button>
                  </div>
                )}

                {analysisError && (
                  <p
                    role="alert"
                    className="mt-3 text-xs leading-5 text-red-600"
                  >
                    {analysisError}
                  </p>
                )}

                {file && !analysisDone && (
                  <button
                    type="button"
                    onClick={handleAnalyzeResume}
                    disabled={analyzing || loading}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[#ee5a2b]/30 bg-white px-4 py-3 text-sm font-semibold text-[#d94b22] transition hover:bg-[#ee5a2b]/[0.04] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {analyzing ? (
                      <>
                        <LoaderCircle size={17} className="animate-spin" />
                        Analyzing resume...
                      </>
                    ) : (
                      <>
                        <WandSparkles size={17} />
                        Analyze resume with AI
                      </>
                    )}
                  </button>
                )}

                {/* Resume insights */}

                <AnimatePresence>
                  {analysisDone && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 sm:p-5"
                    >
                      <div className="mb-4 flex items-start gap-3 border-b border-emerald-100 pb-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                          <CheckCircle2 size={19} />
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-emerald-900">
                            Resume insights ready
                          </h3>

                          <p className="mt-1 text-xs leading-5 text-emerald-800/70">
                            Extracted details have been used to personalize your
                            setup where available.
                          </p>
                        </div>
                      </div>

                      {project.length > 0 && (
                        <div className="mb-4">
                          <p className="mb-2 text-[10px] font-bold tracking-wider text-emerald-900">
                            PROJECTS
                          </p>

                          <div className="flex flex-wrap gap-2">
                            {project.map((item, index) => (
                              <span
                                key={`${String(item)}-${index}`}
                                className="max-w-full break-words rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-xs font-medium text-emerald-800"
                              >
                                {typeof item === "string"
                                  ? item
                                  : JSON.stringify(item)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {skills.length > 0 && (
                        <div>
                          <p className="mb-2 text-[10px] font-bold tracking-wider text-emerald-900">
                            SKILLS
                          </p>

                          <div className="flex flex-wrap gap-2">
                            {skills.map((skill, index) => (
                              <span
                                key={`${String(skill)}-${index}`}
                                className="max-w-full break-words rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-medium text-emerald-800"
                              >
                                {typeof skill === "string"
                                  ? skill
                                  : JSON.stringify(skill)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {project.length === 0 && skills.length === 0 && (
                        <p className="text-xs leading-5 text-emerald-800">
                          Resume analyzed successfully. You can review and edit
                          the role and experience fields above.
                        </p>
                      )}

                      <p className="mt-4 text-[10px] leading-5 text-emerald-800/70">
                        You can still edit your interview details before
                        starting the session.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Start interview */}

              <motion.div
                variants={itemVariants}
                className="border-t border-black/[0.07] pt-5 sm:pt-6"
              >
                <button
                  type="button"
                  disabled={isButtonDisabled}
                  onClick={handleStart}
                  className={`group flex w-full items-center justify-center gap-2.5 rounded-xl px-5 py-4 text-sm font-bold transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#ee5a2b]/20 ${
                    isButtonDisabled
                      ? "cursor-not-allowed bg-neutral-200 text-neutral-400"
                      : "bg-[#ee5a2b] text-white shadow-lg shadow-orange-900/15 hover:-translate-y-0.5 hover:bg-[#d94b22] hover:shadow-xl"
                  }`}
                >
                  {loading ? (
                    <>
                      <LoaderCircle size={19} className="animate-spin" />
                      Preparing your interview...
                    </>
                  ) : (
                    <>
                      Start interview
                      <ArrowRight
                        size={18}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </>
                  )}
                </button>

                <div className="mt-3 flex items-start justify-center gap-2 text-center text-[10px] leading-5 text-neutral-400 sm:text-xs">
                  <ShieldCheck size={14} className="mt-0.5 shrink-0" />

                  <span>Review your details before starting your session.</span>
                </div>
              </motion.div>
            </div>
          </motion.section>
        </div>
      </motion.div>
    </div>
  );
}

export default Set1Setup;
