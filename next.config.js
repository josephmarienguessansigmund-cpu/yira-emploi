/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  images: {
    unoptimized: true,
    formats: ['image/avif', 'image/webp'],
  },
};

module.exports = nextConfig;