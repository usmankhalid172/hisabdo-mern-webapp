const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Contact = require('../models/Contact');
const Job = require('../models/Job');
const BlogPost = require('../models/BlogPost');
const JobApplication = require('../models/JobApplication');
const { requireAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { id, contactSchema, jobSchema, blogSchema, applicationSchema, loginSchema } = require('../validation');

const router = express.Router();

function requireDatabase(req, res, next) {
  if (req.app.locals.databaseReady) return next();
  return res.status(503).json({ error: 'Database is not configured or unavailable' });
}

router.get('/health', (req, res) => res.json({ status: 'ok', database: req.app.locals.databaseReady ? 'connected' : 'not-configured' }));

router.post('/admin/login', validate(loginSchema), (req, res) => {
  const emailMatches = req.body.email === process.env.ADMIN_EMAIL;
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;
  if (!emailMatches || !passwordHash || !process.env.JWT_SECRET || !bcrypt.compareSync(req.body.password, passwordHash)) {
    return res.status(401).json({ error: 'Invalid admin credentials' });
  }
  const token = jwt.sign({ email: req.body.email, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '8h' });
  return res.json({ token, expiresIn: '8h' });
});

router.post('/contact', requireDatabase, validate(contactSchema), async (req, res) => {
  const contact = await Contact.create(req.body);
  return res.status(201).json({ data: contact });
});
router.get('/contact', requireAdmin, requireDatabase, async (req, res) => res.json({ data: await Contact.find().sort({ createdAt: -1 }).lean() }));
router.patch('/contact/:id', requireAdmin, requireDatabase, async (req, res) => {
  const parsed = id.safeParse(req.params.id);
  if (!parsed.success || !['new', 'read', 'archived'].includes(req.body.status)) return res.status(400).json({ error: 'Invalid contact status or id' });
  const contact = await Contact.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
  return contact ? res.json({ data: contact }) : res.status(404).json({ error: 'Contact not found' });
});
deleteRoute('/contact/:id', Contact);

router.get('/jobs', requireDatabase, async (req, res) => {
  const filter = req.query.includeClosed === 'true' ? {} : { isOpen: true };
  return res.json({ data: await Job.find(filter).sort({ createdAt: -1 }).lean() });
});
router.get('/jobs/:slug', requireDatabase, async (req, res) => {
  const job = await Job.findOne({ slug: req.params.slug, isOpen: true }).lean();
  return job ? res.json({ data: job }) : res.status(404).json({ error: 'Job not found' });
});
router.post('/jobs', requireAdmin, requireDatabase, validate(jobSchema), async (req, res) => res.status(201).json({ data: await Job.create(req.body) }));
router.put('/jobs/:id', requireAdmin, requireDatabase, validate(jobSchema.partial()), updateById(Job));
deleteRoute('/jobs/:id', Job);
router.post('/jobs/:slug/applications', requireDatabase, validate(applicationSchema), async (req, res) => {
  const job = await Job.findOne({ slug: req.params.slug, isOpen: true }).select('_id').lean();
  if (!job) return res.status(404).json({ error: 'Open job not found' });
  return res.status(201).json({ data: await JobApplication.create({ ...req.body, job: job._id }) });
});
router.get('/jobs/:id/applications', requireAdmin, requireDatabase, async (req, res) => {
  const parsed = id.safeParse(req.params.id);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid MongoDB id' });
  return res.json({ data: await JobApplication.find({ job: req.params.id }).sort({ createdAt: -1 }).lean() });
});

router.get('/blog', requireDatabase, async (req, res) => res.json({ data: await BlogPost.find({ published: true }).sort({ publishedAt: -1, createdAt: -1 }).lean() }));
router.get('/blog/:slug', requireDatabase, async (req, res) => {
  const post = await BlogPost.findOne({ slug: req.params.slug, published: true }).lean();
  return post ? res.json({ data: post }) : res.status(404).json({ error: 'Blog post not found' });
});
router.post('/blog', requireAdmin, requireDatabase, validate(blogSchema), async (req, res) => res.status(201).json({ data: await BlogPost.create(req.body) }));
router.put('/blog/:id', requireAdmin, requireDatabase, validate(blogSchema.partial()), updateById(BlogPost));
deleteRoute('/blog/:id', BlogPost);

function updateById(Model) {
  return async (req, res) => {
    const parsed = id.safeParse(req.params.id);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid MongoDB id' });
    const record = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    return record ? res.json({ data: record }) : res.status(404).json({ error: 'Record not found' });
  };
}

function deleteRoute(path, Model) {
  router.delete(path, requireAdmin, requireDatabase, async (req, res) => {
    const parsed = id.safeParse(req.params.id);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid MongoDB id' });
    const record = await Model.findByIdAndDelete(req.params.id);
    return record ? res.status(204).send() : res.status(404).json({ error: 'Record not found' });
  });
}

module.exports = router;
