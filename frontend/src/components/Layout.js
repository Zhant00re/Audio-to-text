import React from "react";
import { useTheme } from "../contexts/ThemeContext";
import { Button } from "./ui/button";
import { Moon, Sun, FileText, Home } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card } from "./ui/card";

const Layout = ({ children }) => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                VoiceScribe
              </h1>
              <nav className="hidden md:flex space-x-4">
                <Button
                  variant={location.pathname === "/" ? "default" : "ghost"}
                  onClick={() => navigate("/")}
                  className="flex items-center space-x-2"
                >
                  <Home size={16} />
                  <span>Home</span>
                </Button>
                <Button
                  variant={location.pathname === "/transcriptions" ? "default" : "ghost"}
                  onClick={() => navigate("/transcriptions")}
                  className="flex items-center space-x-2"
                >
                  <FileText size={16} />
                  <span>Transcriptions</span>
                </Button>
              </nav>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="transition-all duration-300 hover:scale-105"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-slate-600 dark:text-slate-400">
            <p>VoiceScribe - Secure Local Audio Transcription</p>
            <p className="mt-1">Your data stays on your device. No internet required.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;