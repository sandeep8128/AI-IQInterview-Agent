import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Crosshair,
  Loader2,
  RefreshCw,
  Sparkles,
  Tag,
  Target,
  Trash2,
  TrendingUp,
} from "lucide-react";
import {
  generatePreparationPlan,
  getMyPreparationPlans,
  updatePreparationTask,
  deletePreparationPlan,
} from "../../api/preparationPlan.js";

const DIFFICULTY_STYLES = {
  Easy: "bg-neutral-100 text-neutral-600",
  Medium: "bg-[#fff1ea] text-[#c2410c]",
  Hard: "bg-[#111111] text-white",
};

const inputCls =
  "w-full min-h-12 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-[#111111] outline-none transition placeholder:text-neutral-400 focus:border-[#ee5a2b] focus:ring-4 focus:ring-[#ee5a2b]/15";
const labelCls = "mb-2 block text-xs font-semibold text-neutral-700";
const cardCls =
  "rounded-2xl border border-black/5 bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.05)] sm:p-6";

function getErrorMessage(error) {
  return (
    error.response?.data?.message ||
    error.message ||
    "Something went wrong. Please try again."
  );
}

function ProgressRing({ value }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div
      role="progressbar"
      aria-label="Preparation plan progress"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      className="relative h-36 w-36 shrink-0"
    >
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="9"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="#ee5a2b"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 500ms ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-semibold tracking-tight text-white">
          {value}%
        </span>
        <span className="text-[10px] uppercase tracking-widest text-white/50">
          done
        </span>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, value, label }) {
  return (
    <div className={`${cardCls} flex flex-col justify-between`}>
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#111111] text-[#ee5a2b]">
        <Icon size={19} />
      </span>
      <div className="mt-6">
        <p className="text-3xl font-semibold tracking-tight">{value}</p>
        <p className="mt-1 text-xs text-neutral-500">{label}</p>
      </div>
    </div>
  );
}

