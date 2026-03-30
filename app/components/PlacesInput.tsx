"use client";

import { useEffect, useRef, useState } from "react";
import { Navigation, MapPin, X } from "lucide-react";

interface Suggestion {
  place_id: string;
  description: string;
}

interface Props {
  name: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  icon?: "origin" | "destination";
  required?: boolean;
}

export default function PlacesInput({ name, placeholder, value, onChange, icon = "destination", required }: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    onChange(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (val.trim().length < 3) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/places?input=${encodeURIComponent(val)}`);
        const data = await res.json();
        if (data.predictions) {
          setSuggestions(data.predictions);
          setOpen(true);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }, 300);
  }

  function handleSelect(description: string) {
    onChange(description);
    setSuggestions([]);
    setOpen(false);
  }

  const Icon = icon === "origin" ? Navigation : MapPin;
  const iconColor = icon === "origin" ? "text-[#A0A0A0]" : "text-[#A0A0A0]";

  return (
    <div ref={containerRef} className="relative">
      <Icon size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${iconColor} pointer-events-none z-10`} />
      <input
        name={name}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        required={required}
        autoComplete="off"
        className="w-full bg-[#2B2B2B] border border-[#444444] text-[#F0F0F0] placeholder-[#A0A0A0] rounded px-4 py-3 pl-10 pr-8 focus:outline-none focus:border-[#CC0000] transition-colors"
      />
      {value && (
        <button
          type="button"
          onClick={() => { onChange(""); setSuggestions([]); setOpen(false); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0A0A0] hover:text-[#F0F0F0] transition-colors"
        >
          <X size={14} />
        </button>
      )}
      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-[#222222] border border-[#444444] rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.6)] overflow-hidden">
          {suggestions.map((s) => {
            const [main, ...rest] = s.description.split(",");
            return (
              <li key={s.place_id}>
                <button
                  type="button"
                  onMouseDown={() => handleSelect(s.description)}
                  className="w-full text-left px-4 py-3 hover:bg-[#2B2B2B] transition-colors border-b border-[#333] last:border-0"
                >
                  <p className="text-[#F0F0F0] text-sm font-medium truncate">{main}</p>
                  {rest.length > 0 && (
                    <p className="text-[#A0A0A0] text-xs truncate mt-0.5">{rest.join(",").trim()}</p>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
