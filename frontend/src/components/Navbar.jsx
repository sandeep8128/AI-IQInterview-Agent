import { useEffect, useRef, useState } from "react";
import {
  Bot,
  LogOut,
  History,
  Coins,
  PlusCircle,
  Menu,
  X,
  ChevronDown,
  UserRound,
  Target,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { setUser } from "../redux/userSlice";

const API_URL = import.meta.env.VITE_SERVER_URL;

const INK = "#111111";
const ACCENT = "#ee5a2b";

const navLinks = [
  { label: "Home", to: "/", end: true },
  { label: "Interview", to: "/interview" },
  { label: "History", to: "/history" },
  { label: "Preparation", to: "/preparation", icon: Target },
  { label: "Pricing", to: "/pricing" },
];

const dropdownMotion = {
  initial: { opacity: 0, y: -6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.16 },
};

const dropdownClass =
  "absolute right-0 top-full z-50 mt-3 overflow-hidden rounded-2xl border border-neutral-200 bg-white py-2 shadow-xl";

function Navbar() {
  const userData = useSelector((state) => state.user?.userData);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isCreditsOpen, setIsCreditsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const creditsRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns when clicking outside.
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (creditsRef.current && !creditsRef.current.contains(event.target)) {
        setIsCreditsOpen(false);
      }

      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close menus after navigation.
  const closeMenus = () => {
    setIsMobileMenuOpen(false);
    setIsCreditsOpen(false);
    setIsProfileOpen(false);
  };

  const handleSignIn = () => {
    closeMenus();
    navigate("/auth");
  };

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      if (API_URL) {
        await axios.post(
          `${API_URL}/api/auth/logout`,
          {},
          { withCredentials: true },
        );
      }
    } catch (error) {
      console.error(
        "Logout request failed:",
        error.response?.data?.message || error.message,
      );
    } finally {
      dispatch(setUser(null));
      setLoggingOut(false);
      closeMenus();
      navigate("/");
    }
  };

  const handleCreditsClick = () => {
    setIsCreditsOpen((previous) => !previous);
    setIsProfileOpen(false);
  };

  const handleProfileClick = () => {
    setIsProfileOpen((previous) => !previous);
    setIsCreditsOpen(false);
  };

  const desktopLinkClass = ({ isActive }) =>
    `relative inline-flex min-h-11 items-center justify-center gap-2
    whitespace-nowrap rounded-full px-3.5 py-2.5 text-sm font-semibold
    transition-all duration-200 xl:px-4
    focus-visible:outline-none focus-visible:ring-2
    focus-visible:ring-[#ee5a2b]
    ${
      isActive
        ? "bg-[#ee5a2b]/10 text-[#d9481b] shadow-sm ring-1 ring-[#ee5a2b]/20"
        : "text-neutral-600 hover:bg-white hover:text-[#d9481b]"
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `flex min-h-12 items-center gap-3 rounded-xl px-4 py-3
    text-sm font-semibold transition-all duration-200
    ${
      isActive
        ? "bg-[#ee5a2b]/10 text-[#d9481b] ring-1 ring-[#ee5a2b]/20"
        : "text-neutral-700 hover:bg-white hover:text-[#d9481b]"
    }`;

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-black/[0.07] bg-[#f6f5f3]/95 backdrop-blur-xl"
      style={{
        fontFamily: "'Inter Tight', 'Inter', system-ui, sans-serif",
      }}
    >
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700&display=swap');
        `}
      </style>

      <div className="mx-auto flex min-h-[76px] max-w-[1440px] items-center justify-between gap-3 px-4 sm:min-h-[82px] sm:px-6 lg:px-8 xl:px-10">
        {/* Brand */}
        <Link
          to="/"
          onClick={closeMenus}
          aria-label="AI Interview Agent home"
          className="flex shrink-0 items-center gap-2.5 sm:gap-3"
        >
          <span
            className="flex h-10 w-10 items-center justify-center rounded-xl text-white sm:h-11 sm:w-11"
            style={{ background: INK }}
          >
            <Bot size={23} strokeWidth={1.8} />
          </span>

          <span className="whitespace-nowrap text-[13px] font-bold tracking-tight text-[#111111] sm:text-base lg:text-[17px]">
            AI Interview Agent
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-1 lg:flex xl:gap-2"
        >
          {navLinks.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={desktopLinkClass}
              >
                {Icon && <Icon size={16} strokeWidth={2} />}
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Desktop actions */}
        <div className="hidden shrink-0 items-center gap-3 lg:flex xl:gap-4">
          {userData ? (
            <>
              {/* Credits dropdown */}
              <div className="relative" ref={creditsRef}>
                <button
                  type="button"
                  onClick={handleCreditsClick}
                  aria-expanded={isCreditsOpen}
                  className="flex min-h-11 items-center gap-2 rounded-full border border-neutral-200 bg-white px-3.5 py-2 text-sm font-semibold transition hover:border-[#ee5a2b]/50 hover:shadow-sm"
                >
                  <Coins size={17} style={{ color: ACCENT }} />
                  <span>{userData.credits ?? 0}</span>
                  <ChevronDown size={14} className="text-neutral-400" />
                </button>

                <AnimatePresence>
                  {isCreditsOpen && (
                    <motion.div
                      {...dropdownMotion}
                      className={`${dropdownClass} w-56`}
                    >
                      <p className="px-4 pt-2 text-xs text-neutral-500">
                        Your balance
                      </p>

                      <div className="px-4 py-3">
                        <span className="text-3xl font-bold text-[#111111]">
                          {userData.credits ?? 0}
                        </span>
                        <span className="ml-2 text-xs text-neutral-500">
                          credits left
                        </span>
                      </div>

                      <div className="border-t border-neutral-100 px-3 pt-3">
                        <button
                          type="button"
                          onClick={() => {
                            closeMenus();
                            navigate("/pricing");
                          }}
                          className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                          style={{ background: ACCENT }}
                        >
                          <PlusCircle size={16} />
                          Add credits
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Profile dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={handleProfileClick}
                  aria-label="Open profile"
                  aria-expanded={isProfileOpen}
                  className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold uppercase text-white transition hover:ring-4 hover:ring-[#ee5a2b]/15"
                  style={{ background: INK }}
                >
                  {userData.name?.charAt(0) || "U"}
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      {...dropdownMotion}
                      className={`${dropdownClass} w-64`}
                    >
                      <div className="border-b border-neutral-100 px-4 pb-3 pt-2">
                        <p className="truncate text-sm font-bold text-[#111111]">
                          {userData.name || "User"}
                        </p>
                        <p className="mt-1 truncate text-xs text-neutral-500">
                          {userData.email}
                        </p>
                      </div>

                      <div className="p-2">
                        <button
                          type="button"
                          onClick={() => {
                            closeMenus();
                            navigate("/history");
                          }}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
                        >
                          <History size={17} style={{ color: ACCENT }} />
                          Interview history
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            closeMenus();
                            navigate("/preparation");
                          }}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
                        >
                          <Target size={17} style={{ color: ACCENT }} />
                          Preparation dashboard
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            closeMenus();
                            navigate("/pricing");
                          }}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
                        >
                          <Coins size={17} style={{ color: ACCENT }} />
                          Manage credits
                        </button>
                      </div>

                      <div className="border-t border-neutral-100 p-2">
                        <button
                          type="button"
                          onClick={handleLogout}
                          disabled={loggingOut}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                        >
                          <LogOut size={17} />
                          {loggingOut ? "Logging out..." : "Log out"}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={handleSignIn}
              className="min-h-11 rounded-full border border-[#ee5a2b]/30 bg-[#ee5a2b]/10 px-5 py-2.5 text-sm font-bold text-[#d9481b] shadow-sm transition duration-200 hover:border-[#ee5a2b] hover:bg-[#ee5a2b] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ee5a2b] focus-visible:ring-offset-2"
            >
              Sign in
            </button>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((previous) => !previous)}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileMenuOpen}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-white text-[#111111] transition hover:bg-neutral-100 lg:hidden"
        >
          {isMobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>

      {/* Mobile navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-black/[0.07] bg-[#f6f5f3] lg:hidden"
          >
            <nav
              aria-label="Mobile navigation"
              className="mx-auto flex max-w-7xl flex-col gap-1.5 px-4 py-4 sm:px-6"
            >
              {navLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={closeMenus}
                    className={mobileLinkClass}
                  >
                    {Icon && <Icon size={18} />}
                    {item.label}
                  </NavLink>
                );
              })}

              {userData ? (
                <>
                  <div className="mx-3 mt-2 flex items-center gap-2 border-t border-neutral-200 py-4 text-sm font-semibold text-neutral-700">
                    <Coins size={18} style={{ color: ACCENT }} />
                    {userData.credits ?? 0} credits available
                  </div>

                  <div className="rounded-xl bg-white p-4">
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                        style={{ background: INK }}
                      >
                        {userData.name?.charAt(0) || "U"}
                      </span>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold">
                          {userData.name || "User"}
                        </p>
                        <p className="truncate text-xs text-neutral-500">
                          {userData.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      closeMenus();
                      navigate("/pricing");
                    }}
                    className="mt-2 flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-neutral-700 transition hover:bg-white"
                  >
                    <PlusCircle size={18} style={{ color: ACCENT }} />
                    Add credits
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="mt-1 flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                  >
                    <LogOut size={18} />
                    {loggingOut ? "Logging out..." : "Log out"}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleSignIn}
                  className="mt-3 flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#ee5a2b]/30 bg-[#ee5a2b]/10 px-5 py-3 text-sm font-bold text-[#d9481b] transition hover:bg-[#ee5a2b] hover:text-white"
                >
                  <UserRound size={17} />
                  Sign in
                </button>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Navbar;
