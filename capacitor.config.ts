import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kingbariki.app',
  appName: 'King Bariki',
  webDir: 'www',
  server: {
    url: 'https://mogo-lovat.vercel.app',
    cleartext: false,
  },
};

export default config;
