import { defineType, defineField } from 'sanity'

export default defineType({
    name: 'loungewear',
    type: 'document',
    title: 'Loungewear',
    fields: [
        defineField({ name: 'name', type: 'string', title: 'Product Name', validation: Rule => Rule.required() }),
        defineField({ name: 'price', type: 'number', title: 'Price', validation: Rule => Rule.required() }),
        defineField({
            name: 'image', type: 'image', title: 'Product Image', options: { hotspot: true }, validation: Rule => Rule.required()
        }),
        defineField({ name: 'desc', type: 'text', title: 'Description' }),
        defineField({ name: 'link', type: 'url', title: 'Purchase Link' })
    ]
})
