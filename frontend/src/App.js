import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { TranscriptionProvider } from "./contexts/TranscriptionContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Transcriptions from "./pages/Transcriptions";
import { Toaster } from "./components/ui/toaster";

function App() {
  return (
    <ThemeProvider>
      <TranscriptionProvider>
        <div className="App">
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/transcriptions" element={<Transcriptions />} />
              </Routes>
            </Layout>
          </BrowserRouter>
          <Toaster />
        </div>
      </TranscriptionProvider>
    </ThemeProvider>
  );
}

export default App;