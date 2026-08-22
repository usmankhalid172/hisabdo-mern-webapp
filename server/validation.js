const { z } = require('zod');

const id = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid MongoDB id');
const slug = z.string().trim().min(2).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use a URL-safe slug');
const email = z.string().trim().email().max(254);

const contactSchema = z.object({ name: z.string().trim().min(2).max(100), email, company: z.string().trim().max(120).optional(), message: z.string().trim().min(10).max(5000) });
const jobSchema = z.object({ title: z.string().trim().min(2).max(160), slug, description: z.string().trim().min(10).max(10000), location: z.string().trim().min(2).max(120), employmentType: z.enum(['full-time', 'part-time', 'contract', 'internship']), isOpen: z.boolean().optional() });
const blogSchema = z.object({ title: z.string().trim().min(2).max(180), slug, excerpt: z.string().trim().min(10).max(500), content: z.string().trim().min(20).max(50000), published: z.boolean().optional(), publishedAt: z.coerce.date().optional() });
const applicationSchema = z.object({ name: z.string().trim().min(2).max(100), email, resumeUrl: z.string().url().max(2048).optional(), message: z.string().trim().max(5000).optional() });
const loginSchema = z.object({ email, password: z.string().min(8).max(200) });

module.exports = { id, contactSchema, jobSchema, blogSchema, applicationSchema, loginSchema };
