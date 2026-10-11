import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";

import Home from "./pages/homePage/Home.jsx";
import Auth from "./pages/authPages/AuthPage.jsx";
import ResetPassword from "./pages/authPages/ResetPassword.jsx";
import InterView from "./pages/interView/InterView.jsx";
import InterviewHistory from "./pages/history/InterviewHistory.jsx";
import Pricing from "./pages/pricing/Pricing.jsx";
import InterviewReport from "./pages/report/InterviewReport.jsx";
import PreparationDashboard from "./pages/preparation/PreparationDashboard.jsx";
import CommunicationCoach from "./pages/CommunicationCoach/CommunicationCoach.jsx";

import Navbar from "./components/Navbar.jsx";
import { setUser } from "./redux/userSlice.js";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        const serverUrl = import.meta.env.VITE_SERVER_URL;

        if (!serverUrl) {
          throw new Error("VITE_SERVER_URL is not configured");
        }

        const response = await axios.get(`${serverUrl}/api/user/getUser`, {
          withCredentials: true,
        });

        if (isMounted) {
          dispatch(setUser(response.data?.user || null));
        }
      } catch (error) {
        if (isMounted) {
          dispatch(setUser(null));
        }

        if (error.response?.status !== 401) {
          console.error(
            "Session restoration failed:",
            error.response?.data?.message || error.message,
          );
        }
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/interview" element={<InterView />} />
        <Route path="/history" element={<InterviewHistory />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/report/:id" element={<InterviewReport />} />
        <Route path="/preparation" element={<PreparationDashboard />} />

        {/* AI English Communication Coach */}
        <Route path="/communication-coach" element={<CommunicationCoach />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
