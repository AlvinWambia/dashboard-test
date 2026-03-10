// schemas/program.ts
import { defineType, defineField } from 'sanity'

export default defineType({
    name: 'program',
    type: 'document',
    title: 'Programs',
    fields: [
        defineField({ name: 'title', type: 'string', title: 'Title', validation: Rule => Rule.required() }),
        defineField({ name: 'programId', type: 'string', title: 'Program ID' }),
        defineField({ name: 'description', type: 'text', title: 'Description' }),
        defineField({ name: 'image', type: 'image', title: 'Image', options: { hotspot: true } }),
        defineField({
            name: 'faqs',
            type: 'array',
            title: 'FAQs',
            of: [
                {
                    type: 'object',
                    fields: [
                        { name: 'question', type: 'string', title: 'Question' },
                        { name: 'answer', type: 'text', title: 'Answer' }
                    ]
                }
            ]
        })
    ]
})
