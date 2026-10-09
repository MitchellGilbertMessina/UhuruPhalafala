
import { defineField, defineType } from "sanity";

export const imageChapter = defineType({
  name: "imageChapter",
  title: "Image Chapter",
  type: "document",

  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "contributor",
      title: "Contributor",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "contributor",
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "order",
      title: "Chapter order",
      type: "number",
    }),

    defineField({
      name: "pages",
      title: "Publication pages",
      description:
        "Upload WebP pages in reading order, from the beginning of the chapter to the end.",
      type: "array",
      of: [
        {
          type: "image",
          options: {
            hotspot: false,
          },
          fields: [
            {
              name: "pageNumber",
              title: "Printed page number",
              type: "number",
            },
            {
              name: "alt",
              title: "Alt text",
              type: "string",
            },
          ],
        },
      ],
      validation: (Rule) => Rule.min(1),
    }),

    defineField({
      name: "pdf",
      title: "Chapter PDF",
      type: "file",
      options: {
        accept: ".pdf",
      },
    }),
  ],
});