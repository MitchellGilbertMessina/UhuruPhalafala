
import type { Metadata } from "next";
import { getImageChapters } from "@/sanity/sanity-utils";
import ImagePublicationReader from "@/components/publication/ImagePublicationReader";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Sensuous Heirlooms",
  description: "Sensuous Heirlooms Edited by Uhuru Portia Phalafala",
  alternates: {
    canonical: "https://sensuousheirlooms.com/",
  },
  openGraph: {
    title: "Sensuous Heirlooms",
    description: "Sensuous Heirlooms Edited by Uhuru Portia Phalafala",
    url: "https://sensuousheirlooms.com/",
    siteName: "Sensuous Heirlooms",
    type: "website",
  },
};

export default async function HeirloomsPage() {
  const chapters = await getImageChapters();

  return <ImagePublicationReader chapters={chapters} initialSlug={null} />;
}
