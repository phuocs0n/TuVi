/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@tuvi/shared-types", "@tuvi/laso"],
};

export default nextConfig;
