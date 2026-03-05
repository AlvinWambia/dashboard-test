import { defineConfig } from 'sanity';
import { deskTool } from 'sanity/desk';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemas';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;

if (!projectId) {
    throw new Error("The `NEXT_PUBLIC_SANITY_PROJECT_ID` environment variable is not set. See the `.env.local.example` file for details.");
}

export default defineConfig({
    name: 'default',
    title: 'My Admin Dashboard',

    projectId: projectId,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',

    basePath: '/studio', // This matches the folder we will create

    plugins: [deskTool(), visionTool()],

    schema: {
        types: schemaTypes,
    },
})