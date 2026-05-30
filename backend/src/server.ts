import { createServer } from 'node:http';
import mongoose from 'mongoose';
import { createApp } from './app.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { env } from './config/env.js';
import { createSocketServer } from './infrastructure/socket/socket.server.js';

const app = createApp();
const server = createServer(app);
const io = createSocketServer(server);

const shutdown = async (signal: string) => {
  console.log(`Received ${signal}. Shutting down...`);
  io.close();
  server.close(async () => {
    await disconnectDatabase();
    process.exit(0);
  });
};

const bootstrap = async () => {
  await connectDatabase(env.mongoUri);

  server.listen(env.port, () => {
    console.log(`backend+socket listening on :${env.port}`);
  });
};

bootstrap().catch(async (error) => {
  console.error('Failed to bootstrap backend', error);
  if (mongoose.connection.readyState !== 0) await disconnectDatabase();
  process.exit(1);
});

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
