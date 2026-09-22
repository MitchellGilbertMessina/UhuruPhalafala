import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sensuous Heirlooms",
  description: "Sensuous Heirlooms by Uhuru Phalafala.",
  alternates: {
    canonical: "https://sensuousheirlooms.com/",
  },
  openGraph: {
    title: "Sensuous Heirlooms",
    description: "Sensuous Heirlooms by Uhuru Phalafala.",
    url: "https://sensuousheirlooms.com/",
    siteName: "Sensuous Heirlooms",
    type: "website",
  },
};

export default function HeirloomsPage() {
  return <div>Sensuous Heirlooms</div>;
}