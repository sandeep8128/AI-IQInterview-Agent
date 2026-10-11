import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Auth from "../pages/authPages/AuthPage.jsx";

function AuthModel() {
  const userData = useSelector((state) => state.user?.userData);
  const navigate = useNavigate();

  useEffect(() => {
    if (userData) {
      navigate("/", { replace: true });
    }
  }, [userData, navigate]);

  return (
    <main className="min-h-screen w-full">
      <Auth isModel={false} />
    </main>
  );
}

export default AuthModel;
