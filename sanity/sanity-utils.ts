import {Project} from "@/types/project" 
import {createClient, groq} from "next-sanity";
import clientConfig from "./schemas/config/client-config";
import { client } from "./lib/client";


export async function getProjects(): Promise<Project[]> {
  try {
    const projects = await createClient(clientConfig).fetch(
        groq`*[_type == "project"]
        {
        _id,
        _createdAt,
        title,
        author,
        "slug": slug.current,
        "frontcover": frontcover.asset->url,
        alt,
        content,
    }`);
     // Fallback in case something goes wrong and `projects` is null
    return projects ?? [];
  } catch (error) {
    console.error("Failed to fetch publications:", error);
    return []; // Prevents crash from null
  }
}

export async function getProject(slug: string): Promise<Project> {
return createClient(clientConfig).fetch(
        groq`*[_type == "project" && slug.current == $slug][0] 
        {
        _id,
        _createdAt,
        title,
        author,
        "slug": slug.current,
        "frontcover": frontcover.asset->url,
        alt,
        content,
        }`, {slug}
    )
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