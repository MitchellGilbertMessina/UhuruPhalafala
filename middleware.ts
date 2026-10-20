import { NextRequest, NextResponse } from "next/server";
import { SH_DOMAIN_ROUTE, isSensuousHeirloomsHost } from "@/lib/sensuousHeirlooms";

// On sensuousheirlooms.com the publication sits at the root:
//   /            -> SH_DOMAIN_ROUTE
//   /<slug>      -> SH_DOMAIN_ROUTE/<slug>
// The address bar keeps the short URL. Old /sensuousheirlooms/... links are
// redirected to the short URLs in next.config.ts, which runs before this.
export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host")?.split(":")[0];

  if (!isSensuousHeirloomsHost(hostname)) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  const segments = pathname.split("/").filter(Boolean);

  // Deeper paths (none exist on this domain) fall through to a normal 404.
  if (segments.length > 1) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = segments.length ? `${SH_DOMAIN_ROUTE}/${segments[0]}` : SH_DOMAIN_ROUTE;

  return NextResponse.rewrite(url);
}

export const config = {
  // Skip Next.js internals, the Studio, API routes and any file with an
  // extension (logos, the PDF worker, favicon...), so those are served as-is.
  matcher: ["/((?!_next|admin|api|.*\\..*).*)"],
};
