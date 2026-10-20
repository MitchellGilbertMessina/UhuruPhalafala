// www.sensuousheirlooms.com/ (middleware.ts rewrites the domain root here)
import { LandingPage, landingMetadata } from "@/components/publication/heirloomsRoutes";

export const revalidate = 60;
export const metadata = landingMetadata;

export default function Page() {
  return <LandingPage basePath="" />;
}
