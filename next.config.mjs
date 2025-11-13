/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  turbopack: {
    allowedDevOrigins: [
      'http://192.168.1.23:3000', // IP الداخلي لجهازك
      'http://192.168.1.23:3001',
    ],
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: '**' },
    ],
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
