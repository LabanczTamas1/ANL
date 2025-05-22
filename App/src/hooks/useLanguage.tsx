import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import Cookies from 'js-cookie';

// Define our available languages
export type Language = 'english' | 'magyar' | 'romana';
// Define translation key type
export type TranslationKey = string;

// Define our translation dictionary structure
export type TranslationsType = {
  [language in Language]: {
    [key: TranslationKey]: string;
  };
};

// Language mappings for browser detection
const languageMappings: Record<string, Language> = {
  'en': 'english',
  'en-US': 'english',
  'en-GB': 'english',
  'hu': 'magyar',
  'ro': 'romana',
  'ro-RO': 'romana'
};

// Cookie settings
const LANGUAGE_COOKIE_KEY = 'app-language';
const COOKIE_MAX_AGE = 365; // days

// Context for language data and functions
interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, placeholders?: Record<string, string>) => string;
  translations: TranslationsType;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Provider component that wraps your app
export const LanguageProvider: React.FC<{
  children: ReactNode;
  translations: TranslationsType;
  defaultLanguage?: Language;
}> = ({ children, translations, defaultLanguage = 'english' }) => {
  const [language, setLanguageState] = useState<Language>(defaultLanguage);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize language preference from cookies or browser settings
  useEffect(() => {
    const initLanguage = () => {
      // Check cookie first
      const cookieLanguage = Cookies.get(LANGUAGE_COOKIE_KEY) as Language | undefined;
      
      if (cookieLanguage && Object.keys(translations).includes(cookieLanguage)) {
        setLanguageState(cookieLanguage);
        return;
      }
      
      // If no cookie, check browser/system language
      const browserLanguages = navigator.languages || [navigator.language];
      
      // Try to find a match in our supported languages
      for (const browserLang of browserLanguages) {
        const shortLang = browserLang.split('-')[0];
        
        // Check for direct match
        if (languageMappings[browserLang]) {
          setLanguageState(languageMappings[browserLang]);
          return;
        }
        
        // Check for language code match
        if (languageMappings[shortLang]) {
          setLanguageState(languageMappings[shortLang]);
          return;
        }
      }
      
      // Default to provided default language if no matches
      setLanguageState(defaultLanguage);
    };

    initLanguage();
    setIsInitialized(true);
  }, [defaultLanguage, translations]);

  // Function to change language and save to cookie
  const setLanguage = (newLanguage: Language) => {
    if (Object.keys(translations).includes(newLanguage)) {
      setLanguageState(newLanguage);
      Cookies.set(LANGUAGE_COOKIE_KEY, newLanguage, { 
        expires: COOKIE_MAX_AGE,
        sameSite: 'lax'
      });
    }
  };

  // Translation function with placeholder support
  const t = (key: TranslationKey, placeholders?: Record<string, string>): string => {
    // Get the translation for the current language
    const translation = translations[language]?.[key] || translations[defaultLanguage]?.[key] || key;
    
    // If no placeholders, return the translation as is
    if (!placeholders) {
      return translation;
    }
    
    // Replace placeholders in the format {{key}}
    return Object.entries(placeholders).reduce(
      (text, [placeholder, value]) => text.replace(new RegExp(`{{${placeholder}}}`, 'g'), value),
      translation
    );
  };

  // Prevent rendering until language is initialized
  if (!isInitialized) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translations }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook to use the language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};