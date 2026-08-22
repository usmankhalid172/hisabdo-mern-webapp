require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const api = require('./routes/api');
const { connectDatabase } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errors');

function createApp() {
  const app = express();
  app.locals.databaseReady = false;
  app.use(helmet());
  app.use(cors({ origin: process.env.FRONTEND_ORIGIN?.split(',').map((origin) => origin.trim()) || true }));
  app.use(express.json({ limit: '100kb' }));
  app.use('/api', api);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}

async function initializeApp(app) {
  if (process.env.MONGODB_URI) {
    await connectDatabase();
    app.locals.databaseReady = true;
  }
  return app;
}

module.exports = { createApp, initializeApp };
