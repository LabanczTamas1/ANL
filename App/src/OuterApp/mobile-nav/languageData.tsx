import type { Language } from "../../hooks/useLanguage";

export type { Language };

export const LANGUAGES: Language[] = ["english", "magyar", "romana"];

export const flags: Record<Language, JSX.Element> = {
  english: (
    <svg viewBox="0 0 60 30" className="w-6 h-4" aria-hidden="true">
      <clipPath id="mob-s">
        <path d="M0,0 v30 h60 v-30 z" />
      </clipPath>
      <clipPath id="mob-t">
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <g clipPath="url(#mob-s)">
        <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
        <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#mob-t)" stroke="#C8102E" strokeWidth="4" />
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  ),
  magyar: (
    <svg viewBox="0 0 6 3" className="w-6 h-4" aria-hidden="true">
      <rect width="6" height="1" fill="#CE2939" />
      <rect width="6" height="1" y="1" fill="#fff" />
      <rect width="6" height="1" y="2" fill="#477050" />
    </svg>
  ),
  romana: (
    <svg viewBox="0 0 3 2" className="w-6 h-4" aria-hidden="true">
      <rect width="1" height="2" fill="#002B7F" />
      <rect width="1" height="2" x="1" fill="#FCD116" />
      <rect width="1" height="2" x="2" fill="#CE1126" />
    </svg>
  ),
};

export const langLabels: Record<Language, string> = {
  english: "English",
  magyar: "Magyar",
  romana: "Română",
};
