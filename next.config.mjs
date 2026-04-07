/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/api/:path*",
          destination: "https://casas-comunales.onrender.com/:path*",
        },
      ],
    };
  },
};

export default nextConfig;
