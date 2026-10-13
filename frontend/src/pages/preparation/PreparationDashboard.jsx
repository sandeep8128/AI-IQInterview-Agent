import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  ArrowRight,
  Binary,
  BookOpen,
  Brain,
  Briefcase,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Cloud,
  Code2,
  Cog,
  Cpu,
  Crosshair,
  ExternalLink,
  Globe,
  Hammer,
  Loader2,
  Mic,
  Play,
  RefreshCw,
  Rocket,
  Route,
  ShieldCheck,
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

/* ================================================================== */
/* Career roadmap: content                                             */
/* ================================================================== */

/* ------------------------------------------------------------------ */
/* Career roadmap content                                              */
/* Edit freely: every field has 4 years (1st, 2nd, 3rd, Final).        */
/* Each year: focus (one line) + learn / build / interview lists.      */
/* ------------------------------------------------------------------ */

const year = (focus, learn, build, interview) => ({
  focus,
  learn,
  build,
  interview,
});

/* Habits that apply to every field, by year */
const YEAR_COMMON = [
  {
    label: "1st Year",
    theme: "Foundation",
    habits: [
      "Build a daily study habit (even 1–2 focused hours)",
      "Join one tech or subject club and attend its events",
      "Create a professional email, LinkedIn and (if relevant) GitHub profile",
    ],
  },
  {
    label: "2nd Year",
    theme: "Skills",
    habits: [
      "Write a simple one-page resume and update it every month",
      "Take part in 1–2 hackathons, contests or competitions",
      "Find a senior or mentor and ask for honest feedback",
    ],
  },
  {
    label: "3rd Year",
    theme: "Proof of work",
    habits: [
      "Start applying for internships early in the year",
      "Polish your resume with results and numbers, and update LinkedIn",
      "Do a mock interview with a friend or senior every two weeks",
    ],
  },
  {
    label: "Final Year",
    theme: "Placement",
    habits: [
      "Keep a tracker of companies, deadlines and application status",
      "Practise weekly mock interviews, including the HR round",
      "Prepare clear answers for “Tell me about yourself”, your projects, strengths and weaknesses",
    ],
  },
];

/* Plain tips shown under every roadmap */
const OFFER_TIPS = [
  "Build depth, not just breadth: one strong skill with proof beats ten half-learned tools.",
  "Start interviewing early. More attempts mean more offers to compare.",
  "Show results: projects with live links, users or measurable outcomes stand out on a resume.",
  "Practise explaining your work clearly. Communication often decides close interviews.",
];

