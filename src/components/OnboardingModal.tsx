import { useEffect, useState } from "react";
import { BookOpen, CheckCircle2, GraduationCap, LogIn, Sparkles, UserCheck, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useStudent, type GradeNumber, type ProfileUserType } from "../context/StudentContext";

const GRADES: GradeNumber[] = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"];

export default function OnboardingModal() {
  const { language } = useLanguage();
  const uz = language === "uz";
  const { user, authReady, authBusy, authError, clearAuthError, loginWithGoogle, saveOnboardingPreferences } = useAuth();
  const { profile, setGrade, setUserType, setOnboardingDone } = useStudent();

  const [step, setStep] = useState<1 | 2>(1);
  const [pickedType, setPickedType] = useState<ProfileUserType | null>(profile.userType);
  const [pickedGrade, setPickedGrade] = useState<GradeNumber | null>(profile.grade);

  const skipViaQuery =
    typeof window !== "undefined" && new URLSearchParams(window.location.search).get("autostart") === "1";

  const isOpen = authReady && !profile.onboardingDone && !skipViaQuery;

  useEffect(() => {
    if (user && step === 1) {
      setStep(2);
    }
  }, [user, step]);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    clearAuthError();
    const u = await loginWithGoogle();
    if (u) {
      setStep(2);
    }
  };

  const handleSkipAccount = () => {
    clearAuthError();
    setStep(2);
  };

  const handleSkipProfile = async () => {
    setOnboardingDone(true);
    if (user) {
      await saveOnboardingPreferences({ onboardingDone: true });
    }
  };

  const handleSaveProfile = async () => {
    if (pickedType) setUserType(pickedType);
    if (pickedGrade) setGrade(pickedGrade);
    setOnboardingDone(true);
    if (user) {
      await saveOnboardingPreferences({
        profileType: pickedType,
        grade: pickedGrade,
        onboardingDone: true,
      });
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-modal-title"
      data-testid="onboarding-modal"
      className="fixed inset-0 z-50 bg-slate-950/75 flex items-center justify-center p-4"
    >
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Top Accent Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-brand-primary dark:text-blue-400 flex items-center gap-1.5 mb-1">
              <Sparkles size={13} />
              <span>{uz ? `Qadam ${step} / 2 · Ixtiyoriy` : `Шаг ${step} / 2 · Необязательно`}</span>
            </p>
            <h2 id="onboarding-modal-title" className="text-xl sm:text-2xl font-serif font-black text-slate-900 dark:text-white">
              {step === 1
                ? uz
                  ? "Audio Darsliklar 2026 platformasiga xush kelibsiz!"
                  : "Добро пожаловать в Audio Darsliklar 2026!"
                : uz
                  ? "O'quvchimisiz yoki O'qituvchimi?"
                  : "Вы ученик или учитель?"}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => void handleSkipProfile()}
            aria-label={uz ? "Yopish" : "Закрыть"}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          {step === 1 ? (
            <div className="space-y-5">
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {uz
                  ? "Google akkaunt orqali kirsangiz yaratgan testlaringiz va natijalaringiz bulutda saqlanadi. Xohlasangiz hozir kirishni o'tkazib yuborib platformadan erkin foydalanishingiz mumkin."
                  : "Вход через Google сохранит ваши тесты и результаты в облаке. Вы можете пропустить этот шаг и пользоваться платформой свободно."}
              </p>

              {authError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs font-semibold text-red-700 dark:text-red-300">
                  {authError}
                </div>
              )}

              <div className="space-y-2.5">
                <button
                  type="button"
                  disabled={authBusy}
                  onClick={() => void handleGoogleLogin()}
                  className="w-full py-3.5 px-4 rounded-2xl bg-brand-primary hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2.5 transition-colors disabled:opacity-60"
                >
                  <LogIn size={18} />
                  <span>
                    {authBusy
                      ? uz
                        ? "Kirilmoqda..."
                        : "Выполняется вход..."
                      : uz
                        ? "Google akkaunt orqali kirish"
                        : "Войти через Google"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleSkipAccount}
                  data-testid="onboarding-skip-account"
                  className="w-full py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm transition-colors"
                >
                  {uz ? "O'tkazib yuborish" : "Пропустить"}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {uz
                  ? "Sinfingiz yoki maqomingizni tanlasangiz darsliklar, testlar va AI Ustoz sizga moslab ko'rsatiladi. Bu ham ixtiyoriy."
                  : "Выберите ваш класс или статус учителя для персональных рекомендаций. Это тоже необязательно."}
              </p>

              {/* Role Pick: Student vs Teacher */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPickedType("student")}
                  data-testid="onboarding-role-student"
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    pickedType === "student"
                      ? "bg-blue-50 dark:bg-blue-950/50 border-brand-primary ring-2 ring-brand-primary/30 text-slate-900 dark:text-white"
                      : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-brand-primary"
                  }`}
                >
                  <GraduationCap size={22} className="text-brand-primary dark:text-blue-400 mb-2" />
                  <p className="font-black text-sm">{uz ? "O'quvchiman" : "Я ученик"}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {uz ? "1–11 sinf o'quvchisi" : "Ученик 1–11 класса"}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setPickedType("teacher")}
                  data-testid="onboarding-role-teacher"
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    pickedType === "teacher"
                      ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/30 text-slate-900 dark:text-white"
                      : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-emerald-500"
                  }`}
                >
                  <UserCheck size={22} className="text-emerald-600 dark:text-emerald-400 mb-2" />
                  <p className="font-black text-sm">{uz ? "O'qituvchiman" : "Я учитель"}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {uz ? "Dars, slayd va test tuzuvchi" : "Создатель уроков и тестов"}
                  </p>
                </button>
              </div>

              {/* Optional Grade Selector */}
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                  <BookOpen size={13} />
                  <span>
                    {pickedType === "teacher"
                      ? uz
                        ? "Qaysi sinfga dars berasiz? (ixtiyoriy)"
                        : "Какой класс вы ведёте? (необязательно)"
                      : uz
                        ? "Nechinchi sinfsiz? (ixtiyoriy)"
                        : "В каком вы классе? (необязательно)"}
                  </span>
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {GRADES.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setPickedGrade(pickedGrade === g ? null : g)}
                      className={`py-2 rounded-xl text-xs font-black tabular-nums border transition-colors ${
                        pickedGrade === g
                          ? "bg-brand-primary border-brand-primary text-white"
                          : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-brand-primary"
                      }`}
                    >
                      {g}-{uz ? "sinf" : "кл"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => void handleSaveProfile()}
                  data-testid="onboarding-save-btn"
                  className="flex-1 py-3 px-4 rounded-2xl bg-brand-primary hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <CheckCircle2 size={17} />
                  <span>{uz ? "Saqlash va davom etish" : "Сохранить и продолжить"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => void handleSkipProfile()}
                  data-testid="onboarding-skip-profile"
                  className="py-3 px-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm transition-colors"
                >
                  {uz ? "O'tkazib yuborish" : "Пропустить"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
