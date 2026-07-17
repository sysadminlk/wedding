'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void;
          renderButton: (parent: HTMLElement, config: { theme?: string; size?: string; text?: string; shape?: string; width?: number }) => void;
          prompt: () => void;
        };
      };
    };
  }
}

interface GoogleSignInProps {
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  className?: string;
}

export default function GoogleSignIn({
  text = 'continue_with',
  theme = 'outline',
  size = 'large',
  className = '',
}: GoogleSignInProps) {
  const router = useRouter();
  const buttonRef = useRef<HTMLDivElement>(null);

  const handleCredentialResponse = useCallback(async (response: { credential: string }) => {
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: response.credential }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Google login failed');
      }
      router.push('/');
    } catch (error) {
      console.error('Google login error:', error);
      window.location.reload();
    }
  }, [router]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn('NEXT_PUBLIC_GOOGLE_CLIENT_ID not set');
      return;
    }

    const loadGoogleScript = () => {
      if (document.getElementById('google-signin-script')) {
        renderButton();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.id = 'google-signin-script';
      script.async = true;
      script.defer = true;
      script.onload = () => renderButton();
      document.head.appendChild(script);
    };

    const renderButton = () => {
      if (!window.google?.accounts?.id || !buttonRef.current) return;
      buttonRef.current.innerHTML = '';
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
      });
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme,
        size,
        text,
        width: buttonRef.current.offsetWidth || 300,
      });
    };

    loadGoogleScript();
  }, [handleCredentialResponse, theme, size, text]);

  return <div ref={buttonRef} className={className} />;
}
