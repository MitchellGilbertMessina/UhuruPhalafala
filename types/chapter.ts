import { PortableTextBlock } from "next-sanity";

export type Chapter = {
  _id: string;
  title: string;
  contributor: string;
  slug: string;
  order: number;
  content: PortableTextBlock[];
  pdf: unknown;
};