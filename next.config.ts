
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
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
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      { // Add this pattern for OpenStreetMap tiles
        protocol: 'https',
        hostname: '*.tile.openstreetmap.org', // Use wildcard for subdomains (a, b, c)
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;

    