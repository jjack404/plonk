import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      console.log('MongoDB already connected');
      return;
    }

    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('MONGODB_URI environment variable is not set');
      throw new Error('MONGODB_URI is not defined');
    }

    console.log('Attempting to connect to MongoDB...');
    
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 15000,
      maxPoolSize: 10,
      minPoolSize: 0
    });

    const db = mongoose.connection;

    db.on('connected', () => {
      console.log('MongoDB connected successfully');
    });

    db.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    db.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

  } catch (error: any) {
    console.error('MongoDB connection error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
};
