/** @type {import('next').NextConfig} */
const isGithubPages = process.env.GITHUB_PAGES === "true";
const basePath = isGithubPages ? "/baby-record-app" : "";

const nextConfig = {
  ...(isGithubPages
    ? {
        output: "export",
        basePath,
        assetPrefix: basePath,
        trailingSlash: true,
        images: {
          unoptimized: true,
        },
      }
    : {}),
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