const CAREER_FIELDS = [
  /* ------------------------- 1. Full stack ------------------------- */
  {
    id: "fullstack",
    name: "Full Stack Web Development",
    short: "Full Stack",
    icon: "code",
    planRole: "Full Stack Developer",
    tagline: "Build complete web products, from the interface to the database.",
    roles: ["Frontend Developer", "Backend Developer", "Full Stack Developer"],
    years: [
      year(
        "Learn to code and think logically.",
        [
          "One beginner language: Python, C or JavaScript (variables, loops, functions)",
          "HTML, CSS and responsive layouts",
          "Git and GitHub basics",
          "Problem-solving basics with easy practice questions",
        ],
        ["A personal portfolio website", "A calculator or to-do app"],
        [
          "Explain how a browser loads a website",
          "Solve easy array and string problems without help",
        ],
      ),
      year(
        "Build real apps with a full stack.",
        [
          "Advanced JavaScript: async/await, closures, modules",
          "React: components, state, hooks and routing",
          "Node.js, Express and REST APIs",
          "SQL and MongoDB basics",
          "Data structures: arrays, linked lists, stacks, queues, trees",
        ],
        [
          "A full stack CRUD app with login and authentication",
          "A project that uses a third-party API",
        ],
        [
          "JavaScript and React fundamentals questions",
          "Solve 150+ easy to medium DSA problems",
        ],
      ),
      year(
        "Go deeper, ship projects, land an internship.",
        [
          "Authentication (JWT), caching, REST vs GraphQL",
          "Database design: relations, indexes, transactions",
          "Testing and deployment: Docker basics, CI/CD, cloud hosting",
          "DSA: recursion, trees, graphs, dynamic programming basics",
          "CS fundamentals: OS, DBMS, networks, OOP",
        ],
        [
          "A deployed project with real users or real data",
          "An open-source or team project contribution",
        ],
        [
          "Practise 250+ DSA problems, including medium level",
          "Explain your project architecture and trade-offs",
        ],
      ),
      year(
        "Turn your skills into offers.",
        [
          "Revise OS, DBMS, networks and OOP",
          "System design basics: load balancers, caching, scaling databases",
          "Advanced DSA patterns: sliding window, DP, graphs",
          "Question patterns of your target companies",
        ],
        [
          "Polish your best 2–3 projects with README, demo and live link",
          "One capstone with measurable results (users, speed, scale)",
        ],
        [
          "Weekly mock interviews: DSA, projects and HR",
          "Solve company-tagged problems for your target list",
        ],
      ),
    ],
  },

  /* ------------------------- 2. DSA / SDE ------------------------- */
  {
    id: "sde",
    name: "Software Engineer (DSA-focused)",
    short: "SDE / DSA",
    icon: "binary",
    planRole: "Software Engineer (DSA)",
    tagline:
      "Strong problem solving for product-based and high-growth companies.",
    roles: ["Software Engineer (SDE)", "Backend Engineer", "Platform Engineer"],
    years: [
      year(
        "A strong coding and problem-solving base.",
        [
          "One language in depth: C++, Java or Python",
          "Time and space complexity",
          "Arrays, strings, hashing and basic recursion",
          "Basic maths and bit manipulation",
        ],
        [
          "Solve 150 problems on LeetCode, GeeksforGeeks or similar",
          "A small command-line project using OOP",
        ],
        [
          "Explain brute force vs an optimised solution",
          "Dry-run your code by hand",
        ],
      ),
      year(
        "Learn the core patterns.",
        [
          "Linked lists, stacks, queues, trees and heaps",
          "Sorting and binary search patterns",
          "Two pointers and sliding window",
          "OOP, basic DBMS and OS concepts",
        ],
        ["Reach 300+ problems in total", "Join weekly coding contests"],
        [
          "Pattern-recognition drills: name the pattern before coding",
          "Explain every solution out loud",
        ],
      ),
      year(
        "Go deep and get real experience.",
        [
          "Graphs: BFS, DFS, Dijkstra; DP and backtracking",
          "Low-level design and design patterns",
          "OS, DBMS and computer networks revision",
          "Introduction to system design",
        ],
        [
          "Reach 500+ problems and one high-quality project",
          "An internship at a startup or product company",
        ],
        [
          "Timed 45-minute mock coding rounds",
          "Low-level design questions (parking lot, library system)",
        ],
      ),
      year(
        "Interview at your best.",
        [
          "Advanced DP, tries and segment trees where needed",
          "System design: scaling, caching, queues, databases",
          "Past question patterns of your target companies",
          "Behavioural stories using the STAR method",
        ],
        [
          "Keep a daily problem-solving streak",
          "A resume with 2 strong projects and internship results",
        ],
        [
          "Weekly mock interviews with peers or platforms",
          "Revise your top 100 problems",
        ],
      ),
    ],
  },

  /* ------------------------- 3. Data & AI ------------------------- */
  {
    id: "dataai",
    name: "Data Science and AI/ML",
    short: "Data & AI",
    icon: "brain",
    planRole: "Data Scientist",
    tagline: "Turn data into decisions and build intelligent systems.",
    roles: ["Data Analyst", "Data Scientist", "ML Engineer"],
    years: [
      year(
        "Python and maths foundation.",
        [
          "Python, NumPy and Pandas basics",
          "Maths: linear algebra, probability and statistics basics",
          "SQL basics",
          "Git, GitHub and Jupyter notebooks",
        ],
        [
          "Analyse a public dataset and share your findings",
          "A simple dashboard in Excel, Power BI or Streamlit",
        ],
        [
          "Explain mean, median, variance and distributions",
          "Write basic SQL queries",
        ],
      ),
      year(
        "Learn machine learning properly.",
        [
          "Statistics for ML and hypothesis testing",
          "Regression, classification, trees and evaluation metrics",
          "Data cleaning and visualisation (Matplotlib, Seaborn)",
          "SQL joins and window functions",
          "DSA basics",
        ],
        [
          "An end-to-end ML project: data, model and report",
          "A starter Kaggle competition",
        ],
        [
          "Explain bias vs variance and overfitting",
          "Explain precision, recall and ROC-AUC",
        ],
      ),
      year(
        "Specialise and deploy.",
        [
          "Deep learning basics with PyTorch or TensorFlow",
          "A specialisation: NLP or computer vision",
          "MLOps basics: FastAPI, Docker, model deployment",
          "Feature engineering and model tuning",
          "LLM basics: prompting and retrieval (RAG)",
        ],
        [
          "A deployed ML or AI app with a public demo",
          "An internship or a research project with a mentor",
        ],
        [
          "Deep-dive your project: data, model, results",
          "Practise ML case-study questions",
        ],
      ),
      year(
        "Get interview ready.",
        [
          "Revise ML theory and statistics",
          "SQL and Python coding interview practice",
          "ML system design: pipelines and monitoring",
          "Domain knowledge of your target industry",
        ],
        [
          "A portfolio with 2–3 strong projects and short write-ups",
          "Publish notebooks or a blog on GitHub",
        ],
        [
          "Mock rounds: ML, SQL and business cases",
          "Practise explaining models to a non-technical person",
        ],
      ),
    ],
  },

  /* ------------------------- 4. Cloud & DevOps ------------------------- */
  {
    id: "devops",
    name: "Cloud and DevOps",
    short: "Cloud / DevOps",
    icon: "cloud",
    planRole: "DevOps Engineer",
    tagline: "Run, automate and scale software in the cloud.",
    roles: ["DevOps Engineer", "Cloud Engineer", "Site Reliability Engineer"],
    years: [
      year(
        "Linux, scripting and networking basics.",
        [
          "Linux commands and shell scripting",
          "Python programming basics",
          "Networking: IP, DNS, HTTP",
          "Git and GitHub",
        ],
        [
          "Automate daily tasks with bash or Python scripts",
          "Set up a small Linux server in a virtual machine",
        ],
        [
          "Explain what happens when you type a URL",
          "Answer basic Linux command questions",
        ],
      ),
      year(
        "Containers and cloud basics.",
        [
          "Operating systems and computer networks in depth",
          "Docker and containers",
          "Core cloud services (AWS, Azure or GCP): compute, storage, networking",
          "Databases and a simple web app",
        ],
        [
          "Containerise a web app with Docker",
          "Host a site on a cloud virtual machine",
        ],
        [
          "Explain Docker images, containers and volumes",
          "Explain compute, storage and networking in the cloud",
        ],
      ),
      year(
        "Automation and orchestration.",
        [
          "CI/CD with GitHub Actions or Jenkins",
          "Kubernetes basics",
          "Infrastructure as Code with Terraform",
          "Monitoring and logging (Prometheus, Grafana)",
          "A cloud certification at foundation or associate level",
        ],
        [
          "A full CI/CD pipeline that deploys an app",
          "A cloud setup managed with Terraform",
        ],
        [
          "Explain your pipeline end to end",
          "Scenario: debug a failing deployment",
        ],
      ),
      year(
        "Production-ready skills.",
        [
          "Advanced Kubernetes and cloud architecture",
          "Security basics: IAM, secrets, network policies",
          "Reliability: SRE concepts and incident handling",
          "Revise OS, networks and scripting",
        ],
        [
          "A production-style capstone with monitoring and alerts",
          "Write clear documentation and runbooks",
        ],
        [
          "Mock scenario and troubleshooting rounds",
          "Revise for your certification exam",
        ],
      ),
    ],
  },

  /* ------------------------- 5. Cyber security ------------------------- */
  {
    id: "cyber",
    name: "Cyber Security",
    short: "Cyber Security",
    icon: "shield",
    planRole: "Cybersecurity Analyst",
    tagline: "Protect systems, find weaknesses and respond to threats.",
    roles: ["Security Analyst", "Penetration Tester", "SOC Analyst"],
    years: [
      year(
        "Networking, Linux and security basics.",
        [
          "Networking basics and Linux",
          "Python programming basics",
          "Security fundamentals: the CIA triad and common threats",
          "A safe practice lab with virtual machines",
        ],
        [
          "A simple password-strength checker or port-scan script",
          "A home lab with an intentionally vulnerable machine",
        ],
        [
          "Explain phishing, XSS and SQL injection",
          "Explain encryption vs hashing",
        ],
      ),
      year(
        "Web security and hands-on practice.",
        [
          "Web security: the OWASP Top 10",
          "Cryptography basics",
          "Operating system security (Windows and Linux)",
          "Wireshark and Nmap basics",
        ],
        [
          "Solve beginner CTF challenges",
          "Write up vulnerabilities you find in your lab",
        ],
        [
          "Explain the OWASP Top 10 in your own words",
          "Describe how network scanning works",
        ],
      ),
      year(
        "Offensive and defensive skills.",
        [
          "Penetration testing process and ethical hacking",
          "SIEM and SOC basics",
          "Cloud security basics",
          "A starter certification (for example Security+ or eJPT)",
        ],
        [
          "Regular practice on TryHackMe or HackTheBox",
          "Legal bug-bounty practice on authorised programmes",
        ],
        [
          "Explain a vulnerability you found and how to fix it",
          "Incident-response scenario questions",
        ],
      ),
      year(
        "Specialise and get hired.",
        [
          "Advanced pentesting or SOC analyst skills",
          "Malware analysis and forensics basics",
          "Compliance basics: ISO 27001 and data-protection rules",
          "Revise networks, operating systems and cryptography",
        ],
        [
          "A portfolio of write-ups and CTF results",
          "One capstone security assessment report",
        ],
        [
          "Mock technical and scenario rounds",
          "Prepare for your certification exam",
        ],
      ),
    ],
  },

  /* ------------------------- 6. Electronics & Embedded ------------------------- */
  {
    id: "embedded",
    name: "Electronics and Embedded (ECE / EEE)",
    short: "Embedded",
    icon: "cpu",
    planRole: "Embedded Systems Engineer",
    tagline: "Design circuits, firmware and smart hardware.",
    roles: ["Embedded Engineer", "VLSI Engineer", "IoT Engineer"],
    years: [
      year(
        "Electronics and C fundamentals.",
        [
          "Basic electronics: Ohm's law, diodes, transistors",
          "C programming",
          "Engineering maths: calculus and linear algebra",
          "Circuit simulation (Tinkercad or LTspice)",
        ],
        [
          "An LED or sensor project with Arduino",
          "A simple power-supply circuit",
        ],
        ["Explain basic circuit laws", "Write simple C programs"],
      ),
      year(
        "Digital, analog and microcontrollers.",
        [
          "Digital electronics and logic design",
          "Analog circuits and op-amps",
          "Microcontrollers (8051, ARM, STM32) and embedded C",
          "Signals and systems",
        ],
        ["A sensor-based IoT project", "A basic Verilog or VHDL project"],
        [
          "Number systems, flip-flops and K-maps",
          "Embedded C: pointers, volatile and interrupts",
        ],
      ),
      year(
        "Pick a track and build hardware.",
        [
          "RTOS and protocols: UART, I2C, SPI, CAN",
          "Your track: VLSI with Verilog, or embedded Linux",
          "PCB design basics (KiCad)",
          "Data structures in C or C++",
        ],
        [
          "A mini hardware product with your own PCB",
          "An internship in embedded, VLSI or IoT",
        ],
        [
          "Protocol and RTOS questions",
          "Explain your project's hardware and firmware",
        ],
      ),
      year(
        "Core strength plus placement skills.",
        [
          "Revise digital, analog and microcontroller topics",
          "Domain prep for your target: VLSI, embedded or telecom",
          "Optional: GATE-style core revision",
          "Aptitude and basic coding for service and product firms",
        ],
        [
          "A final-year project with a working demo",
          "A portfolio with schematics, code and photos",
        ],
        ["Core technical mock interviews", "Aptitude and HR practice"],
      ),
    ],
  },

  /* ------------------------- 7. Mechanical ------------------------- */
  {
    id: "mechanical",
    name: "Mechanical Engineering",
    short: "Mechanical",
    icon: "cog",
    planRole: "Mechanical Design Engineer",
    tagline: "Design, analyse and manufacture machines and systems.",
    roles: [
      "Design Engineer",
      "Manufacturing Engineer",
      "Automotive / EV Engineer",
    ],
    years: [
      year(
        "Core engineering basics.",
        [
          "Engineering mechanics and thermodynamics basics",
          "Engineering drawing and CAD (AutoCAD, SolidWorks)",
          "Workshop practice",
          "Maths and physics foundations",
        ],
        ["Simple 3D CAD models", "A basic mechanism or working model"],
        [
          "Explain stress, strain and the laws of thermodynamics",
          "Read a simple engineering drawing",
        ],
      ),
      year(
        "Core subjects and design tools.",
        [
          "Strength of materials and fluid mechanics",
          "Thermodynamics and heat transfer",
          "Manufacturing processes",
          "CAD (SolidWorks or CATIA) and FEA basics",
        ],
        [
          "Design and simulate a component",
          "Use Python or MATLAB for engineering calculations",
        ],
        [
          "Core fundamentals: strength of materials, fluid mechanics",
          "Materials and manufacturing basics",
        ],
      ),
      year(
        "Specialise and learn industry tools.",
        [
          "Machine design and dynamics of machinery",
          "CAE: ANSYS or Abaqus, and CFD basics",
          "GD&T and PLM basics",
          "A specialisation: design, thermal, manufacturing or EV",
        ],
        [
          "An industry internship (plant or design office)",
          "A team project such as SAE, Baja or Formula",
        ],
        [
          "Explain your design choices and calculations",
          "GD&T and core domain questions",
        ],
      ),
      year(
        "Placement and career choice.",
        [
          "Revise core subjects for placements",
          "Tools for your target role: CAD/CAE, Lean, Six Sigma",
          "Optional: GATE or higher-studies preparation",
          "Aptitude and communication",
        ],
        [
          "A capstone project with simulation and test data",
          "A portfolio of CAD models and reports",
        ],
        [
          "Core technical mock rounds",
          "Company prep for automotive, manufacturing or energy roles",
        ],
      ),
    ],
  },

  /* ------------------------- 8. Civil ------------------------- */
  {
    id: "civil",
    name: "Civil Engineering",
    short: "Civil",
    icon: "building",
    planRole: "Civil Engineer",
    tagline: "Plan, design and build infrastructure and buildings.",
    roles: ["Site Engineer", "Structural Engineer", "Project Planner"],
    years: [
      year(
        "Basics of drawing, materials and surveying.",
        [
          "Engineering mechanics, drawing and surveying basics",
          "AutoCAD fundamentals",
          "Building materials and construction basics",
          "Maths and physics foundations",
        ],
        ["Draw a floor plan in AutoCAD", "Write a site-visit report"],
        [
          "Explain types of cement and basic concrete properties",
          "Read a plan drawing",
        ],
      ),
      year(
        "Structures, fluids and surveying.",
        [
          "Strength of materials and structural analysis",
          "Fluid mechanics and hydrology",
          "Surveying with a total station and GIS basics",
          "Concrete technology",
        ],
        ["Survey a small area and prepare a map", "A mix-design lab report"],
        [
          "Bending moment and shear force questions",
          "Concrete properties and tests",
        ],
      ),
      year(
        "Design tools and site experience.",
        [
          "RCC and steel design with IS codes",
          "STAAD.Pro or ETABS, and Revit/BIM basics",
          "Geotechnical and transportation engineering",
          "Estimation, costing and project management",
        ],
        [
          "Design a small building in STAAD or ETABS",
          "An internship at a construction site or consultancy",
        ],
        [
          "Design basics and IS code questions",
          "Site-execution scenario questions",
        ],
      ),
      year(
        "Placement and planning tools.",
        [
          "Revise structures, geotechnical and construction subjects",
          "BIM and planning tools: Primavera or MS Project",
          "Optional: GATE or government exam preparation",
          "Site management and safety standards",
        ],
        [
          "A final-year design project with drawings and a cost estimate",
          "A portfolio of drawings, BIM models and reports",
        ],
        ["Core civil mock interviews", "Site and project-management scenarios"],
      ),
    ],
  },

  /* ------------------------- 9. Management & Business ------------------------- */
  {
    id: "business",
    name: "Management and Business",
    short: "Management",
    icon: "briefcase",
    planRole: "Business Analyst",
    tagline: "Analyse businesses, lead teams and make better decisions.",
    roles: [
      "Business Analyst",
      "Management Trainee",
      "Marketing or Finance roles",
    ],
    years: [
      year(
        "Business basics and communication.",
        [
          "Economics, accounting and marketing basics",
          "Excel fundamentals",
          "English communication and presentation skills",
          "Read business news every day",
        ],
        [
          "Analyse a company's annual report",
          "Give a presentation in class or a club",
        ],
        [
          "Explain demand and supply, profit vs revenue",
          "A clear one-minute self-introduction in English",
        ],
      ),
      year(
        "Data and business skills.",
        [
          "Advanced Excel: pivots and lookups",
          "SQL or Power BI basics",
          "Financial accounting and statistics",
          "Marketing and operations basics, plus group discussion practice",
        ],
        [
          "A small business case or startup plan",
          "An Excel dashboard on real data",
        ],
        [
          "Basic finance and marketing questions",
          "Practise group discussion topics",
        ],
      ),
      year(
        "Specialise and gain experience.",
        [
          "A specialisation: finance, marketing, HR or analytics",
          "Case-study frameworks",
          "Relevant certifications (Excel, Power BI, analytics)",
          "Internship preparation and networking",
        ],
        [
          "An internship project with a measurable result",
          "A case-study or business-plan competition",
        ],
        ["Case interview practice", "Resume bullets that include numbers"],
      ),
      year(
        "Placement and higher studies.",
        [
          "Aptitude, group discussion and personal interview prep",
          "Current affairs and industry research",
          "Entrance exam preparation if you plan an MBA",
          "Negotiation and communication skills",
        ],
        [
          "A portfolio of case studies and internship outcomes",
          "A LinkedIn profile that shows your insights",
        ],
        [
          "Weekly mock group discussions and personal interviews",
          "Research the company and role for each application",
        ],
      ),
    ],
  },
];

