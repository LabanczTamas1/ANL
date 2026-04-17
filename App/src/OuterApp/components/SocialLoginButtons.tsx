import React from 'react';
const googleLogo = '/GoogleLogo.svg';
const FacebookLogo = '/FacebookLogo.svg';

interface SocialLoginButtonsProps {
  onGoogleLogin: () => void;
  onFacebookLogin: () => void;
}

const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({
  onGoogleLogin,
  onFacebookLogin
}) => {
  return (
    <>
      <button 
        type="button"
        onClick={onGoogleLogin}
        className="w-full flex items-center justify-center gap-3 mb-3 p-3 rounded-xl border border-line-glass text-white hover:bg-white/5 transition"
      >
        <img src={googleLogo} alt="Google" className="h-5 w-5" />
        Continue with Google
      </button>
      
      <button 
        type="button" 
        onClick={onFacebookLogin}
        className="w-full flex items-center justify-center gap-3 p-3 rounded-xl border border-line-glass text-white hover:bg-white/5 transition"
      >
        <img src={FacebookLogo} alt="Facebook" className="h-5 w-5" />
        Continue with Facebook
      </button>
    </>
  );
};

export default SocialLoginButtons;