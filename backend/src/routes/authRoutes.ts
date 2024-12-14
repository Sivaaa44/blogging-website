import express from 'express';
import { signup, login } from '../controllers/authController';

const authRouter = express.Router();

// User registration
authRouter.post('/signup', signup);

// User login
authRouter.post('/login', login);

export default authRouter;
