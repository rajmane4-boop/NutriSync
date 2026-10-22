/// <reference types="vite/client" />

interface Window {
  google?: {
    accounts?: {
      id?: {
        initialize: (config: any) => void;
        renderButton: (parent: HTMLElement, options: any) => void;
        prompt: (momentListener?: (notification: any) => void) => void;
        revoke?: (hint: string, done: () => void) => void;
      };
      oauth2?: {
        initTokenClient: (config: {
          client_id: string;
          scope: string;
          callback: (response: any) => void;
          error_callback?: (error: any) => void;
        }) => {
          requestAccessToken: (overrideConfig?: any) => void;
        };
      };
    };
  };
}
