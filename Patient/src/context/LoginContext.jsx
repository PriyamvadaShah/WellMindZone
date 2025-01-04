import { createContext, useState } from "react";

const LoginContext = createContext();

const LoginProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // Add any other login-related state you need

  const loginContextValue = {
    isLoggedIn,
    setIsLoggedIn,
    // Add other login-related methods here
  };

  return (
    <LoginContext.Provider value={loginContextValue}>
      {children}
    </LoginContext.Provider>
  );
};

export const useLogin = () => {
  const context = useContext(LoginContext);
  if (!context) {
    throw new Error('useLogin must be used within a LoginProvider');
  }
  return context;
};

export { LoginProvider, LoginContext };