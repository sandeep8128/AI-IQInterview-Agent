import React, { useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import axios from "axios";

import {
  ArrowLeft,
  Search,
  Calendar,
  Award,
  Briefcase,
  ChevronRight,
  Clock,
  Video,
  Filter,
  Sparkles,
  RefreshCw,
  AlertCircle,
  LoaderCircle,
  CheckCircle2,
  CircleDashed,
  SlidersHorizontal,
  X,
} from "lucide-react";

const normalizeStatus = (status) =>
  String(status || "").toLowerCase() === "completed"
    ? "completed"
    : "incomplete";

const formatScore = (score) => {
  const value = Number(score);

  if (!Number.isFinite(value)) return "—";

  return Math.min(10, Math.max(0, value)).toFixed(1);
};

const formatDate = (date) => {
  if (!date) return "Date unavailable";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "Date unavailable";

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",

    month: "short",

    year: "numeric",
  });
};

function InterviewHistory() {
  const [interviews, setInterviews] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [modeFilter, setModeFilter] = useState("all");

  const [statusFilter, setStatusFilter] = useState("all");

  const [sortOrder, setSortOrder] = useState("newest");

  const navigate = useNavigate();

  const getMyInterviews = async () => {
    setLoading(true);

    setError("");

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/api/interview/my-interviews`,

        { withCredentials: true },
      );

      if (response.data?.success) {
        setInterviews(
          Array.isArray(response.data.interviews)
            ? response.data.interviews
            : [],
        );
      } else {
        setError(
          response.data?.message || "Interview history load nahi ho payi.",
        );
      }
    } catch (err) {
      console.error("Error fetching interview history:", err);

      setError(
        err.response?.data?.message ||
          "History load nahi ho payi. Please login check karke retry karein.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMyInterviews();
  }, []);

  const filteredInterviews = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = interviews.filter((item) => {
      const role = String(item.role || "").toLowerCase();

      const mode = String(item.mode || "").toLowerCase();

      const experience = String(item.experience || "").toLowerCase();

      const matchesSearch =
        !query ||
        role.includes(query) ||
        mode.includes(query) ||
        experience.includes(query);

      const matchesMode =
        modeFilter === "all" || mode === modeFilter.toLowerCase();

      const matchesStatus =
        statusFilter === "all" || normalizeStatus(item.status) === statusFilter;

      return matchesSearch && matchesMode && matchesStatus;
    });

    return result.sort((a, b) => {
      if (sortOrder === "oldest") {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      }

      if (sortOrder === "highest") {
        return (Number(b.finalScore) || 0) - (Number(a.finalScore) || 0);
      }

      if (sortOrder === "lowest") {
        return (Number(a.finalScore) || 0) - (Number(b.finalScore) || 0);
      }

      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  }, [interviews, search, modeFilter, statusFilter, sortOrder]);

  const completedCount = interviews.filter(
    (item) => normalizeStatus(item.status) === "completed",
  ).length;

  const averageScore = useMemo(() => {
    const completed = interviews.filter(
      (item) =>
        normalizeStatus(item.status) === "completed" &&
        Number.isFinite(Number(item.finalScore)),
    );

    if (!completed.length) return null;

    const total = completed.reduce(
      (sum, item) => sum + Math.min(10, Math.max(0, Number(item.finalScore))),

      0,
    );

    return (total / completed.length).toFixed(1);
  }, [interviews]);

  const resetFilters = () => {
    setSearch("");

    setModeFilter("all");

    setStatusFilter("all");

    setSortOrder("newest");
  };

  return (
    <div className="min-h-screen overflow-x-clip bg-[#f8f5f3] text-[#201e1e]">
      {/* Main content */}

      <main className="mx-auto min-w-0 w-full max-w-7xl px-3 py-5 sm:px-6 sm:py-7 lg:px-8 xl:px-10">
        <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Go back"
              className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-black/10 bg-white transition hover:bg-neutral-50"
            >
              <ArrowLeft size={18} />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Sparkles size={15} className="text-[#ee5a2b]" />

                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#ee5a2b]">
                  Your progress
                </p>
              </div>

              <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
                Interview History
              </h1>

              <p className="mt-2 text-sm leading-6 text-neutral-500">
                Apne previous interviews, scores aur improvement track karo.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={getMyInterviews}
            disabled={loading}
            className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-xl border border-black/10 bg-white px-4 py-2.5 text-xs font-bold transition hover:bg-neutral-50 disabled:opacity-60 sm:self-auto"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </header>

        {/* Summary cards */}

        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          {[
            {
              label: "Total interviews",

              value: interviews.length,

              icon: Video,

              color: "#ee5a2b",

              bg: "#fff0e9",
            },

            {
              label: "Completed",

              value: completedCount,

              icon: CheckCircle2,

              color: "#16a34a",

              bg: "#eaf8ee",
            },

            {
              label: "Average score",

              value: averageScore === null ? "—" : `${averageScore}/10`,

              icon: Award,

              color: "#3785d5",

              bg: "#edf5ff",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="rounded-2xl border border-black/[0.05] bg-white p-4 shadow-[0_5px_20px_rgba(0,0,0,0.02)] sm:rounded-3xl sm:p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-neutral-500">
                      {item.label}
                    </p>

                    <p className="mt-2 text-2xl font-black tabular-nums">
                      {item.value}
                    </p>
                  </div>

                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: item.bg, color: item.color }}
                  >
                    <Icon size={21} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Search and filters */}

        <section className="mb-5 rounded-2xl border border-black/[0.05] bg-white p-4 shadow-[0_5px_20px_rgba(0,0,0,0.02)] sm:rounded-3xl sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <SlidersHorizontal size={17} className="text-[#ee5a2b]" />

            <h2 className="text-sm font-extrabold">Find an interview</h2>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="relative min-w-0">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search role or mode..."
                aria-label="Search interviews"
                className="h-11 w-full rounded-xl border border-neutral-200 bg-[#faf9f8] pl-10 pr-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-[#ee5a2b] focus:ring-2 focus:ring-[#ee5a2b]/10"
              />
            </div>

            <select
              value={modeFilter}
              onChange={(event) => setModeFilter(event.target.value)}
              aria-label="Filter by interview mode"
              className="h-11 w-full rounded-xl border border-neutral-200 bg-[#faf9f8] px-3 text-sm outline-none focus:border-[#ee5a2b]"
            >
              <option value="all">All interview modes</option>

              <option value="technical">Technical</option>

              <option value="hr">HR</option>
            </select>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter by interview status"
              className="h-11 w-full rounded-xl border border-neutral-200 bg-[#faf9f8] px-3 text-sm outline-none focus:border-[#ee5a2b]"
            >
              <option value="all">All statuses</option>

              <option value="completed">Completed</option>

              <option value="incomplete">Incomplete</option>
            </select>

            <select
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
              aria-label="Sort interviews"
              className="h-11 w-full rounded-xl border border-neutral-200 bg-[#faf9f8] px-3 text-sm outline-none focus:border-[#ee5a2b]"
            >
              <option value="newest">Newest first</option>

              <option value="oldest">Oldest first</option>

              <option value="highest">Highest score</option>

              <option value="lowest">Lowest score</option>
            </select>
          </div>

          {(search || modeFilter !== "all" || statusFilter !== "all") && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-neutral-500">
                {filteredInterviews.length} matching interview(s)
              </p>

              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#d94b22] hover:underline"
              >
                <X size={13} />
                Clear filters
              </button>
            </div>
          )}
        </section>

        {/* Results header */}

        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold">Your sessions</h2>

            <p className="mt-1 text-xs text-neutral-500">
              {filteredInterviews.length} interview
              {filteredInterviews.length === 1 ? "" : "s"} found
            </p>
          </div>

          <span className="rounded-full bg-[#fff0e9] px-3 py-2 text-[10px] font-extrabold text-[#d94b22]">
            HISTORY
          </span>
        </div>

        {/* Loading */}

        {loading ? (
          <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-black/[0.05] bg-white">
            <LoaderCircle size={30} className="animate-spin text-[#ee5a2b]" />

            <p className="mt-4 text-sm font-bold">Loading your interviews</p>

            <p className="mt-1 text-xs text-neutral-500">
              Please wait a moment...
            </p>
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-200 bg-white p-7 text-center sm:p-10">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <AlertCircle size={23} />
            </div>

            <h3 className="mt-4 text-base font-extrabold">
              Could not load history
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
              {error}
            </p>

            <button
              type="button"
              onClick={getMyInterviews}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#ee5a2b] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#d94b22]"
            >
              <RefreshCw size={16} />
              Try again
            </button>
          </div>
        ) : filteredInterviews.length > 0 ? (
          <div className="grid gap-3">
            {filteredInterviews.map((item) => {
              const completed = normalizeStatus(item.status) === "completed";

              const score = Number(item.finalScore);

              const validScore = Number.isFinite(score);

              return (
                <article
                  key={item._id}
                  className="group min-w-0 rounded-2xl border border-black/[0.05] bg-white p-4 shadow-[0_5px_20px_rgba(0,0,0,0.02)] transition duration-200 hover:border-[#ee5a2b]/25 hover:shadow-lg sm:rounded-3xl sm:p-5"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    {/* Interview information */}

                    <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#fff0e9] text-[#ee5a2b] transition group-hover:bg-[#ffe4d7] sm:h-12 sm:w-12">
                        <Briefcase size={21} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="break-words text-base font-extrabold capitalize leading-6 text-[#201e1e] sm:text-lg">
                          {item.role || "Interview"}
                        </h3>

                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-neutral-500">
                          {item.experience && (
                            <span className="inline-flex items-center gap-1.5">
                              <Clock size={14} />

                              {item.experience}
                            </span>
                          )}

                          <span className="inline-flex items-center gap-1.5">
                            <Calendar size={14} />

                            {formatDate(item.createdAt)}
                          </span>

                          {item.mode && (
                            <span className="rounded-full bg-[#edf5ff] px-2.5 py-1 font-bold capitalize text-[#2766ac]">
                              {item.mode}
                            </span>
                          )}
                        </div>

                        <div className="mt-3">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                              completed
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {completed ? (
                              <CheckCircle2 size={12} />
                            ) : (
                              <CircleDashed size={12} />
                            )}

                            {completed ? "Completed" : "Incomplete"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Score and action */}

                    <div className="flex items-center justify-between gap-4 border-t border-black/[0.05] pt-4 md:justify-end md:border-t-0 md:pt-0">
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                          Final score
                        </p>

                        <div className="mt-1 flex items-center gap-2">
                          <Award
                            size={19}
                            className={
                              completed ? "text-amber-500" : "text-neutral-300"
                            }
                          />

                          <span className="text-xl font-black tabular-nums">
                            {completed && validScore
                              ? `${formatScore(score)}/10`
                              : "—"}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (completed) {
                            navigate(`/report/${item._id}`);
                          } else {
                            navigate("/interview");
                          }
                        }}
                        className="inline-flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#201e1e] px-3 py-2.5 text-xs font-bold text-white transition hover:bg-[#ee5a2b] sm:px-4 sm:text-sm"
                      >
                        {completed ? "View report" : "Continue"}

                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-neutral-300 bg-white px-5 py-12 text-center sm:px-10 sm:py-16">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff0e9] text-[#ee5a2b]">
              {interviews.length === 0 ? (
                <Video size={25} />
              ) : (
                <Filter size={25} />
              )}
            </div>

            <h3 className="mt-4 text-base font-extrabold">
              {interviews.length === 0
                ? "No interviews yet"
                : "No matching interviews"}
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-neutral-500">
              {interviews.length === 0
                ? "Apna pehla mock interview start karo aur yahan apni performance track karo."
                : "Search ya filters change karke dobara try karo."}
            </p>

            {interviews.length === 0 ? (
              <button
                type="button"
                onClick={() => navigate("/interview")}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#ee5a2b] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#d94b22]"
              >
                <Video size={16} />
                Start an interview
              </button>
            ) : (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-5 inline-flex items-center gap-2 rounded-xl border border-black/10 px-5 py-3 text-sm font-bold transition hover:bg-neutral-50"
              >
                <X size={15} />
                Clear filters
              </button>
            )}
          </div>
        )}

        <footer className="mt-8 border-t border-black/[0.06] py-5 text-center">
          <p className="text-xs text-neutral-400">
            InterviewIQ.AI · Make every interview count.
          </p>
        </footer>
      </main>
    </div>
  );
}

export default InterviewHistory;
