import { getChapter } from "@/sanity/sanity-utils";
import { PortableText } from "@portabletext/react";
import Link from "next/link";

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const chapter = await getChapter(slug);

  if (!chapter) {
    return <div>Chapter not found.</div>;
  }

  return (
    <main>
      <Link href="/sensuousheirlooms">
        ← Sensuous Heirlooms
      </Link>

      <h1>{chapter.title}</h1>
      <p>{chapter.contributor}</p>

      <PortableText value={chapter.content} />
    </main>
  );
}