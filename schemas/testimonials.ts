import { defineType, defineField } from 'sanity'

export default defineType({
    name: 'testimonials',
    type: 'document',
    title: 'Testimonials',
    fields: [
        defineField({ name: 'name', type: 'string', title: 'Name', validation: Rule => Rule.required() }),
        defineField({ name: 'role', type: 'string', title: 'Role', validation: Rule => Rule.required() }),
        defineField({ name: 'desc', type: 'string', title: 'Description', validation: Rule => Rule.required() }),
    ]
})