/* ================================================================== */
/* Career roadmap: UI                                                  */
/* ================================================================== */

const STORAGE_KEY = "careerRoadmapState_v1";

const ICONS = {
  code: Code2,
  binary: Binary,
  brain: Brain,
  cloud: Cloud,
  shield: ShieldCheck,
  cpu: Cpu,
  cog: Cog,
  building: Building2,
  briefcase: Briefcase,
};

const SECTIONS = [
  { key: "learn", title: "Learn", icon: BookOpen },
  { key: "build", title: "Build", icon: Hammer },
  { key: "interview", title: "Interview prep", icon: Mic },
  { key: "habits", title: "Career habits", icon: Rocket },
];

const defaultState = () => ({
  fieldId: CAREER_FIELDS[0].id,
  currentYear: 0,
  done: {},
});

/* Progress is saved in this browser only. Everything is wrapped in
   try/catch because storage can be blocked (private mode, etc.). */
const loadState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);

    return {
      fieldId: CAREER_FIELDS.some((f) => f.id === parsed?.fieldId)
        ? parsed.fieldId
        : CAREER_FIELDS[0].id,
      currentYear:
        Number.isInteger(parsed?.currentYear) &&
        parsed.currentYear >= 0 &&
        parsed.currentYear <= 3
          ? parsed.currentYear
          : 0,
      done: parsed?.done && typeof parsed.done === "object" ? parsed.done : {},
    };
  } catch {
    return defaultState();
  }
};

