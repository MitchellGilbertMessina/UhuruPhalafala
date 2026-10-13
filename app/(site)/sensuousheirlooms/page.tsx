import type { Metadata } from "next";
import ImagePublicationReader from "@/components/publication/ImagePublicationReader";
import { getImageChapters } from "@/sanity/sanity-utils";

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

export default async function HeirloomsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const [chapters, query] = await Promise.all([
    getImageChapters(),
    searchParams,
  ]);

  const initialView = query.view === "spread" ? "spread" : "scroll";

  return (
    <ImagePublicationReader
      chapters={chapters}
      initialSlug={null}
      initialView={initialView}
    />
  );
}