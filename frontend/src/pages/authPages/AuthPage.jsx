import { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaLock,
  FaUser,
  FaArrowLeft,
  FaArrowRight,
  FaCheckCircle,
  FaMicrophone,
  FaBrain,
  FaChartLine,
  FaShieldAlt,
} from "react-icons/fa";
import { setUser } from "../../redux/userSlice";

const API_URL = import.meta.env.VITE_SERVER_URL;

const inputWrap =
  "group flex items-center gap-3 rounded-xl border border-black/10 bg-white px-4 transition-all duration-200 focus-within:border-[#ee5a2b] focus-within:ring-4 focus-within:ring-[#ee5a2b]/10";

const inputCls =
  "w-full bg-transparent py-3.5 text-sm text-[#171717] outline-none placeholder:text-neutral-400 disabled:opacity-60";

const labelCls = "mb-2 block text-sm font-semibold text-[#222222]";

function AuthPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isRegister = mode === "register";
  const isForgotPassword = mode === "forgot";

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const changeMode = (nextMode) => {
    if (loading) return;

    setMode(nextMode);
    clearMessages();
    setPassword("");
    setShowPassword(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    clearMessages();

    if (!API_URL) {
      setError("Server URL missing hai. Frontend .env check karein.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (isRegister && name.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }

    if (password.length < 8 || password.length > 128) {
      setError("Password must contain 8 to 128 characters.");
      return;
    }

    setLoading(true);

    try {
      const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";

      const payload = isRegister
        ? {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
          }
        : {
            email: email.trim().toLowerCase(),
            password,
          };

      const response = await axios.post(`${API_URL}${endpoint}`, payload, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.data?.success || !response.data?.user) {
        throw new Error(response.data?.message || "Authentication failed.");
      }

      dispatch(setUser(response.data.user));

      setSuccess(
        response.data.message ||
          (isRegister ? "Account created successfully." : "Login successful."),
      );

      // Successful login/register ke baad Home page par jao.
      navigate("/", { replace: true });
    } catch (err) {
      if (err.response) {
        setError(
          err.response.data?.message ||
            "Authentication failed. Please try again.",
        );
      } else if (err.request) {
        setError("Server se connection nahi ho pa raha. Backend check karein.");
      } else {
        setError(err.message || "Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (event) => {
    event.preventDefault();
    clearMessages();

    if (!API_URL) {
      setError("Server URL missing hai. Frontend .env check karein.");
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/auth/forgot-password`,
        { email: cleanEmail },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Unable to process request.");
      }

      setSuccess(
        response.data.message ||
          "If an account exists with this email, a reset link will be sent.",
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Reset link send nahi ho paya. Dobara try karein.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#f6f5f3] text-[#171717]"
      style={{
        fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        * {
          box-sizing: border-box;
        }

        .auth-scrollbar::-webkit-scrollbar {
          width: 5px;
        }

        .auth-scrollbar::-webkit-scrollbar-thumb {
          background: #d4d4d4;
          border-radius: 20px;
        }

        @media (prefers-reduced-motion: reduce) {
          .auth-motion {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      <div className="grid min-h-screen lg:grid-cols-[1.03fr_0.97fr]">
        {/* LEFT: BRAND PANEL */}
        <section className="relative hidden min-h-screen overflow-hidden bg-[#111111] p-10 text-white lg:flex lg:flex-col xl:p-14">
          <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#ee5a2b]/20 blur-[100px]" />
          <div className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-orange-500/10 blur-[110px]" />

          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ee5a2b] shadow-lg shadow-orange-950/30">
              <svg
                width="25"
                height="25"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M12 2.5 4.5 6.8v10.4L12 21.5l7.5-4.3V6.8L12 2.5Z"
                  stroke="white"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="12" r="3" fill="white" />
              </svg>
            </div>

            <div>
              <p className="text-base font-extrabold tracking-tight">
                AI Interview Agent
              </p>
              <p className="mt-0.5 text-[11px] text-white/50">
                Your next opportunity starts here
              </p>
            </div>
          </div>

          <div className="relative z-10 my-auto max-w-xl py-16">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
            >
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-semibold text-white/80">
                <span className="h-2 w-2 rounded-full bg-[#ee5a2b]" />
                YOUR PERSONAL AI INTERVIEW COACH
              </div>

              <h1 className="text-4xl font-extrabold leading-[1.15] tracking-tight xl:text-6xl">
                Prepare smarter.
                <br />
                <span className="text-[#ee5a2b]">Interview better.</span>
                <br />
                Get hired.
              </h1>

              <p className="mt-6 max-w-md text-sm leading-7 text-white/60 xl:text-base">
                Practice real interview questions, sharpen your answers, and
                build the confidence to make your next career move.
              </p>

              {/* Feature cards */}
              <div className="mt-10 grid max-w-lg grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 transition hover:border-orange-500/40">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#ee5a2b]/15 text-[#ff8058]">
                    <FaMicrophone size={17} />
                  </div>
                  <p className="text-sm font-bold">Mock Interviews</p>
                  <p className="mt-1 text-xs leading-5 text-white/50">
                    Practice at your own pace
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 transition hover:border-orange-500/40">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#ee5a2b]/15 text-[#ff8058]">
                    <FaBrain size={17} />
                  </div>
                  <p className="text-sm font-bold">AI Feedback</p>
                  <p className="mt-1 text-xs leading-5 text-white/50">
                    Discover where to improve
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 transition hover:border-orange-500/40">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#ee5a2b]/15 text-[#ff8058]">
                    <FaChartLine size={17} />
                  </div>
                  <p className="text-sm font-bold">Track Progress</p>
                  <p className="mt-1 text-xs leading-5 text-white/50">
                    See how your skills grow
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 transition hover:border-orange-500/40">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#ee5a2b]/15 text-[#ff8058]">
                    <FaShieldAlt size={17} />
                  </div>
                  <p className="text-sm font-bold">Your Workspace</p>
                  <p className="mt-1 text-xs leading-5 text-white/50">
                    A personal practice experience
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="relative z-10 flex items-center justify-between gap-4 border-t border-white/10 pt-5 text-xs text-white/40">
            <span>Built for your next big opportunity.</span>
            <span>AI Interview Agent © 2026</span>
          </div>
        </section>

        {/* RIGHT: AUTH FORM */}
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-8 sm:px-10 lg:px-12">
          <div className="pointer-events-none absolute -right-32 -top-28 h-80 w-80 rounded-full bg-[#ee5a2b]/[0.07] blur-[90px]" />
          <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-orange-300/10 blur-[100px]" />

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="relative z-10 w-full max-w-[430px]"
          >
            {/* Mobile brand */}
            <div className="mb-9 flex items-center justify-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ee5a2b] text-white">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M12 2.5 4.5 6.8v10.4L12 21.5l7.5-4.3V6.8L12 2.5Z"
                    stroke="white"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="12" r="3" fill="white" />
                </svg>
              </div>
              <span className="font-extrabold tracking-tight">
                AI Interview Agent
              </span>
            </div>

            <div className="mb-8">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#ee5a2b]/15 bg-[#ee5a2b]/[0.07] px-3 py-1.5 text-xs font-semibold text-[#d94b22]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#ee5a2b]" />
                {isForgotPassword
                  ? "ACCOUNT RECOVERY"
                  : isRegister
                    ? "GET STARTED FOR FREE"
                    : "WELCOME BACK"}
              </div>

              <h2 className="text-3xl font-extrabold tracking-tight text-[#171717] sm:text-[38px]">
                {isForgotPassword
                  ? "Reset your password"
                  : isRegister
                    ? "Create your account"
                    : "Good to see you."}
              </h2>

              <p className="mt-3 text-sm leading-6 text-neutral-500">
                {isForgotPassword
                  ? "Enter your registered email to receive password reset instructions."
                  : isRegister
                    ? "Create an account and start preparing for your next interview."
                    : "Sign in to continue your interview preparation journey."}
              </p>
            </div>

            {/* Status messages */}
            {error && (
              <div
                role="alert"
                className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
              >
                {error}
              </div>
            )}

            {success && (
              <div
                role="status"
                className="mb-5 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-700"
              >
                <FaCheckCircle className="mt-1 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <form
              onSubmit={isForgotPassword ? handleForgotPassword : handleSubmit}
              className="space-y-5"
            >
              {isRegister && (
                <div>
                  <label htmlFor="auth-name" className={labelCls}>
                    Full name
                  </label>
                  <div className={inputWrap}>
                    <FaUser className="shrink-0 text-neutral-400 transition group-focus-within:text-[#ee5a2b]" />
                    <input
                      id="auth-name"
                      type="text"
                      autoComplete="name"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      minLength={2}
                      maxLength={100}
                      required
                      disabled={loading}
                      className={inputCls}
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="auth-email" className={labelCls}>
                  Email address
                </label>
                <div className={inputWrap}>
                  <FaEnvelope className="shrink-0 text-neutral-400 transition group-focus-within:text-[#ee5a2b]" />
                  <input
                    id="auth-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    maxLength={254}
                    required
                    disabled={loading}
                    className={inputCls}
                  />
                </div>
              </div>

              {!isForgotPassword && (
                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label
                      htmlFor="auth-password"
                      className="block text-sm font-semibold text-[#222222]"
                    >
                      Password
                    </label>

                    {!isRegister && (
                      <button
                        type="button"
                        onClick={() => changeMode("forgot")}
                        disabled={loading}
                        className="text-xs font-semibold text-[#d94b22] transition hover:text-[#aa3516] disabled:opacity-50"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>

                  <div className={inputWrap}>
                    <FaLock className="shrink-0 text-neutral-400 transition group-focus-within:text-[#ee5a2b]" />
                    <input
                      id="auth-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete={
                        isRegister ? "new-password" : "current-password"
                      }
                      placeholder={
                        isRegister
                          ? "At least 8 characters"
                          : "Enter your password"
                      }
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      minLength={8}
                      maxLength={128}
                      required
                      disabled={loading}
                      className={inputCls}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((previous) => !previous)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="shrink-0 text-neutral-400 transition hover:text-[#171717]"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>

                  {isRegister && (
                    <p className="mt-2 text-xs text-neutral-500">
                      Use at least 8 characters for your password.
                    </p>
                  )}
                </div>
              )}

              <motion.button
                type="submit"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.99 }}
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#ee5a2b] px-5 py-4 text-sm font-bold text-white shadow-lg shadow-orange-900/15 transition-all duration-200 hover:bg-[#d94b22] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#ee5a2b]/25 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Please wait..."
                  : isForgotPassword
                    ? "Send reset link"
                    : isRegister
                      ? "Create account"
                      : "Sign in"}

                {!loading && !isForgotPassword && (
                  <FaArrowRight className="transition-transform group-hover:translate-x-1" />
                )}
              </motion.button>

              {isForgotPassword && (
                <button
                  type="button"
                  onClick={() => changeMode("login")}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 py-2 text-sm font-semibold text-neutral-600 transition hover:text-[#171717]"
                >
                  <FaArrowLeft size={12} />
                  Back to sign in
                </button>
              )}
            </form>

            {!isForgotPassword && (
              <div className="mt-7 text-center text-sm text-neutral-500">
                {isRegister
                  ? "Already have an account?"
                  : "New to AI Interview Agent?"}{" "}
                <button
                  type="button"
                  onClick={() => changeMode(isRegister ? "login" : "register")}
                  disabled={loading}
                  className="font-bold text-[#d94b22] transition hover:text-[#aa3516] disabled:opacity-50"
                >
                  {isRegister ? "Sign in" : "Create an account"}
                </button>
              </div>
            )}

            <div className="mt-8 flex items-center justify-center gap-2 border-t border-black/[0.07] pt-5 text-xs text-neutral-400">
              <FaShieldAlt className="text-[#ee5a2b]" />
              <span>Your account is protected with secure authentication.</span>
            </div>

            <p className="mt-5 text-center text-[11px] text-neutral-400">
              AI Interview Agent · Prepare for what’s next.
            </p>
          </motion.div>
        </section>
      </div>
    </div>
  );
}

export default AuthPage;
