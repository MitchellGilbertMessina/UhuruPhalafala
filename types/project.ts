import { PortableTextBlock } from "next-sanity";

export type Project = {
    _id: string;
    _createdAt: Date;
    title: string;
    author: string;
    slug: string;
    frontcover: string;
    alt: string;
    content: PortableTextBlock[];
}