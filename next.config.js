/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  webpack: (config, { isServer }) => {
    // Handle private class fields and other modern JS features
    config.module.rules.push({
      test: /\.m?js$/,
      resolve: {
        fullySpecified: false,
      },
    });

    // Ensure proper handling of ES modules
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    };

    return config;
  },
  // Ensure proper transpilation of dependencies
  transpilePackages: ['undici'],
  experimental: {
    esmExternals: 'loose',
  },
}

module.exports = nextConfig
