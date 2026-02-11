export {};

declare global {
  interface Window {
    electronAPI?: {
      getEnvironment: () => Promise<{ current: string; customHost: string } | null>;
      setEnvironment: (settings: {
        current: string;
        customHost: string;
      }) => Promise<void>;
    };
  }
}

