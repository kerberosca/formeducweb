/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    unoptimized: true
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "26mb"
    }
  }
};

export default nextConfig;
