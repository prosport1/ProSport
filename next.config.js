/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: false,
  },
  typescript: { ignoreBuildErrors: false }, // se travar por TS, mude para true temporariamente
  eslint: { ignoreDuringBuilds: true },
};

module.exports = nextConfig;
