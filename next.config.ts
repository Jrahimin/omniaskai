import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: ["pg", "sharp"],
  images: {
    localPatterns: [
      { pathname: "/brand/**" },
      { pathname: "/topics/**" },
      { pathname: "/landing/**" },
      { pathname: "/media/**" },
    ],
  },
};

export default nextConfig;
