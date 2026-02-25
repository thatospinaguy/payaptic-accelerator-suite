/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "literate-space-engine-ww9j77jrwvqcg49p-3000.app.github.dev",
      ],
    },
  },
};

export default nextConfig;
