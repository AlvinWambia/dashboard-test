import { defineType, defineField } from 'sanity'

export default defineType({
    name: 'product',
    type: 'document',
    title: 'Products',
    fields: [
        defineField({ name: 'name', type: 'string', title: 'Product Name', validation: Rule => Rule.required() }),
        defineField({ name: 'price', type: 'number', title: 'Price', validation: Rule => Rule.required() }),
        defineField({
            name: 'image', type: 'image', title: 'Product Image', options: { hotspot: true }, validation: Rule => Rule.required()
        }),
        // The fields below were in your query but not your schema.
        // It's good practice to have them match.
        defineField({ name: 'desc', type: 'string', title: 'Description' }),
        defineField({ name: 'rating', type: 'number', title: 'Rating (1-5)', validation: Rule => Rule.min(1).max(5) }),
        defineField({ name: 'reviews', type: 'number', title: 'Number of Reviews' }),
    ]
})