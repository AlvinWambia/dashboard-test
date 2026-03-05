import { defineType, defineField } from 'sanity'

export default defineType({
    name: 'about',
    type: 'document',
    title: 'About',
    fields: [
        defineField({ name: 'name', type: 'string', title: 'Name', validation: Rule => Rule.required() }),
        defineField({ name: 'desc', type: 'string', title: 'Description', validation: Rule => Rule.required() }),
        defineField({
            name: 'image', type: 'image', title: 'About Image', options: { hotspot: true }, validation: Rule => Rule.required()
        }),
    ]
})