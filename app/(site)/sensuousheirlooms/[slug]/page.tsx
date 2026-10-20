// localhost:3000/sensuousheirlooms/<slug> (on the live domain this redirects to /<slug>)
import { ChapterPage, chapterMetadata } from "@/components/publication/heirloomsRoutes";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  return chapterMetadata((await params).slug);
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <ChapterPage slug={slug} basePath="/sensuousheirlooms" />;
}
