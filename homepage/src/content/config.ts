import { defineCollection, z } from "astro:content";

const legal = defineCollection({
  schema: z.object({
    title: z.string(),
    updated: z.string(),
  }),
});

const blog = defineCollection({
  schema: z.object({
    id: z.string(),
    number: z.number(),
    date: z.coerce.date(),
    timestamp: z.string(),
    title: z.string(),
    excerpt: z.string().optional(),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().optional(),
    readTime: z.number().optional(),
    author: z.string()
  }),
});

export const collections = {
  legal: legal,
  blog: blog,
};
