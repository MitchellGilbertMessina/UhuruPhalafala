import { defineType, defineField } from "sanity";

export default defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",

  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      initialValue: "Site Settings"
    }),

    defineField({
      name: "homepageImages",
      title: "Homepage Images",
      type: "array",
      of: [
        {
          type: "image",
          options: {
            hotspot: true
          }
        }
      ]
    })
  ],

  preview: {
    select: {
      title: "title"
    }
  }
});