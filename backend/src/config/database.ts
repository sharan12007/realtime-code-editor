import mongoose from 'mongoose';

export const connectDatabase = async (mongoUri: string) => {
  mongoose.set('strictQuery', true);
  await mongoose.connect(mongoUri, {
    maxPoolSize: 20,
    minPoolSize: 5,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000
  });
};

export const disconnectDatabase = async () => {
  await mongoose.disconnect();
};
