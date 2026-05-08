import type { NextConfig } from "next";
import pkg from "./package.json";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: pkg.version,
  },
  // Required for AWS Amplify SSR (kept for the existing amplify.yml).
  output: "standalone",
};

export default nextConfig;
