/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: false,
  },
  typescript: { ignoreBuildErrors: false }, // pode trocar pra true se quiser destravar rápido
  eslint: { ignoreDuringBuilds: true },
};

module.exports = nextConfig;
