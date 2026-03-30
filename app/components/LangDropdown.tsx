"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { type Lang } from "../hooks/useLang";

const options: { lang: Lang; code: string; label: string }[] = [
  { lang: "pt", code: "PT", label: "Português" },
  { lang: "en", code: "EN", label: "English" },
  { lang: "es", code: "ES", label: "Español" },
];

export default function LangDropdown({
  lang,
  setLang,
  className,
}: {
  lang: Lang;
  setLang: (l: Lang) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.lang === lang) ?? options[0];


  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className={`relative ${className ?? ""}`}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-[#A0A0A0] hover:text-[#F0F0F0] transition-colors px-2 py-1.5 rounded"
      >
        <span className="text-xs font-semibold tracking-wider">{current.code}</span>
        <ChevronDown size={11} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 bg-[#2B2B2B] border border-[#444] rounded-lg shadow-lg overflow-hidden z-50 min-w-[120px]">
          {options.map((o) => (
            <button
              key={o.lang}
              onClick={() => { setLang(o.lang); setOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-[#333] ${
                lang === o.lang ? "text-[#F0F0F0] font-medium" : "text-[#A0A0A0]"
              }`}
            >
              <span className="text-xs font-bold tracking-wider w-6">{o.code}</span>
              <span>{o.label}</span>
              {lang === o.lang && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#CC0000]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
