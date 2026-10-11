import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  ArrowLeft,
  BrainCircuit,
  LayoutDashboard,
  Video,
  ChartNoAxesColumn,
  Sparkles,
  FileText,
  Settings,
  LogOut,
  Download,
  Target,
  Award,
  Zap,
  MessageSquareText,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  CircleHelp,
  ShieldCheck,
  LoaderCircle,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import { toPng } from "html-to-image";

const ORANGE = "#ee5a2b";
const DARK = "#201e1e";
const MUTED = "#77716e";
const COLORS = ["#ee5a2b", "#3785d5", "#13b8a6"];

const clampScore = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.min(10, Math.max(0, number));
};

const formatScore = (value) => clampScore(value).toFixed(1);

const getPerformanceLabel = (score) => {
  if (score >= 8.5) return "Excellent performance";
  if (score >= 7) return "Strong performance";
  if (score >= 5) return "Good progress";
  return "Keep practicing";
};

function Card({ children, className = "" }) {
  return (
    <section
      className={`min-w-0 rounded-2xl border border-black/[0.05] bg-white p-4 shadow-[0_5px_20px_rgba(0,0,0,0.025)] sm:rounded-3xl sm:p-5 ${className}`}
    >
      {children}
    </section>
  );
}

function SectionHeading({ icon: Icon, title, subtitle }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff0e9] text-[#ee5a2b]">
        <Icon size={19} />
      </div>
      <div className="min-w-0">
        <h2 className="text-sm font-extrabold text-[#201e1e] sm:text-base">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-xs leading-5 text-neutral-500">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

function ScoreRing({ score, size = 174 }) {
  const data = [
    { name: "Score", value: clampScore(score) },
    { name: "Remaining", value: 10 - clampScore(score) },
  ];

  return (
    <div
      className="relative mx-auto shrink-0"
      style={{ width: size, height: size }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            cx="50%"
            cy="50%"
            innerRadius="78%"
            outerRadius="94%"
            startAngle={90}
            endAngle={-270}
            stroke="none"
            paddingAngle={1}
          >
            <Cell fill={ORANGE} />
            <Cell fill="#f1efed" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-black tracking-tight text-[#201e1e]">
          {Math.round(clampScore(score) * 10)}%
        </span>
        <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-400">
          Overall score
        </span>
      </div>
    </div>
  );
}

function MetricRow({ label, value, color, icon: Icon }) {
  const score = clampScore(value);

  return (
    <div className="min-w-0">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Icon size={15} style={{ color }} />
          <span className="truncate text-xs font-bold text-neutral-700 sm:text-sm">
            {label}
          </span>
        </div>
        <span className="shrink-0 text-sm font-extrabold tabular-nums">
          {formatScore(score)}
          <span className="ml-1 text-[10px] font-medium text-neutral-400">
            /10
          </span>
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score * 10}%` }}
          transition={{ duration: 0.8 }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function Set3Report({ report }) {
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const [expandedQuestions, setExpandedQuestions] = useState([0]);

  const finalScore = clampScore(report?.finalScore);
  const confidence = clampScore(report?.confidence);
  const communication = clampScore(report?.communication);
  const correctness = clampScore(report?.correctness);

  const questionWiseScores = Array.isArray(report?.questionWiseScores)
    ? report.questionWiseScores
    : [];

  const skills = [
    {
      label: "Confidence",
      value: confidence,
      color: COLORS[0],
      icon: Zap,
    },
    {
      label: "Communication",
      value: communication,
      color: COLORS[1],
      icon: MessageSquareText,
    },
    {
      label: "Correctness",
      value: correctness,
      color: COLORS[2],
      icon: CheckCircle2,
    },
  ];

  const weakestSkill = useMemo(() => {
    return [...skills].sort((a, b) => a.value - b.value)[0];
  }, [confidence, communication, correctness]);

  const strongestSkill = useMemo(() => {
    return [...skills].sort((a, b) => b.value - a.value)[0];
  }, [confidence, communication, correctness]);

  const trendData = useMemo(
    () =>
      questionWiseScores.map((question, index) => ({
        name: `Q${index + 1}`,
        score: clampScore(question?.score),
      })),
    [questionWiseScores],
  );

  const toggleQuestion = (index) => {
    setExpandedQuestions((previous) =>
      previous.includes(index)
        ? previous.filter((item) => item !== index)
        : [...previous, index],
    );
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById("report-content");

    if (!element || downloading) return;

    setDownloading(true);
    setDownloadError("");

    try {
      await document.fonts?.ready;

      const dataUrl = await toPng(element, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#f8f5f3",
      });

      const image = new Image();

      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = () =>
          reject(new Error("Report image could not be generated."));
        image.src = dataUrl;
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const contentWidth = pageWidth - margin * 2;
      const contentHeight = pageHeight - margin * 2;

      const scale = contentWidth / image.width;
      const sourcePageHeight = Math.max(1, Math.floor(contentHeight / scale));

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Could not prepare the PDF canvas.");
      }

      canvas.width = image.width;
      let sourceY = 0;
      let pageNumber = 0;

      while (sourceY < image.height) {
        const sliceHeight = Math.min(sourcePageHeight, image.height - sourceY);

        canvas.height = sliceHeight;
        context.clearRect(0, 0, canvas.width, canvas.height);

        context.drawImage(
          image,
          0,
          sourceY,
          image.width,
          sliceHeight,
          0,
          0,
          image.width,
          sliceHeight,
        );

        if (pageNumber > 0) pdf.addPage();

        pdf.addImage(
          canvas.toDataURL("image/png"),
          "PNG",
          margin,
          margin,
          contentWidth,
          sliceHeight * scale,
          undefined,
          "FAST",
        );

        sourceY += sliceHeight;
        pageNumber += 1;
      }

      pdf.save("InterviewIQ-Performance-Report.pdf");
    } catch (error) {
      console.error("PDF download error:", error);
      setDownloadError("PDF download nahi ho paya. Please dobara try karein.");
    } finally {
      setDownloading(false);
    }
  };

  if (!report) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#f8f5f3] p-5">
        <div className="text-center">
          <LoaderCircle
            size={34}
            className="mx-auto animate-spin text-[#ee5a2b]"
          />
          <h2 className="mt-4 font-bold">Preparing your report...</h2>
          <p className="mt-2 text-sm text-neutral-500">
            Your interview insights will appear here.
          </p>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, action: () => navigate("/") },
    { label: "Interviews", icon: Video, action: () => navigate("/interview") },
    {
      label: "Analysis",
      icon: ChartNoAxesColumn,
      action: () =>
        document
          .getElementById("analytics")
          ?.scrollIntoView({ behavior: "smooth" }),
    },
    {
      label: "Reports",
      icon: FileText,
      active: true,
      action: () =>
        document
          .getElementById("report-content")
          ?.scrollIntoView({ behavior: "smooth" }),
    },
    { label: "Settings", icon: Settings, action: () => navigate("/settings") },
  ];

  return (
    <div className="min-h-screen overflow-x-clip bg-[#f8f5f3] text-[#201e1e] lg:flex">
      {/* Sidebar */}
      <aside className="flex shrink-0 flex-col bg-[#201e1e] px-4 py-4 text-white sm:px-6 lg:sticky lg:top-0 lg:h-screen lg:w-[235px] lg:px-5 lg:py-7">
        <button
          onClick={() => navigate("/")}
          className="mb-5 flex items-center gap-3 px-2 text-left lg:mb-12"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ee5a2b]">
            <BrainCircuit size={22} />
          </span>
          <span className="text-lg font-black tracking-tight">
            Interview<span className="text-[#ff8058]">IQ</span>
          </span>
        </button>

        <p className="hidden px-3 pb-4 text-[10px] font-bold uppercase tracking-[0.18em] text-white/40 lg:block">
          Main menu
        </p>

        <nav className="flex gap-2 overflow-x-auto lg:flex-col">
          {navItems.map(({ label, icon: Icon, active, action }) => (
            <button
              key={label}
              onClick={action}
              className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-semibold transition sm:text-sm ${
                active
                  ? "bg-[#ee5a2b] text-white shadow-lg shadow-orange-950/20"
                  : "text-white/65 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>

        <div className="mt-auto hidden border-t border-white/10 pt-5 lg:block">
          <button
            onClick={() => navigate("/history")}
            className="flex w-full items-center gap-3 rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/15"
          >
            <LogOut size={17} />
            Interview history
          </button>
          <p className="mt-5 px-2 text-[10px] text-white/35">
            InterviewIQ.AI · Practice. Improve. Succeed.
          </p>
        </div>
      </aside>

      {/* Main dashboard */}
      <main className="min-w-0 flex-1 px-3 py-4 sm:px-6 sm:py-7 lg:px-8 xl:px-10">
        <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Go back"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-black/10 bg-white transition hover:bg-neutral-50"
            >
              <ArrowLeft size={18} />
            </button>

            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#ee5a2b]">
                Interview analytics
              </p>
              <h1 className="mt-1 truncate text-lg font-extrabold tracking-tight sm:text-2xl">
                Performance Report
              </h1>
              <p className="mt-1 text-xs text-neutral-500 sm:text-sm">
                Your interview results and personalized insights
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#ee5a2b] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-900/10 transition hover:bg-[#d94b22] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {downloading ? (
              <LoaderCircle size={17} className="animate-spin" />
            ) : (
              <Download size={17} />
            )}
            {downloading ? "Preparing PDF..." : "Download PDF"}
          </button>
        </header>

        {downloadError && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            <AlertCircle size={17} className="mt-0.5 shrink-0" />
            {downloadError}
          </div>
        )}

        {/* Everything inside this element is included in the PDF */}
        <div id="report-content" className="space-y-5 sm:space-y-6">
          {/* Hero */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl bg-white p-5 shadow-[0_5px_25px_rgba(0,0,0,0.025)] sm:rounded-3xl sm:p-7 lg:p-8"
          >
            <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#ee5a2b]/10 blur-3xl" />

            <div className="relative grid grid-cols-1 items-center gap-6 md:grid-cols-[1fr_auto]">
              <div className="min-w-0">
                <div
                  className={`mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[10px] font-bold uppercase tracking-wider ${
                    report?.status === "completed"
                      ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                      : "border-amber-100 bg-amber-50 text-amber-700"
                  }`}
                >
                  {report?.status === "completed" ? (
                    <CheckCircle2 size={14} />
                  ) : (
                    <AlertCircle size={14} />
                  )}
                  {report?.status === "completed"
                    ? "Interview completed"
                    : "Interview incomplete"}
                </div>

                <h2 className="max-w-2xl text-2xl font-black leading-tight tracking-tight sm:text-3xl lg:text-4xl">
                  Every interview is a chance to{" "}
                  <span className="text-[#ee5a2b]">get better.</span>
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-500 sm:text-base">
                  Understand your performance, recognize your strengths, and
                  focus on the skills that need more practice.
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#f8f5f3] px-3 py-2 text-xs font-semibold text-neutral-600">
                    {report?.mode || "Interview"} mode
                  </span>
                  {report?.role && (
                    <span className="max-w-full truncate rounded-full bg-[#f8f5f3] px-3 py-2 text-xs font-semibold text-neutral-600">
                      {report.role}
                    </span>
                  )}
                  <span className="rounded-full bg-[#fff0e9] px-3 py-2 text-xs font-bold text-[#d94b22]">
                    {questionWiseScores.length} questions
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 rounded-2xl border border-black/[0.05] bg-[#faf8f7] p-4 sm:p-5 md:min-w-[225px] md:flex-col">
                <ScoreRing score={finalScore} size={160} />
                <div className="min-w-0 md:text-center">
                  <p className="text-sm font-extrabold">
                    {getPerformanceLabel(finalScore)}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-neutral-500">
                    Final score out of 10
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Score cards */}
          <div id="analytics" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              {
                label: "Confidence",
                value: confidence,
                icon: Zap,
                color: COLORS[0],
                bg: "#fff0e9",
              },
              {
                label: "Communication",
                value: communication,
                icon: MessageSquareText,
                color: COLORS[1],
                bg: "#edf5ff",
              },
              {
                label: "Correctness",
                value: correctness,
                icon: CheckCircle2,
                color: COLORS[2],
                bg: "#e9fbf7",
              },
            ].map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="rounded-2xl border border-black/[0.05] bg-white p-4 shadow-[0_5px_20px_rgba(0,0,0,0.02)] sm:rounded-3xl sm:p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-neutral-500">
                        {item.label}
                      </p>
                      <p className="mt-2 text-3xl font-black tabular-nums">
                        {formatScore(item.value)}
                        <span className="ml-1 text-xs font-semibold text-neutral-400">
                          /10
                        </span>
                      </p>
                    </div>
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-2xl"
                      style={{ backgroundColor: item.bg, color: item.color }}
                    >
                      <Icon size={20} />
                    </div>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-neutral-100">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.value * 10}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Analytics and insights */}
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
            <div className="space-y-5 xl:col-span-7">
              <Card>
                <SectionHeading
                  icon={ChartNoAxesColumn}
                  title="AI score breakdown"
                  subtitle="Your performance across key evaluation areas"
                />

                <div className="grid grid-cols-1 items-center gap-5 sm:grid-cols-2">
                  <div className="relative mx-auto h-56 w-full max-w-[290px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={skills.map((skill) => ({
                            name: skill.label,
                            value: skill.value,
                          }))}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius="57%"
                          outerRadius="83%"
                          paddingAngle={4}
                          stroke="none"
                        >
                          {skills.map((skill) => (
                            <Cell key={skill.label} fill={skill.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [
                            `${formatScore(value)} / 10`,
                            "Score",
                          ]}
                          contentStyle={{
                            borderRadius: 12,
                            border: "1px solid #eee",
                            fontSize: 12,
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-black">
                        {formatScore(finalScore)}
                      </span>
                      <span className="mt-1 text-[9px] font-bold uppercase tracking-widest text-neutral-400">
                        Overall
                      </span>
                    </div>
                  </div>

                  <div className="space-y-5">
                    {skills.map((skill) => (
                      <MetricRow
                        key={skill.label}
                        label={skill.label}
                        value={skill.value}
                        color={skill.color}
                        icon={skill.icon}
                      />
                    ))}
                    <div className="flex items-start gap-2 rounded-xl bg-[#faf8f7] p-3">
                      <Lightbulb
                        size={16}
                        className="mt-0.5 shrink-0 text-[#ee5a2b]"
                      />
                      <p className="text-xs leading-5 text-neutral-600">
                        {weakestSkill.label} is your lowest-scoring area in this
                        report. Focused practice here may help improve your next
                        interview.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <SectionHeading
                  icon={TrendingUp}
                  title="Question score trend"
                  subtitle="See how your scores varied across the interview"
                />

                {trendData.length > 0 ? (
                  <div className="h-60 w-full min-w-0 sm:h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={trendData}
                        margin={{
                          top: 12,
                          right: 8,
                          left: -20,
                          bottom: 0,
                        }}
                      >
                        <defs>
                          <linearGradient
                            id="reportScoreGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor={ORANGE}
                              stopOpacity={0.25}
                            />
                            <stop
                              offset="95%"
                              stopColor={ORANGE}
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="4 4"
                          vertical={false}
                          stroke="#efeeec"
                        />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: MUTED, fontSize: 11 }}
                        />
                        <YAxis
                          domain={[0, 10]}
                          ticks={[0, 2, 4, 6, 8, 10]}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: MUTED, fontSize: 11 }}
                        />
                        <Tooltip
                          formatter={(value) => [
                            `${formatScore(value)} / 10`,
                            "Score",
                          ]}
                          contentStyle={{
                            borderRadius: 12,
                            border: "1px solid #eee",
                            fontSize: 12,
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="score"
                          stroke={ORANGE}
                          strokeWidth={3}
                          fill="url(#reportScoreGradient)"
                          activeDot={{
                            r: 5,
                            fill: ORANGE,
                            stroke: "#fff",
                            strokeWidth: 2,
                          }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="rounded-2xl bg-[#faf8f7] px-4 py-10 text-center">
                    <ChartNoAxesColumn
                      size={26}
                      className="mx-auto text-neutral-300"
                    />
                    <p className="mt-3 text-sm font-bold">
                      No score trend available
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                      Question-wise scores will appear here when available.
                    </p>
                  </div>
                )}
              </Card>
            </div>

            {/* Insights column */}
            <div className="space-y-5 xl:col-span-5">
              <Card>
                <SectionHeading
                  icon={Sparkles}
                  title="AI insights"
                  subtitle="Highlights based on your evaluation scores"
                />

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <CheckCircle2 size={18} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-extrabold">Strongest area</h3>
                      <p className="mt-1 text-xs leading-5 text-neutral-600">
                        {strongestSkill.label} received your highest score at{" "}
                        {formatScore(strongestSkill.value)}/10. Continue
                        building on this strength.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                      <AlertCircle size={18} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-extrabold">
                        Area to improve
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-neutral-600">
                        {weakestSkill.label} scored{" "}
                        {formatScore(weakestSkill.value)}/10. Practice this
                        skill with structured answers and specific examples.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Target size={18} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-extrabold">
                        Actionable recommendation
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-neutral-600">
                        Review question-wise feedback, revise any weak technical
                        concepts, and explain your reasoning aloud during
                        practice.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="bg-[#201e1e] text-white">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ee5a2b]/15 text-[#ff8058]">
                    <Award size={22} />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold">Your next step</h3>
                    <p className="mt-1 text-xs text-white/50">
                      Turn feedback into progress
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-6 text-white/70">
                  Revisit the questions where you scored lower. Practice
                  concise, structured answers and take another mock interview to
                  keep improving.
                </p>

                <button
                  onClick={() => navigate("/interview")}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#ee5a2b] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#d94b22]"
                >
                  <Video size={16} />
                  Practice again
                </button>
              </Card>

              <Card>
                <div className="flex items-start gap-3">
                  <ShieldCheck size={21} className="shrink-0 text-[#ee5a2b]" />
                  <div>
                    <h3 className="text-sm font-extrabold">
                      Your interview report
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-neutral-500">
                      This report summarizes the scores and feedback returned by
                      your interview evaluation.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Question breakdown */}
          <section>
            <div className="mb-4 flex items-center justify-between gap-3">
              <SectionHeading
                icon={FileText}
                title="Question breakdown"
                subtitle="Review every answer and its feedback"
              />
              <span className="shrink-0 rounded-full bg-[#fff0e9] px-3 py-2 text-[10px] font-extrabold text-[#d94b22]">
                {questionWiseScores.length} QUESTIONS
              </span>
            </div>

            {questionWiseScores.length > 0 ? (
              <div className="space-y-3">
                {questionWiseScores.map((question, index) => {
                  const score = clampScore(question?.score);
                  const isExpanded = expandedQuestions.includes(index);

                  return (
                    <motion.article
                      key={`${index}-${question?.question || "question"}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(index * 0.05, 0.25) }}
                      className="overflow-hidden rounded-2xl border border-black/[0.05] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.02)] sm:rounded-3xl"
                    >
                      <button
                        type="button"
                        onClick={() => toggleQuestion(index)}
                        aria-expanded={isExpanded}
                        className="flex w-full items-center gap-3 p-4 text-left sm:gap-4 sm:p-5"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#201e1e] text-xs font-extrabold text-white">
                          {String(index + 1).padStart(2, "0")}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[#ee5a2b]">
                            Question {index + 1}
                          </p>
                          <h3 className="mt-1 break-words text-sm font-bold leading-6 text-[#201e1e]">
                            {question?.question || "Interview question"}
                          </h3>
                        </div>

                        <div className="shrink-0 text-center">
                          <p className="text-lg font-black tabular-nums">
                            {formatScore(score)}
                          </p>
                          <p className="text-[9px] font-bold text-neutral-400">
                            OUT OF 10
                          </p>
                        </div>

                        {isExpanded ? (
                          <ChevronUp
                            size={18}
                            className="shrink-0 text-neutral-400"
                          />
                        ) : (
                          <ChevronDown
                            size={18}
                            className="shrink-0 text-neutral-400"
                          />
                        )}
                      </button>

                      <div className="px-4 pb-4 sm:px-5 sm:pb-5">
                        <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
                          <div
                            className="h-full rounded-full bg-[#ee5a2b]"
                            style={{ width: `${score * 10}%` }}
                          />
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="grid grid-cols-1 gap-3 border-t border-black/[0.05] bg-[#fcfaf9] p-4 sm:grid-cols-2 sm:p-5">
                          <div className="min-w-0 rounded-xl border border-[#ee5a2b]/10 bg-white p-4 sm:col-span-2">
                            <div className="mb-2 flex items-center gap-2">
                              <MessageSquareText
                                size={15}
                                className="text-[#ee5a2b]"
                              />
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#d94b22]">
                                AI feedback
                              </span>
                            </div>
                            <p className="break-words whitespace-pre-wrap text-sm leading-6 text-neutral-700">
                              {question?.feedback ||
                                "No detailed feedback is available for this answer."}
                            </p>
                          </div>

                          {question?.answer && (
                            <div className="min-w-0 rounded-xl border border-black/[0.05] bg-white p-4 sm:col-span-2">
                              <div className="mb-2 flex items-center gap-2">
                                <CircleHelp
                                  size={15}
                                  className="text-neutral-500"
                                />
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500">
                                  Your answer
                                </span>
                              </div>
                              <p className="break-words whitespace-pre-wrap text-sm leading-6 text-neutral-700">
                                {question.answer}
                              </p>
                            </div>
                          )}

                          <div className="grid grid-cols-1 gap-3 sm:col-span-2 sm:grid-cols-3">
                            {skills.map((skill) => (
                              <div
                                key={skill.label}
                                className="rounded-xl border border-black/[0.05] bg-white p-3"
                              >
                                <p className="text-[10px] font-bold text-neutral-500">
                                  {skill.label}
                                </p>
                                <p className="mt-1 text-xl font-black">
                                  {formatScore(
                                    question?.[skill.label.toLowerCase()],
                                  )}
                                  <span className="ml-1 text-[10px] font-semibold text-neutral-400">
                                    /10
                                  </span>
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.article>
                  );
                })}
              </div>
            ) : (
              <Card>
                <div className="py-8 text-center">
                  <FileText size={28} className="mx-auto text-neutral-300" />
                  <h3 className="mt-3 text-sm font-bold">
                    Question details unavailable
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-neutral-500">
                    The server did not return question-wise scores for this
                    interview.
                  </p>
                </div>
              </Card>
            )}
          </section>

          <footer className="border-t border-black/[0.06] pt-5 text-center">
            <p className="text-xs text-neutral-400">
              InterviewIQ.AI · Make every interview count.
            </p>
          </footer>
        </div>

        <div className="mt-5 flex justify-center lg:hidden">
          <button
            onClick={() => navigate("/history")}
            className="flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-3 text-xs font-bold text-neutral-700"
          >
            <ArrowLeft size={15} />
            Interview history
          </button>
        </div>
      </main>
    </div>
  );
}

export default Set3Report;
