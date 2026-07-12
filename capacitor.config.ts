import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bodaempire.app',
  appName: 'Boda Empire',
  webDir: 'www',
  server: {
    // TODO: point this at the deployed app once it's live (Firebase App
    // Hosting or Vercel). The AI features are Next.js server actions, so
    // this must be a real server URL, not a static export.
    url: 'https://REPLACE-WITH-YOUR-DEPLOYED-URL',
    cleartext: false,
  },
};

export default config;
