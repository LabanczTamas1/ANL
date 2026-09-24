import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { FaGlobe } from "react-icons/fa";
import { LANGUAGES, flags, langLabels, type Language } from "./languageData";

interface LanguageSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Record<string, string>;
  /** Owned by the parent so it can restore focus when closing via Escape. */
  triggerRef: RefObject<HTMLButtonElement>;
}

const LanguageSelector = ({
  open,
  onOpenChange,
  language,
  setLanguage,
  t,
  triggerRef,
}: LanguageSelectorProps) => {
  const [activeDescendant, setActiveDescendant] = useState<number>(-1);
  const optionRefs = useRef<(HTMLLIElement | null)[]>([]);

  // When the dropdown opens, point the active descendant at the current language.
  useEffect(() => {
    if (open) {
      const idx = LANGUAGES.indexOf(language);
      setActiveDescendant(idx >= 0 ? idx : 0);
    } else {
      setActiveDescendant(-1);
    }
  }, [open, language]);

  // Scroll the active option into view & focus it.
  useEffect(() => {
    if (open && activeDescendant >= 0) {
      optionRefs.current[activeDescendant]?.focus();
    }
  }, [open, activeDescendant]);

  const selectLanguage = (lang: Language) => {
    setLanguage(lang);
    onOpenChange(false);
    triggerRef.current?.focus();
  };

  const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      onOpenChange(true);
    }
  };

  const handleListKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown": {
        e.preventDefault();
        setActiveDescendant((prev) => (prev < LANGUAGES.length - 1 ? prev + 1 : 0));
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        setActiveDescendant((prev) => (prev > 0 ? prev - 1 : LANGUAGES.length - 1));
        break;
      }
      case "Home": {
        e.preventDefault();
        setActiveDescendant(0);
        break;
      }
      case "End": {
        e.preventDefault();
        setActiveDescendant(LANGUAGES.length - 1);
        break;
      }
      case "Enter":
      case " ": {
        e.preventDefault();
        if (activeDescendant >= 0) {
          selectLanguage(LANGUAGES[activeDescendant]);
        }
        break;
      }
      case "Escape": {
        e.preventDefault();
        onOpenChange(false);
        triggerRef.current?.focus();
        break;
      }
      case "Tab": {
        // Close dropdown on tab out
        onOpenChange(false);
        break;
      }
    }
  };

  return (
    <div className="px-8 mt-8">
      <button
        ref={triggerRef}
        id="lang-trigger"
        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[#a78bfa]"
        onClick={() => onOpenChange(!open)}
        onKeyDown={handleTriggerKeyDown}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls="lang-listbox"
      >
        <FaGlobe className="text-white/60" size={16} aria-hidden="true" />
        {flags[language]}
        <span className="font-medium text-white text-base">{langLabels[language]}</span>
        <svg
          className={`ml-auto w-4 h-4 text-white/40 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <ul
          id="lang-listbox"
          role="listbox"
          aria-label={t["language.selectLanguage"]}
          aria-activedescendant={
            activeDescendant >= 0 ? `lang-option-${LANGUAGES[activeDescendant]}` : undefined
          }
          className="mt-2 rounded-xl bg-white/5 border border-white/10 overflow-hidden list-none m-0 p-0"
          onKeyDown={handleListKeyDown}
        >
          {LANGUAGES.map((lang, index) => (
            <li
              key={lang}
              id={`lang-option-${lang}`}
              ref={(el) => {
                optionRefs.current[index] = el;
              }}
              role="option"
              aria-selected={lang === language}
              tabIndex={index === activeDescendant ? 0 : -1}
              className={`flex items-center gap-3 w-full px-4 py-3 text-base text-white transition-colors cursor-pointer focus:outline-none focus:bg-[#65558F]/30 ${
                lang === language ? "bg-[#65558F]/20 font-semibold" : "hover:bg-white/10"
              }`}
              onClick={() => selectLanguage(lang)}
            >
              {flags[lang]}
              <span>{langLabels[lang]}</span>
              {lang === language && (
                <svg
                  className="ml-auto w-5 h-5 text-[#a78bfa]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LanguageSelector;
