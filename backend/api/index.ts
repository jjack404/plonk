import 'dotenv/config';
import express from 'express';
import cors from 'cors';
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

app.set('trust proxy', 1);

app.use(corsMiddleware);

app.options('*', cors());

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
});

// Only start the server in non-production
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app; 