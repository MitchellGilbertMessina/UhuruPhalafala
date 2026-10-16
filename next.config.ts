
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        port: "",
      },
    ],
  },

  async redirects() {
    return [
      {
        source: "/sonic",
        destination: "/pralini-naidoo",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
