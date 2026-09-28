const mongoose = require('mongoose');
const dns = require('dns');

dns.setServers(['8.8.8.8', '1.1.1.1']);

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai_faq_assistant';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });

    console.log(`[MongoDB] Connected to host: ${conn.connection.host}`);
    return conn;

  } catch (err) {
    console.warn(`[MongoDB] Primary MongoDB connection failed (${err.message}).`);
    console.log(`[MongoDB] Starting In-Memory MongoDB Server fallback for zero-config demonstration...`);

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const memoryUri = mongoServer.getUri();

      const conn = await mongoose.connect(memoryUri);

      console.log(`[MongoDB] Connected to In-Memory MongoDB at: ${memoryUri}`);
      return conn;

    } catch (memErr) {
      console.error(`[MongoDB] Memory server connection error:`, memErr.message);
      process.exit(1);
    }
  }
};

module.exports = connectDB;