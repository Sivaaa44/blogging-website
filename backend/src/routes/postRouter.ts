import express, { Router } from 'express';
import Post from '../models/Post'; 
import { authMiddleware } from '../middlewares/authMiddleware';
import { createPost, deletePost, getAllPosts, getPostById, getPostByTag, getPostByUser, searchPost, updatePost, uploadImage } from '../controllers/postController';
import { get } from 'http';
import upload from '../config/multerConfig';

const postRouter = Router();

postRouter.post('/', authMiddleware, createPost);
postRouter.get('/', getAllPosts);
postRouter.get('/:id', getPostById);
postRouter.put('/:id', authMiddleware, updatePost);
postRouter.delete('/:id', authMiddleware, deletePost);
postRouter.get('/tags/:tag', authMiddleware, getPostByTag);
postRouter.get('/tags', getAllPosts);
postRouter.get('/search/:query', searchPost);
postRouter.get('/user/posts/:userID', authMiddleware, getPostByUser);
postRouter.post('/upload-image', authMiddleware,upload.single('image'),uploadImage);



export default postRouter;

