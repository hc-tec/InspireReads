/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack(config, { dev }) {
    if (dev) {
      config.watchOptions = {
        aggregateTimeout: 300,  // 延迟时间，通常设置在 300 毫秒
        poll: 1000,  // 每秒检查文件变化
      };
    }
    return config;
  },
};

module.exports = nextConfig;
