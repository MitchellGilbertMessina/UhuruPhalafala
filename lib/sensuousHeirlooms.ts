// Sensuous Heirlooms lives on its own domain at the root
// (www.sensuousheirlooms.com/<slug>). On that domain, middleware.ts quietly
// serves those URLs from the internal SH_DOMAIN_ROUTE pages. The
// /sensuousheirlooms/<slug> pages are kept for local development.

export const SH_ORIGIN = "https://www.sensuousheirlooms.com";

// Matches sensuousheirlooms.com and www.sensuousheirlooms.com.
export const SH_HOST_PATTERN = "(www\\.)?sensuousheirlooms\\.com";

export const SH_DOMAIN_ROUTE = "/sensuousheirlooms-domain";

export function isSensuousHeirloomsHost(host: string | null | undefined) {
  return new RegExp(`^${SH_HOST_PATTERN}$`).test(host ?? "");
}
