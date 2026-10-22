import api from './api';

export const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '932727170379-q87sml7ld8av64naq4mcu87mq4au58ge.apps.googleusercontent.com';

/**
 * Triggers Google OAuth Sign-In popup using Google Identity Services.
 * Returns the access token / JWT from NutriSync backend.
 */
export async function triggerGoogleAuth(
  onSuccess: (token: string) => void,
  onError: (errorMsg: string) => void,
  onLoading?: (isLoading: boolean) => void
) {
  if (typeof window === 'undefined') return;

  // Ensure Google script is present
  if (!window.google?.accounts?.oauth2) {
    const existingScript = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
      await new Promise((resolve) => {
        script.onload = resolve;
      });
    }
  }

  if (!window.google?.accounts?.oauth2) {
    onError('Google Identity Services failed to load. Please disable ad-blockers and try again.');
    return;
  }

  onLoading?.(true);

  try {
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: 'email profile openid',
      callback: async (tokenResponse: any) => {
        if (tokenResponse?.error) {
          onLoading?.(false);
          onError(`Google sign-in was cancelled or encountered an error (${tokenResponse.error}).`);
          return;
        }

        if (tokenResponse?.access_token) {
          try {
            const res = await api.post('/auth/google', {
              access_token: tokenResponse.access_token,
            });
            const jwt = res.data.access_token;
            localStorage.setItem('access_token', jwt);
            onSuccess(jwt);
          } catch (backendErr: any) {
            const detail =
              backendErr.response?.data?.detail ||
              'Failed to authenticate with NutriSync server. Please try again.';
            onError(detail);
          } finally {
            onLoading?.(false);
          }
        } else {
          onLoading?.(false);
          onError('Google did not return an access token.');
        }
      },
      error_callback: () => {
        onLoading?.(false);
        onError('Google popup was closed or blocked by browser.');
      },
    });

    tokenClient.requestAccessToken();
  } catch (err: any) {
    onLoading?.(false);
    onError(err.message || 'Error initiating Google Sign-In.');
  }
}

/**
 * Initializes Google One Tap (credential response) if available.
 */
export function initGoogleOneTap(
  onSuccess: (token: string) => void,
  onError: (errorMsg: string) => void
) {
  if (typeof window === 'undefined' || !window.google?.accounts?.id) return;

  try {
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (response: any) => {
        if (!response.credential) return;
        try {
          const res = await api.post('/auth/google', {
            credential: response.credential,
          });
          const jwt = res.data.access_token;
          localStorage.setItem('access_token', jwt);
          onSuccess(jwt);
        } catch (backendErr: any) {
          const detail =
            backendErr.response?.data?.detail ||
            'Failed to authenticate with Google One Tap.';
          onError(detail);
        }
      },
    });

    window.google.accounts.id.prompt();
  } catch {
    // One Tap is optional, ignore failure to prompt
  }
}
