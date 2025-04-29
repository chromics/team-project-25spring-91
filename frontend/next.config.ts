import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  images: {
    // simple allow‐list
    domains: ['picsum.photos'],
    // or, if you want more fine-grained control:
    remotePatterns: [
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
