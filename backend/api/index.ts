import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import { connectDB } from '../config/database';
import { errorHandler } from '../middleware/errorHandler';
import { apiLimiter } from '../middleware/rateLimiter';
import profileRoutes from '../routes/profile';
import dropsRouter from '../routes/drops';
import tokenRoutes from '../routes/tokens';
import { corsMiddleware } from '../middleware/cors';

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy for Vercel
app.set('trust proxy', 1);

// Apply CORS middleware first, remove duplicate cors usage
app.use(corsMiddleware);

// Body parser middleware
app.use(bodyParser.json());
app.use('/api/', apiLimiter);

// Routes
app.use('/api/profile', profileRoutes);
app.use('/api/drops', dropsRouter);
app.use('/api/tokens', tokenRoutes);

// Error handling
app.use(errorHandler);

// Connect to database
connectDB().catch(err => {
  console.error('Failed to connect to database:', err);
  process.exit(1); // Exit if DB connection fails
});

// Start server in all environments
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app; 