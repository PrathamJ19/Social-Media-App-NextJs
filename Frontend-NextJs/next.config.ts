import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/", // The path to redirect from
        destination: "/home", // The path to redirect to
        permanent: true, // Indicates if the redirect is permanent (301) or temporary (302)
      },
    ];
  },
};

export default nextConfig;
