// www.sensuousheirlooms.com/<slug> (middleware.ts rewrites those URLs here)
import { ChapterPage, chapterMetadata } from "@/components/publication/heirloomsRoutes";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  return chapterMetadata((await params).slug);
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <ChapterPage slug={slug} basePath="" />;
}
