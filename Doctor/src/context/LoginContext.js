import { createContext, useState, useContext } from "react";

// Create the context
const LoginContext = createContext();

// Create the provider
const LoginProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const loginContextValue = {
    isLoggedIn,
    setIsLoggedIn,
    // You can add more login-related logic here
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

export { LoginProvider, useLogin, LoginContext };
