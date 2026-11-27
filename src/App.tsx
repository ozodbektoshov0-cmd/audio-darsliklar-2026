/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Suspense, lazy, type ComponentType } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AiChatWidget from "./components/AiChatWidget";
import SideTtsReader from "./components/SideTtsReader";
import OnboardingModal from "./components/OnboardingModal";
import PageLoader from "./components/PageLoader";
import RouteSeo from "./components/RouteSeo";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import AboutPage from "./pages/AboutPage";
import { StudentProvider } from "./context/StudentContext";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";
import { ReaderProvider } from "./context/ReaderContext";
import { AuthProvider } from "./context/AuthContext";
import { ErrorBoundary } from "./components/ErrorBoundary";

function lazyWithRetry<T extends ComponentType<any>>(importer: () => Promise<{ default: T }>) {
  return lazy(async () => {
    try {
      return await importer();
    } catch (firstErr) {
      await new Promise((r) => setTimeout(r, 350));
      try {
        return await importer();
      } catch (secondErr) {
        try {
          const lastReload = Number(sessionStorage.getItem("ad_chunk_reload_ts") || "0");
          if (Date.now() - lastReload > 10_000) {
            sessionStorage.setItem("ad_chunk_reload_ts", String(Date.now()));
            window.location.reload();
          }
        } catch {
          // ignore storage errors
        }
        throw secondErr ?? firstErr;
      }
    }
  });
}

const Library = lazyWithRetry(() => import("./pages/Library"));
const Lessons = lazyWithRetry(() => import("./pages/Lessons"));
const Materials = lazyWithRetry(() => import("./pages/Materials"));
const Tests = lazyWithRetry(() => import("./pages/Tests"));
const TestDetail = lazyWithRetry(() => import("./pages/TestDetail"));
const TtsStudio = lazyWithRetry(() => import("./pages/TtsStudio"));
const AiChatbot = lazyWithRetry(() => import("./pages/AiChatbot"));
const StudentProfile = lazyWithRetry(() => import("./pages/StudentProfile"));

function RouteFallback() {
  return (
    <div className="pt-28 pb-20 max-w-5xl mx-auto px-4 sm:px-6 min-h-[60vh]">
      <div className="h-8 w-56 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse mb-4" />
      <div className="h-4 w-80 rounded bg-slate-100 dark:bg-slate-900 animate-pulse mb-8" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-36 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <StudentProvider>
              <Router>
                <RouteSeo />
                <ReaderProvider>
                  <PageLoader />
                  <div className="relative overflow-x-hidden min-h-screen flex flex-col justify-between bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
                    <Navbar />
                    <main className="flex-grow">
                      <Suspense fallback={<RouteFallback />}>
                        <Routes>
                          <Route path="/" element={<Home />} />
                          <Route path="/library" element={<Library />} />
                          <Route path="/lessons" element={<Lessons />} />
                          <Route path="/materials" element={<Materials />} />
                          <Route path="/tests" element={<Tests />} />
                          <Route path="/tests/:id" element={<TestDetail />} />
                          <Route path="/tts" element={<TtsStudio />} />
                          <Route path="/ai-tutor" element={<AiChatbot />} />
                          <Route path="/profile" element={<StudentProfile />} />
                          <Route path="/about" element={<AboutPage />} />
                          <Route path="/contact" element={<Contact />} />
                        </Routes>
                      </Suspense>
                    </main>
                    <SideTtsReader />
                    <AiChatWidget />
                    <OnboardingModal />
                    <Footer />
                  </div>
                </ReaderProvider>
              </Router>
            </StudentProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
