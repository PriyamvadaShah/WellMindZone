// app/layout.js
'use client';

import { useState } from "react";
import { LoginContext } from "../context/LoginContext";
import { SocketProvider } from "../context/SocketProvider";

import Header from "../components/Header";
import Footer from "../components/Footer";
import ScrollToTop from "../components/ScrollToTop";
import ScrollToTopButton from "../components/ScrollToTopButton";

import "../Styles/index.css"; // Tailwind + global styles

export default function RootLayout({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <html lang="en">
      <body>
        <LoginContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
          <SocketProvider>
            <div className="bg-light min-h-screen font-sans text-primary flex flex-col">
              <ScrollToTop />
              <Header />
              <main className="flex-grow container mx-auto px-4 py-8">
                {children}
              </main>
              <ScrollToTopButton />
              <Footer />
            </div>
          </SocketProvider>
        </LoginContext.Provider>
      </body>
    </html>
  );
}
