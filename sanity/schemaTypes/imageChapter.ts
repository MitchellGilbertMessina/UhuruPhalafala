import { defineArrayMember, defineField, defineType } from "sanity";

export const imageChapter = defineType({
  name: "imageChapter",
  title: "Contribution",
  type: "document",

  orderings: [
    { title: "Book order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
  ],

  preview: {
    select: { title: "contributor", subtitle: "title", open: "open" },
    prepare: ({ title, subtitle, open }) => ({
      title,
      subtitle: `${open ? "● Open" : "○ Closed"} · ${(subtitle ?? "").replace(/\n/g, " / ")}`,
    }),
  },

  fields: [
    defineField({
      name: "title",
      title: "Title",
      description: "For two titles (for example, two poems), put each on its own line.",
      type: "text",
      rows: 2,
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
      options: { source: "contributor" },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "order",
      title: "Order in the book",
      type: "number",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "open",
      title: "Open on the site",
      description:
        "On: clickable, with its pages, recordings or video available on the website. Off: listed in the contents but greyed out.",
      type: "boolean",
      initialValue: false,
    }),

    defineField({
      name: "intro",
      title: "Accompanying text",
      description:
        "The short copy framing this material as an accompaniment to the book. Separate paragraphs with a blank line.",
      type: "text",
      rows: 5,
    }),

    defineField({
      name: "pages",
      title: "Publication pages",
      description:
        "Only for contributions readable in full on the site. Upload WebP pages in reading order.",
      type: "array",
      of: [
        {
          type: "image",
          options: { hotspot: false },
          fields: [
            { name: "pageNumber", title: "Printed page number", type: "number" },
            { name: "alt", title: "Alt text", type: "string" },
          ],
        },
      ],
    }),

    defineField({
      name: "pdf",
      title: "Contribution PDF",
      description:
        "Only add this when the contribution should be readable and downloadable. It also powers the selectable text.",
      type: "file",
      options: { accept: ".pdf" },
    }),

    defineField({
      name: "media",
      title: "Audiovisual material",
      description: "Shown in the order listed here.",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "audio",
          title: "Audio recording",
          fields: [
            defineField({ name: "title", type: "string" }),
            defineField({
              name: "file",
              title: "MP3 file",
              type: "file",
              options: { accept: "audio/*" },
              validation: (Rule) => Rule.required(),
            }),
            defineField({ name: "transcript", type: "text" }),
          ],
          preview: {
            select: { title: "title" },
            prepare: ({ title }) => ({ title: title || "Untitled recording", subtitle: "Audio recording" }),
          },
        }),

        defineArrayMember({
          type: "object",
          name: "video",
          title: "Video (YouTube or Vimeo)",
          fields: [
            defineField({ name: "title", type: "string" }),
            defineField({
              name: "url",
              type: "url",
              description: "The YouTube or Vimeo link",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "poster",
              title: "Poster image",
              description:
                "Optional. Shown before the video plays. For YouTube, the video's thumbnail is used if this is blank.",
              type: "image",
            }),
          ],
          preview: {
            select: { title: "title", subtitle: "url" },
            prepare: ({ title, subtitle }) => ({ title: title || "Untitled video", subtitle }),
          },
        }),

        defineArrayMember({
          type: "object",
          name: "slideshow",
          title: "Slideshow with audio",
          fields: [
            defineField({ name: "title", type: "string" }),
            defineField({
              name: "file",
              title: "Audio (MP3)",
              type: "file",
              options: { accept: "audio/*" },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "images",
              title: "Images (even timing)",
              description:
                "Drag all the images in at once. They advance at an even pace across the whole recording. Check the order afterwards and drag to reorder if needed.",
              type: "array",
              of: [
                defineArrayMember({
                  type: "image",
                  fields: [
                    defineField({ name: "alt", title: "Alt text", type: "string" }),
                    defineField({ name: "caption", type: "string" }),
                  ],
                }),
              ],
              options: { layout: "grid" },
            }),
            defineField({
              name: "slideDuration",
              title: "Seconds per slide",
              description: "Optional. Leave blank to spread the images evenly over the whole recording.",
              type: "number",
              validation: (Rule) => Rule.min(1),
            }),
            defineField({
              name: "slides",
              title: "Slides (custom timing, optional)",
              type: "array",
              of: [
                defineArrayMember({
                  type: "object",
                  name: "slide",
                  fields: [
                    defineField({
                      name: "image",
                      type: "image",
                      validation: (Rule) => Rule.required(),
                    }),
                    defineField({
                      name: "startTime",
                      title: "Appears at",
                      description: "When this slide appears in the recording, as m:ss. The first slide is 0:00.",
                      type: "string",
                      validation: (Rule) =>
                        Rule.required().regex(/^(\d+:)?\d{1,2}:\d{2}$/, "Use m:ss, for example 1:05"),
                    }),
                    defineField({ name: "alt", title: "Alt text", type: "string" }),
                    defineField({ name: "caption", type: "string" }),
                  ],
                  preview: {
                    select: { title: "startTime", subtitle: "caption", media: "image" },
                  },
                }),
              ],
            }),
            defineField({ name: "transcript", type: "text" }),
          ],
          preview: {
            select: { title: "title" },
            prepare: ({ title }) => ({ title: title || "Slideshow", subtitle: "Slideshow with audio" }),
          },
        }),
      ],
    }),
  ],
});