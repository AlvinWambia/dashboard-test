import { defineType, defineField } from 'sanity'

export default defineType({
    name: 'about',
    type: 'document',
    title: 'About',
    fields: [
        defineField({ name: 'name', type: 'string', title: 'Name', validation: Rule => Rule.required() }),
        // Temporarily using fields from testimonials.ts for debugging
        defineField({ name: 'role', type: 'string', title: 'Role', validation: Rule => Rule.required() }),
        defineField({ name: 'desc', type: 'string', title: 'Description', validation: Rule => Rule.required() }),
    ]
})