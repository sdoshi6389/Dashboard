import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sdoshi.dashboard',
  appName: "Doshi's Dashboard",
  webDir: 'out',
  server: {
    url: 'https://dashboard-ilb3.vercel.app',
    androidScheme: 'https'
  }
};

export default config;