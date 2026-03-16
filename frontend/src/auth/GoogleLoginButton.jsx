import { useEffect, useRef } from 'react';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export default function GoogleLoginButton({ onCredential, onError }) {
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!googleClientId) {
      return;
    }

    let attempts = 0;
    const maxAttempts = 30;
    const intervalId = window.setInterval(() => {
      if (window.google?.accounts?.id && buttonRef.current) {
        window.clearInterval(intervalId);

        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: ({ credential }) => {
            if (!credential) {
              onError('Google did not return an ID token.');
              return;
            }

            onCredential(credential);
          }
        });

        buttonRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          width: 320,
          text: 'continue_with'
        });

        return;
      }

      attempts += 1;
      if (attempts >= maxAttempts) {
        window.clearInterval(intervalId);
        onError('Google Sign-In SDK failed to load. Refresh and try again.');
      }
    }, 150);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [onCredential, onError]);

  if (!googleClientId) {
    return (
      <p className="status-text">
        Google login is disabled. Set <strong>VITE_GOOGLE_CLIENT_ID</strong> in frontend env.
      </p>
    );
  }

  return <div ref={buttonRef} className="google-login-wrap" />;
}
