import express from 'express';
import cors from 'cors';
import authRouter from './routes/authRoutes';
import postRouter from './routes/postRouter';
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api/post',postRouter)

export default app;
