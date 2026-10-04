import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * The marketing pages moved to the names the navigation uses. Query strings
   * carry over, so a shared `/templates?type=birthday` still lands on the right
   * celebration.
   */
  async redirects() {
    return [
      { source: "/templates", destination: "/invitations", permanent: true },
      { source: "/pricing", destination: "/plans", permanent: true },
      { source: "/about", destination: "/our-story", permanent: true },
    ];
  },
};

export default nextConfig;
