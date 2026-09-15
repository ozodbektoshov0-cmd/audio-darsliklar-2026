/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Library from "./pages/Library";
import StudentProfile from "./pages/StudentProfile";
import AboutPage from "./pages/AboutPage";
import Contact from "./pages/Contact";
import TtsStudio from "./pages/TtsStudio";
import AiChatbot from "./pages/AiChatbot";
import AiChatWidget from "./components/AiChatWidget";
import PageLoader from "./components/PageLoader";
import { StudentProvider } from "./context/StudentContext";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <StudentProvider>
          <Router>
            <PageLoader />
            <div className="relative overflow-x-hidden min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/library" element={<Library />} />
                  <Route path="/tts" element={<TtsStudio />} />
                  <Route path="/ai-tutor" element={<AiChatbot />} />
                  <Route path="/profile" element={<StudentProfile />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<Contact />} />
                </Routes>
              </main>
              <AiChatWidget />
              <Footer />
            </div>
          </Router>
        </StudentProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

