import React from 'react';
import googleLogo from '/public/GoogleLogo.svg';
import FacebookLogo from '/public/FacebookLogo.svg';

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
        className="w-full flex justify-center mb-4 p-2 rounded border border-white"
      >
        <img src={googleLogo} alt="Google Logo" className="h-6 mr-3" />
        Continue with Google
      </button>
      
      <button 
        type="button" 
        onClick={onFacebookLogin}
        className="w-full flex justify-center p-2 rounded border border-white"
      >
        <img src={FacebookLogo} alt="Facebook Logo" className="h-6 mr-3" />
        Continue with Facebook
      </button>
    </>
  );
};

export default SocialLoginButtons;