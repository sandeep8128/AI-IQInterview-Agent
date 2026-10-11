
import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import { FaLock, FaEye, FaEyeSlash, FaCheckCircle } from "react-icons/fa";

const API_URL = import.meta.env.VITE_SERVER_URL;

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("Reset link invalid hai. Naya reset link request karein.");
      return;
    }

    if (password.length < 8 || password.length > 128) {
      setError("Password 8 se 128 characters ke beech hona chahiye.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Dono passwords match nahi kar rahe.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${API_URL}/api/auth/reset-password`,
        { token, password },
        { withCredentials: true }
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Password reset nahi ho paya."
        );
      }

      setSuccess("Password successfully reset ho gaya. Ab login karein.");
      setPassword("");
      setConfirmPassword("");

      // User can navigate to login after reading the success message.
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Password reset nahi ho paya. Dobara try karein."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0618] px-4 py-10 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.06] p-7 shadow-2xl backdrop-blur-xl sm:p-9">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-300">
          {success ? (
            <FaCheckCircle size={24} />
          ) : (
            <FaLock size={23} />
          )}
        </div>

        <h1 className="text-center text-3xl font-bold">
          Reset Password
        </h1>

        <p className="mt-3 text-center text-sm leading-6 text-gray-400">
          Apne InterviewIQ.AI account ke liye naya password set karein.
        </p>

        {!token && (
          <div className="mt-6 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-300">
            Reset link missing hai. Login page par jaakar naya link request karein.
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-300"
          >
            {error}
          </div>
        )}

        {success ? (
          <div className="mt-6 space-y-5">
            <div
              role="status"
              className="rounded-xl border border-green-400/20 bg-green-500/10 p-4 text-sm text-green-300"
            >
              {success}
            </div>

            <button
              type="button"
              onClick={() => navigate("/auth")}
              className="w-full rounded-xl bg-purple-600 px-4 py-3 font-semibold transition hover:bg-purple-500"
            >
              Go to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <div>
              <label
                htmlFor="new-password"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                New Password
              </label>

              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />

                <input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={128}
                  required
                  disabled={!token || loading}
                  className="w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-11 pr-12 text-white outline-none transition placeholder:text-gray-500 focus:border-purple-500 disabled:opacity-50"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Confirm New Password
              </label>

              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />

                <input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={128}
                  required
                  disabled={!token || loading}
                  className="w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-11 pr-12 text-white outline-none transition placeholder:text-gray-500 focus:border-purple-500 disabled:opacity-50"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={!token || loading}
              className="w-full rounded-xl bg-purple-600 px-4 py-3 font-semibold transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Resetting Password..." : "Update Password"}
            </button>
          </form>
        )}

        <p className="mt-7 text-center text-sm text-gray-400">
          Remember your password?{" "}
          <Link
            to="/auth"
            className="font-semibold text-purple-300 hover:text-purple-200"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ResetPassword;
