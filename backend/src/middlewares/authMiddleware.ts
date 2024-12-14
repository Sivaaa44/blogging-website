import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { NextFunction, Response } from 'express';
export const authMiddleware = (req: any, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.split(' ')[1]; // Bearer Token
      if (!token) return res.status(401).json({ error: 'No token provided' });
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
      req.user = decoded;
      console.log(req.user);
      next();
    } catch (err) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };
  
