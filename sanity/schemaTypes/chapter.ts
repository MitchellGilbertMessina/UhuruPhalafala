import {defineField, defineType} from 'sanity'

export const chapter = defineType({
  name: 'chapter',
  title: 'Chapter',
  type: 'document',

  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'contributor',
      title: 'Contributor',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'contributor',
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
    }),

    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [
        {
          type: 'block',
        },
        {
          type: 'image',
          fields: [
            {
              name: 'caption',
              title: 'Caption',
              type: 'string',
            },
            {
              name: 'credit',
              title: 'Credit',
              type: 'string',
            },
            {
              name: 'alt',
              title: 'Alt text',
              type: 'string',
            },
          ],
        },
      ],
    }),

    defineField({
      name: 'pdf',
      title: 'Chapter PDF',
      type: 'file',
    }),
  ],
})