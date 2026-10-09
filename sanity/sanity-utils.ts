import { Project } from "@/types/project";
import { createClient, groq } from "next-sanity";
import clientConfig from "./config/client-config";
import { client } from "./lib/client";
import { Chapter } from "@/types/chapter";
import { ImageChapter } from "@/types/imageChapter";

export async function getProjects(): Promise<Project[]> {
  try {
    const projects = await createClient(clientConfig).fetch(
      groq`*[_type == "project"]{
        _id,
        _createdAt,
        title,
        author,
        "slug": slug.current,
        "frontcover": frontcover.asset->url,
        alt,
        content,
      }`
    );

    return projects ?? [];
  } catch (error) {
    console.error("Failed to fetch publications:", error);
    return [];
  }
}

export async function getProject(slug: string): Promise<Project> {
  return createClient(clientConfig).fetch(
    groq`*[_type == "project" && slug.current == $slug][0]{
      _id,
      _createdAt,
      title,
      author,
      "slug": slug.current,
      "frontcover": frontcover.asset->url,
      alt,
      content,
    }`,
    { slug }
  );
}

export async function getHomepageImages() {
  const query = `
    *[_type == "siteSettings"][0]{
      homepageImages[]{
        asset->{
          url
        }
      }
    }
  `;

  const data = await client.fetch(query);
  return data.homepageImages;
}

export async function getChapters(): Promise<Chapter[]> {
  return client.fetch(
    groq`*[_type == "chapter"] | order(order asc) {
      _id,
      title,
      contributor,
      "slug": slug.current,
      order,
      content,
      pdf
    }`
  );
}

export async function getChapter(slug: string) {
  return client.fetch(
    groq`*[_type == "chapter" && slug.current == $slug][0]{
      _id,
      title,
      contributor,
      "slug": slug.current,
      order,
      content,
      pdf
    }`,
    { slug }
  );

}

export async function getImageChapters(): Promise<ImageChapter[]> {
  return client.fetch(
    groq`*[_type == "imageChapter"] | order(order asc) {
      _id,
      title,
      contributor,
      "slug": slug.current,
      order,
      "pages": pages[]{
        _key,
        pageNumber,
        alt,
        "url": asset->url
      },
      "pdf": pdf{
  asset->{
    url
  }
}
    }`
  );
}
export async function getImageChapter(
  slug: string
): Promise<ImageChapter | null> {
  return client.fetch(
    groq`*[_type == "imageChapter" && slug.current == $slug][0] {
      _id,
      title,
      contributor,
      "slug": slug.current,
      order,
      "pages": pages[]{
        _key,
        pageNumber,
        alt,
        "url": asset->url
      },
      "pdf": pdf{
        asset->{
          url
        }
      }
    }`,
    { slug }
  );
}