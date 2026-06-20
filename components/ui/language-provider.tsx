"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AppLang, dictionary, LANG_STORAGE_KEY } from "@/lib/i18n";
import { Role } from "@/lib/types";

type LanguageContextValue = {
  lang: AppLang;
  setLang: (lang: AppLang) => void;
  t: (key: string) => string;
  roleLabel: (role: Role) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<AppLang>("ar");

  useEffect(() => {
    const saved = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (saved === "ar" || saved === "he") {
      setLangState(saved);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = "rtl";
    window.localStorage.setItem(LANG_STORAGE_KEY, lang);
  }, [lang]);

  const value = useMemo<LanguageContextValue>(() => {
    const dict = dictionary[lang];
    return {
      lang,
      setLang: setLangState,
      t: (key: string) => dict[key] ?? key,
      roleLabel: (role: Role) => dict[`role_${role}`] ?? role,
    };
  }, [lang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return ctx;
}
