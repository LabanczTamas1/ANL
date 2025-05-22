import { useLanguage } from './../hooks/useLanguage';

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();
  
  // SVG flags for each language
  const flags = {
    english: (
      <svg viewBox="0 0 60 30" className="w-6 h-4">
        <clipPath id="s">
          <path d="M0,0 v30 h60 v-30 z" />
        </clipPath>
        <clipPath id="t">
          <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
        </clipPath>
        <g clipPath="url(#s)">
          <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
          <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
          <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t)" stroke="#C8102E" strokeWidth="4" />
          <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
          <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
        </g>
      </svg>
    ),
    magyar: (
      <svg viewBox="0 0 6 3" className="w-6 h-4">
        <rect width="6" height="1" fill="#CE2939" />
        <rect width="6" height="1" y="1" fill="#fff" />
        <rect width="6" height="1" y="2" fill="#477050" />
      </svg>
    ),
    romana: (
      <svg viewBox="0 0 3 2" className="w-6 h-4">
        <rect width="1" height="2" fill="#002B7F" />
        <rect width="1" height="2" x="1" fill="#FCD116" />
        <rect width="1" height="2" x="2" fill="#CE1126" />
      </svg>
    )
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950 flex flex-col items-center justify-center p-6 transition-colors duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-lg w-full transition-colors duration-300">
        <h1 className="text-3xl font-bold text-center text-indigo-700 dark:text-indigo-400 mb-6 transition-colors duration-300">
          {t('welcome')}
        </h1>
        
        <p className="text-lg text-center text-gray-600 dark:text-gray-300 mb-8 transition-colors duration-300">
          {t('instructions')}
        </p>
        
        {/* Language switcher buttons with flags */}
        <div className="flex justify-center gap-4 mb-8">
          <button 
            onClick={() => setLanguage('english')}
            className={`px-4 py-2 rounded-md transition-all flex items-center gap-2 ${
              language === 'english' 
                ? 'bg-indigo-600 dark:bg-indigo-500 text-white font-bold' 
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
            }`}
          >
            <span className="inline-block">{flags.english}</span>
            <span>English</span>
          </button>
          
          <button 
            onClick={() => setLanguage('magyar')}
            className={`px-4 py-2 rounded-md transition-all flex items-center gap-2 ${
              language === 'magyar' 
                ? 'bg-indigo-600 dark:bg-indigo-500 text-white font-bold' 
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
            }`}
          >
            <span className="inline-block">{flags.magyar}</span>
            <span>Magyar</span>
          </button>
          
          <button 
            onClick={() => setLanguage('romana')}
            className={`px-4 py-2 rounded-md transition-all flex items-center gap-2 ${
              language === 'romana' 
                ? 'bg-indigo-600 dark:bg-indigo-500 text-white font-bold' 
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
            }`}
          >
            <span className="inline-block">{flags.romana}</span>
            <span>Română</span>
          </button>
        </div>
        
        {/* Content section */}
        <div className="bg-indigo-50 dark:bg-indigo-900/40 rounded-lg p-6 transition-colors duration-300">
          <h2 className="text-xl font-semibold text-indigo-800 dark:text-indigo-300 mb-4 transition-colors duration-300">
            {t('greeting', { name: 'User' })}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 transition-colors duration-300">
            {t('about')}
          </p>
        </div>
      </div>
    </div>
  );
}