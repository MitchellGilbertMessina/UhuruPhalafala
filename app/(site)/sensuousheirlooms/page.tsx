// localhost:3000/sensuousheirlooms (on the live domain this redirects to /)
import { LandingPage, landingMetadata } from "@/components/publication/heirloomsRoutes";

export const revalidate = 60;
export const metadata = landingMetadata;

export default function Page() {
  return <LandingPage basePath="/sensuousheirlooms" />;
}
