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

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: [
    'https://plonk-frontend.vercel.app',
    'http://localhost:5173'
  ],
  methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'wallet-address'],
  credentials: true
}));

app.use(bodyParser.json());
app.use('/api/', apiLimiter);

// Routes
app.use('/api/profile', profileRoutes);
app.use('/api/drops', dropsRouter);
app.use('/api/tokens', tokenRoutes);

// Error handling
app.use(errorHandler);

// Connect to database
if (process.env.NODE_ENV !== 'production') {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  }).catch(err => {
    console.error('Failed to connect to database:', err);
  });
}

export default app; 