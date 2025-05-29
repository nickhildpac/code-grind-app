import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Code, Eye, EyeOff, Loader, Loader2, Lock, Mail } from "lucide-react";
import LoginPage from "./page/LoginPage";
import SignupPage from "./page/SignupPage";
import { Homepage } from "./page/Homepage";
import { useAuthStore } from "./store/useAuthStore";

function App() {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-start">
      <Toaster />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route
            path="/login"
            element={!authUser ? <LoginPage /> : <Navigate to={"/"} />}
          />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/"
            element={authUser ? <Homepage /> : <Navigate to={"/login"} />}
          />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
