import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  // firebase-admin pulls in jwks-rsa -> jose, whose ESM/CJS boundary breaks
  // when webpack bundles it into the serverless function. Keep it external
  // so Node resolves it natively at runtime instead.
  serverExternalPackages: ['firebase-admin'],
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
