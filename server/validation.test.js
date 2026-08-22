const test = require('node:test');
const assert = require('node:assert/strict');
const { contactSchema, jobSchema, blogSchema } = require('./validation');

test('contact validation accepts a complete request', () => {
  const result = contactSchema.safeParse({ name: 'Bilal', email: 'bilal@example.com', message: 'I would like to work with HisabDo.' });
  assert.equal(result.success, true);
});

test('contact validation rejects invalid email and short message', () => {
  const result = contactSchema.safeParse({ name: 'B', email: 'invalid', message: 'short' });
  assert.equal(result.success, false);
});

test('job and blog schemas reject unsafe slugs', () => {
  assert.equal(jobSchema.safeParse({ title: 'Backend engineer', slug: 'Backend Engineer', description: 'A useful role description.', location: 'Remote', employmentType: 'full-time' }).success, false);
  assert.equal(blogSchema.safeParse({ title: 'Post', slug: 'valid-post', excerpt: 'A useful excerpt.', content: 'This is enough content for a blog post body.' }).success, true);
});
