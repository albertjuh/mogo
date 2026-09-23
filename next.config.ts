import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  // react-leaflet's MapContainer isn't compatible with Strict Mode's
  // dev-only double-invoke of refs/layout effects: it throws "Map container
  // is already initialized" because its internal ref callback re-creates the
  // Leaflet map on the same DOM node before any cleanup runs. Production
  // builds don't double-invoke, so this only affects local dev.
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
