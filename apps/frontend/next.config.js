/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {  
  transpilePackages: ['session'],
  experimental: {
    outputFileTracingRoot: path.join(__dirname, "../../"),
    appDir:false
  },
  webpack(config) {
    config.experiments = { ...config.experiments, topLevelAwait: true };
    return config;
}
}

module.exports = nextConfig
