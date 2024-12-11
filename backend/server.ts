import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { connectDB } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';
import profileRoutes from './routes/profile';
import dropRoutes from './routes/drops';
import tokenRoutes from './routes/tokens';

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
  origin: ['https://plonk-frontend.vercel.app', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT'],
  allowedHeaders: ['Content-Type', 'wallet-address']
}));

app.use(bodyParser.json());
app.use('/api/', apiLimiter);

// Routes
app.use('/api/profile', profileRoutes);
app.use('/api/drops', dropRoutes);
app.use('/api/tokens', tokenRoutes);

// Error handling
app.use(errorHandler);

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to connect to database:', err);
  process.exit(1);
});

export default app;