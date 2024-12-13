import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      return;
    }

    await mongoose.connect(process.env.MONGODB_URI!, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      // Add these options for better serverless performance
      maxPoolSize: 10,
      minPoolSize: 0,
      maxIdleTimeMS: 5000,
      waitQueueTimeoutMS: 5000
    });

    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to database:', error);
    throw error;
  }
};
