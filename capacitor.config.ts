import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bodaempire.app',
  appName: 'Boda Empire',
  webDir: 'www',
  server: {
    url: 'https://mogo-lovat.vercel.app',
    cleartext: false,
  },
};

export default config;
