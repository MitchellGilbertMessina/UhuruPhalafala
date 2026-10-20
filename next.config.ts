import type { NextConfig } from "next";
import { SH_DOMAIN_ROUTE, SH_HOST_PATTERN, SH_ORIGIN } from "./lib/sensuousHeirlooms";

const onHeirloomsDomain = [{ type: "host" as const, value: SH_HOST_PATTERN }];
const onUhuruDomain = [{ type: "host" as const, value: "(www\\.)?uhuruphalafala\\.com" }];

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
      // Short link for Pralini Naidoo's contribution.
      {
        source: "/sonic",
        has: onHeirloomsDomain,
        destination: "/pralini-naidoo",
        permanent: false,
      },
      {
        source: "/sonic",
        destination: `${SH_ORIGIN}/pralini-naidoo`,
        permanent: false,
      },

      // Old sensuousheirlooms.com/sensuousheirlooms/<slug> links -> /<slug>.
      // The internal route is also hidden from direct visits.
      ...["/sensuousheirlooms", SH_DOMAIN_ROUTE].flatMap((prefix) => [
        { source: prefix, has: onHeirloomsDomain, destination: "/", permanent: true },
        {
          source: `${prefix}/:slug`,
          has: onHeirloomsDomain,
          destination: "/:slug",
          permanent: true,
        },
      ]),

      // uhuruphalafala.com/sensuousheirlooms/... -> the publication's own domain.
      {
        source: "/sensuousheirlooms",
        has: onUhuruDomain,
        destination: `${SH_ORIGIN}/`,
        permanent: true,
      },
      {
        source: "/sensuousheirlooms/:slug",
        has: onUhuruDomain,
        destination: `${SH_ORIGIN}/:slug`,
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
