"use client";
import { createContext, useState, useContext, useEffect } from "react";

// Create the context
const LoginContext = createContext();

// Create the provider
const LoginProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // On initial load, read login status from localStorage
  useEffect(() => {
    const storedLoginStatus = localStorage.getItem("isLoggedIn");
    if (storedLoginStatus === "true") {
      setIsLoggedIn(true);
    }
  }, []);

  // When login state changes, persist to localStorage
  useEffect(() => {
    localStorage.setItem("isLoggedIn", isLoggedIn.toString());
  }, [isLoggedIn]);

  const loginContextValue = {
    isLoggedIn,
    setIsLoggedIn,
    // Add more if needed (e.g. user info, logout handler)
  };

  return (
    <LoginContext.Provider value={loginContextValue}>
      {children}
    </LoginContext.Provider>
  );
};

// Custom hook
const useLogin = () => {
  const context = useContext(LoginContext);
  if (!context) {
    throw new Error("useLogin must be used within a LoginProvider");
  }
  return context;
};

export { LoginProvider, LoginContext, useLogin };