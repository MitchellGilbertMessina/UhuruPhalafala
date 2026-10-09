import type { Metadata } from "next";
import Link from "next/link";
import { getChapters } from "@/sanity/sanity-utils";

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

export default async function HeirloomsPage() {
  const chapters = await getChapters();

  return (
    <main>
      <h1>Sensuous Heirlooms</h1>

      <nav>
        {chapters.map((chapter) => (
          <Link
            key={chapter._id}
            href={`/sensuousheirlooms/${chapter.slug}`}
          >
            <div>
              {chapter.contributor}
            </div>
            <div>
              {chapter.title}
            </div>
          </Link>
        ))}
      </nav>
    </main>
  );
}