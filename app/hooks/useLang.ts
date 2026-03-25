"use client";

import { useState, useEffect } from "react";

export type Lang = "pt" | "en";

export function useLang() {
  const [lang, setLangState] = useState<Lang>("pt");

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Lang | null;
    if (saved === "pt" || saved === "en") setLangState(saved);
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem("lang", l);
  }

  return { lang, setLang };
}