function RingProgress({ value }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div
      role="progressbar"
      aria-label="Overall roadmap progress"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      className="relative h-32 w-32 shrink-0"
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
        <span className="text-2xl font-semibold tracking-tight text-white">
          {value}%
        </span>
        <span className="text-[10px] uppercase tracking-widest text-white/50">
          done
        </span>
      </div>
    </div>
  );
}

function CheckItem({ checked, onChange, label }) {
  return (
    <label className="group flex cursor-pointer items-start gap-3 py-1.5">
      <span className="relative mt-0.5 flex h-5 w-5 shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="peer sr-only"
        />
        <span className="flex h-5 w-5 items-center justify-center rounded-md border-2 border-neutral-300 bg-white text-transparent transition peer-checked:border-[#ee5a2b] peer-checked:bg-[#ee5a2b] peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-[#ee5a2b]/50 group-hover:border-neutral-400">
          <Check size={12} strokeWidth={3} />
        </span>
      </span>
      <span
        className={`text-sm leading-relaxed transition ${
          checked ? "text-neutral-400 line-through" : "text-neutral-700"
        }`}
      >
        {label}
      </span>
    </label>
  );
}

function CareerRoadmap({ onUsePlan }) {
  const [state, setState] = useState(loadState);
  const [openYear, setOpenYear] = useState(() => loadState().currentYear);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable: progress simply won't persist */
    }
  }, [state]);

  const field = useMemo(
    () =>
      CAREER_FIELDS.find((item) => item.id === state.fieldId) ||
      CAREER_FIELDS[0],
    [state.fieldId],
  );

  /* Build each year: field content + shared habits, with ids for tracking */
  const years = useMemo(
    () =>
      field.years.map((yearData, yearIndex) => {
        const common = YEAR_COMMON[yearIndex];
        const content = { ...yearData, habits: common.habits };

        const sections = SECTIONS.map((section) => ({
          ...section,
          items: content[section.key].map((label, itemIndex) => ({
            label,
            id: `${field.id}:${yearIndex}:${section.key}:${itemIndex}`,
          })),
        }));

        return {
          index: yearIndex,
          label: common.label,
          theme: common.theme,
          focus: yearData.focus,
          sections,
          ids: sections.flatMap((section) =>
            section.items.map((item) => item.id),
          ),
        };
      }),
    [field],
  );

  const countDone = (ids) => ids.filter((id) => state.done[id]).length;

  const allIds = years.flatMap((item) => item.ids);
  const overallPercent = allIds.length
    ? Math.round((countDone(allIds) / allIds.length) * 100)
    : 0;

  const selectField = (fieldId) => {
    setState((previous) => ({ ...previous, fieldId }));
  };

  const selectYear = (yearIndex) => {
    setState((previous) => ({ ...previous, currentYear: yearIndex }));
    setOpenYear(yearIndex);
  };

  const toggleItem = (id) => {
    setState((previous) => {
      const done = { ...previous.done };
      if (done[id]) delete done[id];
      else done[id] = true;
      return { ...previous, done };
    });
  };

  const chipCls = (active) =>
    `rounded-full px-4 py-2 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ee5a2b] ${
      active
        ? "bg-[#111111] text-white shadow-md"
        : "border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400"
    }`;

  return (
    <div className="space-y-6">
      {/* ---------------- Field + year picker (overlaps hero) ---------------- */}
      <section className={cardCls} aria-labelledby="roadmap-title">
        <h2 id="roadmap-title" className="text-xl font-semibold tracking-tight">
          Quick guide by field
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-neutral-500">
          Get a year-by-year plan, from the 1st year to the final year, for the
          career you want.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          {CAREER_FIELDS.map((item) => {
            const Icon = ICONS[item.icon] || Code2;
            const active = item.id === field.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => selectField(item.id)}
                aria-pressed={active}
                className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-left text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ee5a2b] ${
                  active
                    ? "border-[#111111] bg-[#111111] text-white shadow-md"
                    : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400"
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    active
                      ? "bg-white/10 text-[#ee5a2b]"
                      : "bg-neutral-100 text-[#ee5a2b]"
                  }`}
                >
                  <Icon size={16} />
                </span>
                {item.short}
              </button>
            );
          })}
        </div>

        <div className="mt-6">
          <p className="mb-2 text-xs font-semibold text-neutral-700">
            Which year are you in?
          </p>
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Current year"
          >
            {YEAR_COMMON.map((item, index) => (
              <button
                key={item.label}
                type="button"
                onClick={() => selectYear(index)}
                aria-pressed={state.currentYear === index}
                className={chipCls(state.currentYear === index)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Overview ---------------- */}
      <section className="relative overflow-hidden rounded-2xl bg-[#111111] p-6 text-white shadow-[0_20px_50px_rgba(0,0,0,0.25)] sm:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-[#ee5a2b] opacity-30 blur-[90px]"
        />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">
              Your roadmap
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              {field.name}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/60">
              {field.tagline}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {field.roles.map((role) => (
                <span
                  key={role}
                  className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium text-white/80"
                >
                  {role}
                </span>
              ))}
            </div>

            <button
              type="button"
              onClick={() => onUsePlan?.(field.planRole)}
              className="group mt-6 inline-flex items-center gap-4 rounded-full bg-white py-1.5 pl-5 pr-1.5 text-sm font-semibold text-[#111111] transition hover:opacity-90"
            >
              Create an AI study plan for this
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ee5a2b] text-white">
                <ArrowRight
                  size={16}
                  className="transition group-hover:translate-x-0.5"
                />
              </span>
            </button>
          </div>

          <RingProgress value={overallPercent} />
        </div>
      </section>

      {/* ---------------- Timeline ---------------- */}
      <ol className="relative space-y-5">
        {years.map((yearItem, index) => {
          const total = yearItem.ids.length;
          const done = countDone(yearItem.ids);
          const percent = total ? Math.round((done / total) * 100) : 0;
          const complete = total > 0 && done === total;
          const isCurrent = state.currentYear === index;
          const isOpen = openYear === index;
          const panelId = `roadmap-year-${index}`;

          return (
            <li key={yearItem.label} className="relative pl-14 sm:pl-[72px]">
              {index < years.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute left-5 top-12 -bottom-5 w-px -translate-x-1/2 bg-neutral-300 sm:left-7"
                />
              )}

              <span
                className={`absolute left-0 top-1 flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold sm:h-14 sm:w-14 sm:text-base ${
                  complete
                    ? "bg-[#111111] text-white"
                    : isCurrent
                      ? "bg-[#ee5a2b] text-white shadow-[0_8px_20px_rgba(238,90,43,0.35)]"
                      : "border-2 border-neutral-300 bg-white text-neutral-500"
                }`}
              >
                {complete ? <Check size={18} strokeWidth={3} /> : index + 1}
              </span>

              <div
                className={`${cardCls} ${
                  isCurrent ? "ring-2 ring-[#ee5a2b]/40" : ""
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenYear(isOpen ? -1 : index)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className="flex w-full items-start justify-between gap-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ee5a2b]"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold tracking-tight">
                        {yearItem.label}
                      </h3>
                      <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-semibold text-neutral-600">
                        {yearItem.theme}
                      </span>
                      {isCurrent && (
                        <span className="rounded-full bg-[#ee5a2b] px-2.5 py-1 text-[11px] font-bold text-white">
                          You are here
                        </span>
                      )}
                      {complete && (
                        <span className="rounded-full bg-[#111111] px-2.5 py-1 text-[11px] font-bold text-white">
                          Completed
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-sm text-neutral-500">
                      {yearItem.focus}
                    </p>

                    <div className="mt-3 flex items-center gap-3">
                      <div
                        role="progressbar"
                        aria-label={`${yearItem.label} progress`}
                        aria-valuenow={percent}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        className="h-1.5 w-40 overflow-hidden rounded-full bg-neutral-200 sm:w-56"
                      >
                        <div
                          className="h-full rounded-full bg-[#ee5a2b] transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-neutral-500">
                        {done}/{total}
                      </span>
                    </div>
                  </div>

                  <ChevronDown
                    size={20}
                    className={`mt-1 shrink-0 text-neutral-400 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div
                    id={panelId}
                    className="mt-6 grid gap-6 border-t border-neutral-100 pt-6 sm:grid-cols-2"
                  >
                    {yearItem.sections.map((section) => {
                      const SectionIcon = section.icon;

                      return (
                        <div key={section.key}>
                          <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#111111] text-[#ee5a2b]">
                              <SectionIcon size={14} />
                            </span>
                            {section.title}
                          </h4>

                          <div>
                            {section.items.map((item) => (
                              <CheckItem
                                key={item.id}
                                checked={Boolean(state.done[item.id])}
                                onChange={() => toggleItem(item.id)}
                                label={item.label}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {/* ---------------- Tips ---------------- */}
      <section className={cardCls}>
        <h2 className="text-lg font-semibold tracking-tight">
          What usually helps you get a better offer
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {OFFER_TIPS.map((tip) => (
            <li
              key={tip}
              className="flex items-start gap-3 rounded-xl bg-[#f6f5f3] p-4 text-sm leading-relaxed text-neutral-700"
            >
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#ee5a2b]" />
              {tip}
            </li>
          ))}
        </ul>
        <p className="mt-5 text-xs leading-relaxed text-neutral-400">
          This roadmap is general guidance. Hiring needs differ by company,
          college and year, and no roadmap can guarantee a package. Your ticked
          items are saved in this browser only.
        </p>
      </section>
    </div>
  );
}

/* ================================================================== */
/* AI roadmap builder: role + semester -> semester-wise plan + links   */
/* The AI only suggests topics and search phrases. The links below are */
/* built here as YouTube / Google searches, so they never break.       */
/* ================================================================== */

const AI_ROADMAP_KEY = "aiRoadmapState_v1";
const SERVER_URL = String(
  import.meta.env.VITE_SERVER_URL || "http://localhost:8000",
).replace(/\/+$/, "");
const AI_ROADMAP_API = `${SERVER_URL}/api/roadmap/generate`;

const SEMESTER_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8];
const STUDY_HOURS_OPTIONS = [5, 10, 15, 20];
const CUSTOM_ROLE = "__custom";

const SITE_LABELS = {
  "geeksforgeeks.org": "GeeksforGeeks",
  "developer.mozilla.org": "MDN",
  "w3schools.com": "W3Schools",
  "freecodecamp.org": "freeCodeCamp",
  "tutorialspoint.com": "TutorialsPoint",
  "javatpoint.com": "Javatpoint",
  "nptel.ac.in": "NPTEL",
  "khanacademy.org": "Khan Academy",
  "roadmap.sh": "roadmap.sh",
  "leetcode.com": "LeetCode",
  "kaggle.com": "Kaggle",
  "react.dev": "React docs",
  "nodejs.org": "Node.js docs",
  "docs.python.org": "Python docs",
  "learn.microsoft.com": "Microsoft Learn",
  "aws.amazon.com": "AWS",
  "owasp.org": "OWASP",
  "scikit-learn.org": "scikit-learn",
};

const youtubeUrl = (query) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

const webUrl = (query, site) =>
  `https://www.google.com/search?q=${encodeURIComponent(
    site ? `${query} site:${site}` : query,
  )}`;

const defaultAiState = () => ({
  form: {
    roleChoice: CAREER_FIELDS[0].planRole,
    customRole: "",
    semester: 1,
    hours: 10,
  },
  roadmap: null,
  done: {},
});

const loadAiState = () => {
  const base = defaultAiState();

  try {
    const raw = localStorage.getItem(AI_ROADMAP_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw);

    return {
      form: {
        roleChoice:
          typeof parsed?.form?.roleChoice === "string"
            ? parsed.form.roleChoice
            : base.form.roleChoice,
        customRole:
          typeof parsed?.form?.customRole === "string"
            ? parsed.form.customRole.slice(0, 80)
            : "",
        semester: SEMESTER_OPTIONS.includes(parsed?.form?.semester)
          ? parsed.form.semester
          : 1,
        hours: STUDY_HOURS_OPTIONS.includes(parsed?.form?.hours)
          ? parsed.form.hours
          : 10,
      },
      roadmap:
        parsed?.roadmap && Array.isArray(parsed.roadmap.semesters)
          ? parsed.roadmap
          : null,
      done: parsed?.done && typeof parsed.done === "object" ? parsed.done : {},
    };
  } catch {
    return base;
  }
};

function TopicLinks({ topic }) {
  const query = topic.searchQuery || topic.name;
  const linkCls =
    "inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-neutral-700 transition hover:border-[#ee5a2b] hover:text-[#ee5a2b] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ee5a2b]";

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <a
        href={youtubeUrl(`${query} tutorial`)}
        target="_blank"
        rel="noopener noreferrer"
        className={linkCls}
      >
        <Play size={12} className="text-[#ee5a2b]" />
        YouTube
        <span className="sr-only"> (opens in a new tab)</span>
      </a>

      {(topic.channels || []).map((channel) => (
        <a
          key={channel}
          href={youtubeUrl(`${channel} ${query}`)}
          target="_blank"
          rel="noopener noreferrer"
          className={linkCls}
        >
          <Play size={12} className="text-[#ee5a2b]" />
          {channel}
          <span className="sr-only"> on YouTube (opens in a new tab)</span>
        </a>
      ))}

      <a
        href={webUrl(`${query} tutorial`)}
        target="_blank"
        rel="noopener noreferrer"
        className={linkCls}
      >
        <Globe size={12} className="text-[#ee5a2b]" />
        Web
        <span className="sr-only"> (opens in a new tab)</span>
      </a>

      {(topic.sites || []).map((site) => (
        <a
          key={site}
          href={webUrl(query, site)}
          target="_blank"
          rel="noopener noreferrer"
          className={linkCls}
        >
          <ExternalLink size={12} className="text-[#ee5a2b]" />
          {SITE_LABELS[site] || site}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      ))}
    </div>
  );
}

function AIRoadmapBuilder() {
  const [state, setState] = useState(loadAiState);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [openSem, setOpenSem] = useState(
    () => state.roadmap?.semesters?.[0]?.semester ?? null,
  );

  useEffect(() => {
    try {
      localStorage.setItem(AI_ROADMAP_KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable: the roadmap just won't persist */
    }
  }, [state]);

  const { form, roadmap, done } = state;

  const setForm = (patch) =>
    setState((previous) => ({
      ...previous,
      form: { ...previous.form, ...patch },
    }));

  const selectedRole = (
    form.roleChoice === CUSTOM_ROLE ? form.customRole : form.roleChoice
  ).trim();

  const toggle = (id) =>
    setState((previous) => {
      const next = { ...previous.done };
      if (next[id]) delete next[id];
      else next[id] = true;
      return { ...previous, done: next };
    });

  const generate = async (event) => {
    event.preventDefault();
    if (generating) return;

    setError("");

    if (selectedRole.length < 2) {
      setError("Please choose or type your target role.");
      return;
    }

    setGenerating(true);

    try {
      const response = await axios.post(
        AI_ROADMAP_API,
        {
          role: selectedRole,
          semester: Number(form.semester),
          hoursPerWeek: Number(form.hours),
        },
        {
          withCredentials: true,
          timeout: 120000,
          headers: { "Content-Type": "application/json" },
        },
      );

      const data = response?.data;
      const generatedRoadmap = data?.roadmap || data?.data?.roadmap;

      if (
        data?.success === false ||
        !generatedRoadmap ||
        !Array.isArray(generatedRoadmap.semesters) ||
        generatedRoadmap.semesters.length === 0
      ) {
        throw new Error(
          data?.message ||
            "The roadmap API returned an unexpected response. Check the backend route /api/roadmap/generate.",
        );
      }

      setState((previous) => ({
        ...previous,
        roadmap: {
          ...generatedRoadmap,
          role: selectedRole,
          semester: Number(form.semester),
          hours: Number(form.hours),
          generatedAt: new Date().toISOString(),
        },
        done: {},
      }));
      setOpenSem(generatedRoadmap.semesters[0]?.semester ?? null);
    } catch (err) {
      const status = err.response?.status;
      const message =
        err.code === "ECONNABORTED"
          ? "AI generation took too long. Please try again."
          : !err.response && err.request
            ? `Could not connect to the backend at ${SERVER_URL}. Start the backend and check VITE_SERVER_URL.`
            : status === 404
              ? "Roadmap API not found. Add or verify POST /api/roadmap/generate on the backend."
              : err.response?.data?.message ||
                err.message ||
                "Could not generate your roadmap. Please try again.";

      setError(message);
    } finally {
      setGenerating(false);
    }
  };

  const clearRoadmap = () => {
    if (!window.confirm("Remove this roadmap and your ticked items?")) return;
    setState((previous) => ({ ...previous, roadmap: null, done: {} }));
    setOpenSem(null);
  };

  /* ---------- numbers for the overview ---------- */
  const semesters = roadmap?.semesters || [];

  const semesterIds = (item) => [
    ...(item.topics || []).map((_, i) => `${item.semester}:t:${i}`),
    ...(item.projects || []).map((_, i) => `${item.semester}:p:${i}`),
    ...(item.milestones || []).map((_, i) => `${item.semester}:m:${i}`),
  ];

  const allIds = semesters.flatMap(semesterIds);
  const doneCount = allIds.filter((id) => done[id]).length;
  const overall = allIds.length
    ? Math.round((doneCount / allIds.length) * 100)
    : 0;

  const topicCount = semesters.reduce(
    (sum, item) => sum + (item.topics?.length || 0),
    0,
  );
  const totalHours = semesters.reduce(
    (sum, item) =>
      sum +
      (item.topics || []).reduce(
        (inner, topic) => inner + (Number(topic.estimatedHours) || 0),
        0,
      ),
    0,
  );
  const weeks = roadmap?.hours ? Math.ceil(totalHours / roadmap.hours) : 0;

  const chipCls = (active) =>
    `rounded-full px-4 py-2 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ee5a2b] ${
      active
        ? "bg-[#111111] text-white shadow-md"
        : "border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400"
    }`;

  return (
    <div className="space-y-6">
      {/* ---------------- Form (overlaps hero) ---------------- */}
      <section
        className={`${cardCls} relative z-10 mx-2 -mt-16 sm:mx-6 sm:p-8`}
        aria-labelledby="ai-roadmap-title"
      >
        <div className="mb-6 flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#ee5a2b] text-white">
            <Sparkles size={20} />
          </span>
          <div>
            <h2
              id="ai-roadmap-title"
              className="text-xl font-semibold tracking-tight"
            >
              Build your AI roadmap
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-neutral-500">
              Choose your role and current semester. AI will plan every semester
              up to the 8th, with YouTube and website links for each topic.
            </p>
          </div>
        </div>

        <form onSubmit={generate}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="aiRole" className={labelCls}>
                Target role
              </label>
              <select
                id="aiRole"
                className={inputCls}
                value={form.roleChoice}
                onChange={(event) =>
                  setForm({ roleChoice: event.target.value })
                }
              >
                {CAREER_FIELDS.map((item) => (
                  <option key={item.id} value={item.planRole}>
                    {item.planRole}
                  </option>
                ))}
                <option value={CUSTOM_ROLE}>Other (type my own)</option>
              </select>
            </div>

            <div>
              <label htmlFor="aiHours" className={labelCls}>
                Study time per week
              </label>
              <select
                id="aiHours"
                className={inputCls}
                value={form.hours}
                onChange={(event) =>
                  setForm({ hours: Number(event.target.value) })
                }
              >
                {STUDY_HOURS_OPTIONS.map((hours) => (
                  <option key={hours} value={hours}>
                    {hours} hours
                  </option>
                ))}
              </select>
            </div>

            {form.roleChoice === CUSTOM_ROLE && (
              <div className="sm:col-span-2">
                <label htmlFor="aiCustomRole" className={labelCls}>
                  Your role
                </label>
                <input
                  id="aiCustomRole"
                  className={inputCls}
                  value={form.customRole}
                  onChange={(event) =>
                    setForm({ customRole: event.target.value })
                  }
                  placeholder="e.g. Game Developer, Chemical Engineer, UI/UX Designer"
                  maxLength={80}
                />
              </div>
            )}
          </div>

          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold text-neutral-700">
              Which semester are you in?
            </p>
            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-label="Current semester"
            >
              {SEMESTER_OPTIONS.map((number) => (
                <button
                  key={number}
                  type="button"
                  onClick={() => setForm({ semester: number })}
                  aria-pressed={form.semester === number}
                  className={chipCls(form.semester === number)}
                >
                  Sem {number}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={generating}
            className="group mt-6 flex w-full items-center justify-between rounded-full bg-[#111111] py-1.5 pl-6 pr-1.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(0,0,0,0.18)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {generating
              ? "Building your roadmap... this can take up to a minute"
              : roadmap
                ? "Regenerate my roadmap"
                : "Generate my roadmap"}
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ee5a2b]">
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

      {/* ---------------- Result ---------------- */}
      {roadmap && (
        <>
          <section className="relative overflow-hidden rounded-2xl bg-[#111111] p-6 text-white shadow-[0_20px_50px_rgba(0,0,0,0.25)] sm:p-8">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-[#ee5a2b] opacity-30 blur-[90px]"
            />
            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-xl">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">
                  AI roadmap · {roadmap.role} · from semester {roadmap.semester}
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                  {roadmap.title}
                </h2>
                {roadmap.summary && (
                  <p className="mt-2 text-sm leading-relaxed text-white/60">
                    {roadmap.summary}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-medium text-white/80">
                  <span className="rounded-full bg-white/10 px-3 py-1">
                    {topicCount} topics
                  </span>
                  <span className="rounded-full bg-white/10 px-3 py-1">
                    about {totalHours} study hours
                  </span>
                  <span className="rounded-full bg-white/10 px-3 py-1">
                    about {weeks} weeks at {roadmap.hours} h/week
                  </span>
                </div>

                <button
                  type="button"
                  onClick={clearRoadmap}
                  className="mt-5 text-xs font-semibold text-white/60 underline underline-offset-4 transition hover:text-white"
                >
                  Remove this roadmap
                </button>
              </div>

              <RingProgress value={overall} />
            </div>
          </section>

          <ol className="space-y-4">
            {semesters.map((item) => {
              const ids = semesterIds(item);
              const finished = ids.filter((id) => done[id]).length;
              const percent = ids.length
                ? Math.round((finished / ids.length) * 100)
                : 0;
              const isOpen = openSem === item.semester;
              const panelId = `ai-semester-${item.semester}`;

              return (
                <li key={item.semester} className={cardCls}>
                  <button
                    type="button"
                    onClick={() => setOpenSem(isOpen ? null : item.semester)}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    className="flex w-full items-start justify-between gap-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ee5a2b]"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold tracking-tight">
                          Semester {item.semester}
                        </h3>
                        {item.semester === roadmap.semester && (
                          <span className="rounded-full bg-[#ee5a2b] px-2.5 py-1 text-[11px] font-bold text-white">
                            You are here
                          </span>
                        )}
                      </div>
                      {item.focus && (
                        <p className="mt-1.5 text-sm text-neutral-500">
                          {item.focus}
                        </p>
                      )}
                      <div className="mt-3 flex items-center gap-3">
                        <div
                          role="progressbar"
                          aria-label={`Semester ${item.semester} progress`}
                          aria-valuenow={percent}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          className="h-1.5 w-40 overflow-hidden rounded-full bg-neutral-200 sm:w-56"
                        >
                          <div
                            className="h-full rounded-full bg-[#ee5a2b] transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-neutral-500">
                          {finished}/{ids.length}
                        </span>
                      </div>
                    </div>

                    <ChevronDown
                      size={20}
                      className={`mt-1 shrink-0 text-neutral-400 transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div
                      id={panelId}
                      className="mt-6 space-y-6 border-t border-neutral-100 pt-6"
                    >
                      <div>
                        <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#111111] text-[#ee5a2b]">
                            <BookOpen size={14} />
                          </span>
                          Topics and study material
                        </h4>

                        <div className="space-y-3">
                          {(item.topics || []).map((topic, index) => {
                            const id = `${item.semester}:t:${index}`;
                            const checked = Boolean(done[id]);

                            return (
                              <div
                                key={id}
                                className={`rounded-xl border p-4 transition ${
                                  checked
                                    ? "border-neutral-100 bg-neutral-50"
                                    : "border-neutral-200 bg-white"
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <label className="relative mt-0.5 flex h-5 w-5 shrink-0 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() => toggle(id)}
                                      aria-label={`Mark ${topic.name} as ${
                                        checked ? "not done" : "done"
                                      }`}
                                      className="peer sr-only"
                                    />
                                    <span className="flex h-5 w-5 items-center justify-center rounded-md border-2 border-neutral-300 bg-white text-transparent transition peer-checked:border-[#ee5a2b] peer-checked:bg-[#ee5a2b] peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-[#ee5a2b]/50">
                                      <Check size={12} strokeWidth={3} />
                                    </span>
                                  </label>

                                  <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <h5
                                        className={`break-words text-sm font-semibold ${
                                          checked
                                            ? "text-neutral-400 line-through"
                                            : ""
                                        }`}
                                      >
                                        {topic.name}
                                      </h5>
                                      {topic.level && (
                                        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-600">
                                          {topic.level}
                                        </span>
                                      )}
                                      {topic.estimatedHours ? (
                                        <span className="inline-flex items-center gap-1 text-[11px] text-neutral-500">
                                          <Clock3
                                            size={11}
                                            className="text-[#ee5a2b]"
                                          />
                                          {topic.estimatedHours} h
                                        </span>
                                      ) : null}
                                    </div>

                                    {topic.why && (
                                      <p className="mt-1 text-sm leading-relaxed text-neutral-500">
                                        {topic.why}
                                      </p>
                                    )}

                                    <TopicLinks topic={topic} />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="grid gap-6 sm:grid-cols-2">
                        {[
                          {
                            key: "p",
                            title: "Projects to build",
                            icon: Hammer,
                            items: item.projects,
                          },
                          {
                            key: "m",
                            title: "Milestones",
                            icon: Target,
                            items: item.milestones,
                          },
                        ].map(({ key, title, icon: ListIcon, items }) =>
                          items?.length ? (
                            <div key={key}>
                              <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#111111] text-[#ee5a2b]">
                                  <ListIcon size={14} />
                                </span>
                                {title}
                              </h4>
                              {items.map((label, index) => {
                                const id = `${item.semester}:${key}:${index}`;

                                return (
                                  <CheckItem
                                    key={id}
                                    checked={Boolean(done[id])}
                                    onChange={() => toggle(id)}
                                    label={label}
                                  />
                                );
                              })}
                            </div>
                          ) : null,
                        )}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>

          <p className="px-1 text-xs leading-relaxed text-neutral-400">
            The AI suggests topics and search phrases. The YouTube and website
            buttons open searches for each topic, so they always work, but
            please judge the quality of what you find. AI can make mistakes, and
            no roadmap can guarantee a job or package. Your roadmap and ticks
            are saved in this browser only.
          </p>
        </>
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
  const [view, setView] = useState("plan"); // "plan" | "roadmap"

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

  const handleUseRoadmapPlan = (planRole) => {
    setTargetRole(planRole);
    setExperience("Fresher");
    setDurationDays("30");
    setError("");
    setNotice(
      `We filled the form for "${planRole}". Review it and generate your plan.`,
    );
    setView("plan");
    window.scrollTo({ top: 0, behavior: "smooth" });
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

          <div
            role="tablist"
            aria-label="Dashboard sections"
            className="relative mt-8 inline-flex rounded-full bg-white/10 p-1 backdrop-blur"
          >
            {[
              { id: "plan", label: "AI study plan", icon: Sparkles },
              { id: "roadmap", label: "Career roadmap", icon: Route },
            ].map(({ id, label, icon: TabIcon }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={view === id}
                onClick={() => setView(id)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${
                  view === id
                    ? "bg-[#ee5a2b] text-white shadow-md"
                    : "text-white/70 hover:text-white"
                }`}
              >
                <TabIcon size={14} />
                {label}
              </button>
            ))}
          </div>
        </header>

        {view === "plan" ? (
          <>
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
                    <CheckCircle2
                      size={17}
                      className="shrink-0 text-[#ee5a2b]"
                    />
                    {notice}
                  </div>
                )}
              </div>
            )}

            <div className="mt-8">
              {loading ? (
                <section
                  aria-live="polite"
                  aria-busy="true"
                  className="space-y-4"
                >
                  <p className="sr-only">
                    Loading your saved preparation plans...
                  </p>
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
                      <label
                        htmlFor="savedPlan"
                        className={`${labelCls} text-sm`}
                      >
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
                                  <Clock3
                                    size={12}
                                    className="text-[#ee5a2b]"
                                  />
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
          </>
        ) : (
          <div className="space-y-6">
            <AIRoadmapBuilder />
          </div>
        )}

        <footer className="mt-10 text-center text-xs text-neutral-400">
          AI-generated guidance · Your progress is saved to your account
        </footer>
      </div>
    </main>
  );
}

export default PreparationDashboard;