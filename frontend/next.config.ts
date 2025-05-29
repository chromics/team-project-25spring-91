// frontend/next.config.ts
import type { NextConfig } from "next";

// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000", 
        pathname: "/api/uploads/gyms/**", 
      },
    ],
  },
};

module.exports = nextConfig;
