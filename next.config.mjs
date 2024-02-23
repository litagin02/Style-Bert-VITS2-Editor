import packageJson from './package.json' assert { type: 'json' };

const version = packageJson.version;

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  env: {
    version,
  },
};

export default nextConfig;