function InsightList({ icon: Icon, title, items, emptyText, dark = false }) {
  return (
    <div className={cardCls}>
      <div className="mb-5 flex items-center gap-3">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            dark ? "bg-[#111111] text-[#ee5a2b]" : "bg-[#ee5a2b] text-white"
          }`}
        >
          <Icon size={19} />
        </span>
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      </div>

      {items?.length ? (
        <ul className="space-y-3">
          {items.map((item, index) => (
            <li
              key={`${item}-${index}`}
              className="flex items-start gap-3 text-sm leading-relaxed text-neutral-600"
            >
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#ee5a2b]" />
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm leading-relaxed text-neutral-500">{emptyText}</p>
      )}
    </div>
  );
}

function PreparationDashboard() {
  const [plans, setPlans] = useState([]);
  const [activePlan, setActivePlan] = useState(null);

  const [targetRole, setTargetRole] = useState("Full Stack Developer");
  const [experience, setExperience] = useState("Fresher");
  const [durationDays, setDurationDays] = useState("7");

  const [selectedDay, setSelectedDay] = useState("all");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadPlans = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getMyPreparationPlans();
      const savedPlans = Array.isArray(response.plans) ? response.plans : [];

      setPlans(savedPlans);

      setActivePlan((currentPlan) => {
        if (currentPlan) {
          const updatedPlan = savedPlans.find(
            (plan) => plan._id === currentPlan._id,
          );

          if (updatedPlan) return updatedPlan;
        }

        return (
          savedPlans.find((plan) => plan.status === "active") ||
          savedPlans[0] ||
          null
        );
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  const tasks = activePlan?.dailyTasks || [];

  const completedTasks = useMemo(
    () => tasks.filter((task) => task.completed).length,
    [tasks],
  );

  const progress = tasks.length
    ? Math.round((completedTasks / tasks.length) * 100)
    : 0;

  const totalMinutes = tasks.reduce(
    (total, task) => total + (Number(task.estimatedMinutes) || 0),
    0,
  );

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (selectedDay === "all") return true;
      return Number(task.dayNumber) === Number(selectedDay);
    });
  }, [tasks, selectedDay]);

  const dayNumbers = useMemo(() => {
    return [...new Set(tasks.map((task) => Number(task.dayNumber)))]
      .filter(Number.isFinite)
      .sort((a, b) => a - b);
  }, [tasks]);

  const handleGeneratePlan = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!targetRole.trim()) {
      setError("Please enter your target job role.");
      return;
    }

    setGenerating(true);

    try {
      const response = await generatePreparationPlan({
        targetRole: targetRole.trim(),
        experience,
        durationDays: Number(durationDays),
      });

      if (!response.plan) {
        throw new Error("The server did not return a preparation plan.");
      }

      setPlans((current) => [
        response.plan,
        ...current.filter((plan) => plan._id !== response.plan._id),
      ]);

      setActivePlan(response.plan);
      setSelectedDay("all");
      setNotice("Your personalized preparation plan is ready!");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  };

  const handleTaskToggle = async (task) => {
    if (!activePlan?._id || updatingTaskId) return;

    setError("");
    setNotice("");
    setUpdatingTaskId(task._id);

    const previousPlan = activePlan;
    const nextCompleted = !task.completed;

    // Update the UI immediately for a responsive experience.
    const optimisticPlan = {
      ...previousPlan,
      dailyTasks: previousPlan.dailyTasks.map((item) =>
        item._id === task._id ? { ...item, completed: nextCompleted } : item,
      ),
    };

    const optimisticCompleted = optimisticPlan.dailyTasks.every(
      (item) => item.completed,
    );

    optimisticPlan.status =
      optimisticCompleted && optimisticPlan.dailyTasks.length
        ? "completed"
        : "active";

    setActivePlan(optimisticPlan);
    setPlans((current) =>
      current.map((plan) =>
        plan._id === optimisticPlan._id ? optimisticPlan : plan,
      ),
    );

    try {
      const response = await updatePreparationTask(
        activePlan._id,
        task._id,
        nextCompleted,
      );

      const updatedPlan = response.plan;

      if (updatedPlan) {
        setActivePlan(updatedPlan);
        setPlans((current) =>
          current.map((plan) =>
            plan._id === updatedPlan._id ? updatedPlan : plan,
          ),
        );
      }

      setNotice(
        nextCompleted
          ? "Task completed. Keep up the good work!"
          : "Task marked as incomplete.",
      );
    } catch (err) {
      setActivePlan(previousPlan);
      setPlans((current) =>
        current.map((plan) =>
          plan._id === previousPlan._id ? previousPlan : plan,
        ),
      );
      setError(getErrorMessage(err));
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleDeletePlan = async () => {
    if (!activePlan?._id || deleting) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this preparation plan?",
    );

    if (!confirmed) return;

    setDeleting(true);
    setError("");
    setNotice("");

    try {
      await deletePreparationPlan(activePlan._id);

      const remainingPlans = plans.filter(
        (plan) => plan._id !== activePlan._id,
      );

      setPlans(remainingPlans);
      setActivePlan(
        remainingPlans.find((plan) => plan.status === "active") ||
          remainingPlans[0] ||
          null,
      );
      setSelectedDay("all");
      setNotice("Preparation plan deleted successfully.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const selectPlan = (plan) => {
    setActivePlan(plan);
    setSelectedDay("all");
    setError("");
    setNotice("");
  };

  const chipCls = (active) =>
    `shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ee5a2b] ${
      active
        ? "bg-[#111111] text-white shadow-md"
        : "border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400"
    }`;

  return (
    <main className="min-h-screen bg-[#f6f5f3] px-4 pb-16 pt-6 font-sans text-[#111111] sm:px-6">
      <div className="mx-auto w-full max-w-6xl">
        {/* ---------------- Hero ---------------- */}
        <header className="relative overflow-hidden rounded-3xl bg-[#111111] px-6 pb-24 pt-8 sm:px-10 sm:pt-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-[#ee5a2b] opacity-40 blur-[100px]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.18) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
              maskImage: "linear-gradient(to bottom, black, transparent 85%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, black, transparent 85%)",
            }}
          />

          <div className="relative flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-2xl">
              <div className="mb-5 flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur">
                <Sparkles size={13} className="text-[#ee5a2b]" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/80">
                  AI-powered preparation
                </span>
              </div>

              <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl">
                Your Interview
                <br />
                <span className="text-[#ee5a2b]">Preparation Dashboard</span>
              </h1>

              <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/60">
                Get a personalized learning plan, practice every day, and track
                your progress toward interview readiness.
              </p>
            </div>

            <button
              type="button"
              onClick={loadPlans}
              disabled={loading || generating}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur transition hover:bg-white/20 disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh plans
            </button>
          </div>
        </header>

        {/* ---------------- Generator (overlaps hero) ---------------- */}
        <section
          className={`${cardCls} relative z-10 mx-2 -mt-16 sm:mx-6 sm:p-8`}
          aria-labelledby="create-plan-title"
        >
          <div className="mb-6 flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#ee5a2b] text-white">
              <Sparkles size={20} />
            </span>
            <div>
              <h2
                id="create-plan-title"
                className="text-xl font-semibold tracking-tight"
              >
                Create your preparation plan
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-neutral-500">
                AI will use your interview performance, when available, to
                personalize your practice schedule.
              </p>
            </div>
          </div>

          <form onSubmit={handleGeneratePlan}>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="targetRole" className={labelCls}>
                  Target job role
                </label>
                <input
                  id="targetRole"
                  className={inputCls}
                  value={targetRole}
                  onChange={(event) => setTargetRole(event.target.value)}
                  placeholder="e.g. Full Stack Developer"
                  maxLength={150}
                  required
                />
              </div>

              <div>
                <label htmlFor="experience" className={labelCls}>
                  Experience level
                </label>
                <select
                  id="experience"
                  className={inputCls}
                  value={experience}
                  onChange={(event) => setExperience(event.target.value)}
                >
                  <option value="Fresher">Fresher</option>
                  <option value="0-1 years">0–1 years</option>
                  <option value="1-3 years">1–3 years</option>
                  <option value="3+ years">3+ years</option>
                </select>
              </div>

              <div>
                <label htmlFor="durationDays" className={labelCls}>
                  Preparation duration
                </label>
                <select
                  id="durationDays"
                  className={inputCls}
                  value={durationDays}
                  onChange={(event) => setDurationDays(event.target.value)}
                >
                  <option value="7">7 days</option>
                  <option value="14">14 days</option>
                  <option value="30">30 days</option>
                  <option value="60">60 days</option>
                  <option value="90">90 days</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={generating}
              className="group mt-6 flex w-full items-center justify-between rounded-full bg-[#111111] py-1.5 pl-6 pr-1.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(0,0,0,0.18)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {generating
                ? "Generating your plan..."
                : "Generate AI Preparation Plan"}
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ee5a2b]">
                {generating ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <ArrowRight
                    size={18}
                    className="transition group-hover:translate-x-0.5"
                  />
                )}
              </span>
            </button>
          </form>
        </section>

        {/* ---------------- Alerts ---------------- */}
        {(error || notice) && (
          <div className="mt-6 space-y-3">
            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
              >
                {error}
              </div>
            )}

            {notice && (
              <div
                role="status"
                className="flex items-center gap-3 rounded-xl bg-[#111111] px-4 py-3 text-sm font-medium text-white"
              >
                <CheckCircle2 size={17} className="shrink-0 text-[#ee5a2b]" />
                {notice}
              </div>
            )}
          </div>
        )}

        <div className="mt-8">
          {loading ? (
            <section aria-live="polite" aria-busy="true" className="space-y-4">
              <p className="sr-only">Loading your saved preparation plans...</p>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="h-48 animate-pulse rounded-2xl bg-neutral-200/70 md:row-span-2 md:h-auto" />
                <div className="h-32 animate-pulse rounded-2xl bg-neutral-200/70" />
                <div className="h-32 animate-pulse rounded-2xl bg-neutral-200/70" />
                <div className="h-32 animate-pulse rounded-2xl bg-neutral-200/70" />
                <div className="h-32 animate-pulse rounded-2xl bg-neutral-200/70" />
              </div>
              <div className="h-64 animate-pulse rounded-2xl bg-neutral-200/70" />
            </section>
          ) : !activePlan ? (
            <section className={`${cardCls} px-6 py-14 text-center`}>
              <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#111111] text-[#ee5a2b]">
                <Target size={30} />
              </span>
              <h2 className="text-2xl font-semibold tracking-tight">
                Your journey starts here
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-neutral-500">
                Generate your first AI preparation plan to get daily tasks
                tailored to your target role and interview performance.
              </p>
            </section>
          ) : (
            <div className="space-y-6">
              {plans.length > 1 && (
                <section>
                  <label htmlFor="savedPlan" className={`${labelCls} text-sm`}>
                    Your saved plans
                  </label>

                  <select
                    id="savedPlan"
                    className={`${inputCls} max-w-xl`}
                    value={activePlan._id}
                    onChange={(event) => {
                      const plan = plans.find(
                        (item) => item._id === event.target.value,
                      );
                      if (plan) selectPlan(plan);
                    }}
                  >
                    {plans.map((plan) => (
                      <option key={plan._id} value={plan._id}>
                        {plan.targetRole} · {plan.durationDays} days ·{" "}
                        {plan.status}
                      </option>
                    ))}
                  </select>
                </section>
              )}

              {/* Progress + stats */}
              <section className="grid gap-4 lg:grid-cols-3">
                <div className="relative overflow-hidden rounded-2xl bg-[#111111] p-6 text-white shadow-[0_20px_50px_rgba(0,0,0,0.25)] lg:row-span-2">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -bottom-20 -left-16 h-52 w-52 rounded-full bg-[#ee5a2b] opacity-30 blur-[80px]"
                  />
                  <div className="relative flex h-full flex-col items-center justify-between gap-6 text-center">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">
                        Overall progress
                      </p>
                      <p className="mt-2 truncate text-lg font-semibold">
                        {activePlan.targetRole}
                      </p>
                    </div>

                    <ProgressRing value={progress} />

                    <p className="max-w-[220px] text-xs leading-relaxed text-white/60">
                      {progress === 100
                        ? "Amazing! You completed every task in this plan."
                        : "Keep completing daily tasks to reach your goal."}
                    </p>
                  </div>
                </div>

                <StatCard
                  icon={BookOpen}
                  value={tasks.length}
                  label="Total tasks"
                />
                <StatCard
                  icon={CheckCircle2}
                  value={`${completedTasks}/${tasks.length}`}
                  label="Tasks completed"
                />
                <StatCard
                  icon={Clock3}
                  value={`${Math.round((totalMinutes / 60) * 10) / 10}h`}
                  label="Estimated study time"
                />
                <StatCard
                  icon={CalendarDays}
                  value={activePlan.durationDays}
                  label="Plan duration (days)"
                />
              </section>

              {/* Strengths / focus */}
              <section className="grid gap-4 md:grid-cols-2">
                <InsightList
                  icon={TrendingUp}
                  title="Your strengths"
                  items={activePlan.strengths}
                  emptyText="Your strengths will become clearer as you complete more interviews and preparation tasks."
                />
                <InsightList
                  icon={Crosshair}
                  title="Focus areas"
                  dark
                  items={activePlan.weakAreas}
                  emptyText="Your plan will help you build skills and identify areas that need additional practice."
                />
              </section>

              {/* Tasks */}
              <section className={cardCls}>
                <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight">
                      Your daily tasks
                    </h2>
                    <p className="mt-1.5 text-sm text-neutral-500">
                      Target role:{" "}
                      <strong className="font-semibold text-[#111111]">
                        {activePlan.targetRole}
                      </strong>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleDeletePlan}
                    disabled={deleting || generating}
                    className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                    {deleting ? "Deleting..." : "Delete plan"}
                  </button>
                </div>

                <div className="-mx-1 mb-6 flex gap-2 overflow-x-auto px-1 pb-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDay("all")}
                    className={chipCls(selectedDay === "all")}
                  >
                    All days
                  </button>

                  {dayNumbers.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setSelectedDay(String(day))}
                      className={chipCls(selectedDay === String(day))}
                    >
                      Day {day}
                    </button>
                  ))}
                </div>

                {filteredTasks.length === 0 ? (
                  <p className="text-sm text-neutral-500">
                    No tasks found for this day.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {filteredTasks.map((task) => (
                      <article
                        key={task._id}
                        className={`flex items-start gap-4 rounded-2xl border p-4 transition sm:p-5 ${
                          task.completed
                            ? "border-neutral-100 bg-neutral-50"
                            : "border-neutral-200 bg-white hover:border-[#ee5a2b]/50 hover:shadow-[0_8px_24px_rgba(238,90,43,0.08)]"
                        }`}
                      >
                        <label className="relative mt-0.5 flex h-6 w-6 shrink-0 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(task.completed)}
                            onChange={() => handleTaskToggle(task)}
                            disabled={updatingTaskId !== null || generating}
                            aria-label={`Mark ${task.title} as ${
                              task.completed ? "incomplete" : "completed"
                            }`}
                            className="peer sr-only"
                          />
                          <span className="flex h-6 w-6 items-center justify-center rounded-lg border-2 border-neutral-300 bg-white text-transparent transition peer-checked:border-[#ee5a2b] peer-checked:bg-[#ee5a2b] peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-[#ee5a2b]/50 peer-disabled:opacity-50">
                            <Check size={14} strokeWidth={3} />
                          </span>
                        </label>

                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span className="rounded-md bg-[#111111] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                              Day {task.dayNumber}
                            </span>

                            <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-semibold text-neutral-700">
                              {task.category || "General"}
                            </span>

                            <span
                              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                DIFFICULTY_STYLES[task.difficulty] ||
                                DIFFICULTY_STYLES.Medium
                              }`}
                            >
                              {task.difficulty || "Medium"}
                            </span>
                          </div>

                          <h3
                            className={`break-words text-base font-semibold leading-snug ${
                              task.completed
                                ? "text-neutral-400 line-through"
                                : "text-[#111111]"
                            }`}
                          >
                            {task.title}
                          </h3>

                          {task.description && (
                            <p className="mt-1.5 text-sm leading-relaxed text-neutral-500">
                              {task.description}
                            </p>
                          )}

                          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-neutral-500">
                            {task.topic && (
                              <span className="inline-flex items-center gap-1.5">
                                <Tag size={12} className="text-[#ee5a2b]" />
                                {task.topic}
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1.5">
                              <Clock3 size={12} className="text-[#ee5a2b]" />
                              {task.estimatedMinutes || 30} minutes
                            </span>
                            {task.completed && (
                              <span className="inline-flex items-center gap-1.5 font-semibold text-[#ee5a2b]">
                                <Check size={12} strokeWidth={3} />
                                Completed
                              </span>
                            )}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}
        </div>

        <footer className="mt-10 text-center text-xs text-neutral-400">
          AI-generated guidance · Your progress is saved to your account
        </footer>
      </div>
    </main>
  );
}

export default PreparationDashboard;
