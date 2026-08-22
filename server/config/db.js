const mongoose = require('mongoose');

let connectionPromise;

function connectDatabase() {
  if (!process.env.MONGODB_URI) {
    return Promise.resolve(null);
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGODB_URI, {
      // Local, low-concurrency API default; tune from observed traffic in production.
      maxPoolSize: 10,
      minPoolSize: 0,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000,
    }).catch((error) => {
      connectionPromise = undefined;
      throw error;
    });
  }

  return connectionPromise;
}

module.exports = { connectDatabase };
