import {Request,Response} from "express";
import Post from "../models/Post";
import {v2 as cloudinary} from "cloudinary";
import multer from 'multer'
import { CloudinaryStorage } from "multer-storage-cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

const storage = new CloudinaryStorage({
    cloudinary : cloudinary,
    params : {
        folder : 'blog_posts',
        allowedFormats : ['jpg', 'png', 'jpeg'],
        transformation : [{ width : 1000, crop  : "limit"}]
    }as any
})


export const createPost = async (req : any, res : Response)=>{
    const {title, content, published, tags} = req.body;
    try{
        const newPost = new Post({
            title,
            content,
            tags,
            author: req.user.id,
            published
        });
        await newPost.save();
        res.status(201).json({ msg : "Post created successfully"});
    }catch(err){
        console.log(err);
        res.status(500).json({ error: 'Failed to create post' });
    }
}

export const getAllPosts = async(_req : any, res : Response) => {
    try{
        const posts  = await Post.find({}).populate('author', 'username');
        res.status(201).json(posts)
    }catch(error){
        console.log(error);
        res.status(500).json({ error: 'Failed to get posts' });
    }
}

export const updatePost = async(req : any, res :Response) => {
    const {title, content, published, tags} = req.body;
    try{
        const post = await Post.findById(req.params.id);
        if(!post) return res.status(404).json({ error: 'Post not found' });
        if(post.author.toString() !== req.user.id) return res.status(401).json({msg :"unauthroised access"});
        post.title = title || post.title;
        post.content = content || post.content;
        post.tags = tags || post.tags;
        post.published = published !== undefined ? published : post.published;
        const updatedPost  = await post.save();
        res.status(201).json(updatedPost);
    }catch(error){
        console.log(error);
        res.status(500).json({msg : "failed to update the post"});
    }
}

export const getPostById = async(req : any, res : Response) => {
    try{
        const post = await Post.findById(req.params.id).populate('author', 'username');
        if(!post) return res.status(404).json({ error: 'post not found'});
        res.status(201).json(post);
    }catch(error){
        console.log(error);
        res.status(500).json({ error: 'Failed to get post' });  
    }
}

export const deletePost = async(req : any, res : Response) => { 
    try{
        const post = await Post.findById(req.params.id);
        if(!post) return res.status(404).json({ error: " post not found to delete "});
        if(post.author.toString() !== req.user.id) return res.status(401).json({msg :"unauthroised access"});
        await post.deleteOne();
        res.status(201).json({msg : "post deleted successfully"});  
    }catch(error){
        console.log(error);
        res.status(500).json({ error: 'Failed to delete post' });
    }
}

export const getPostByTag = async(req: any, res: Response) => {
    const {tag} = req.params;
    console.log(tag);
    try{
        const posts = await Post.find({ tags : tag}).populate('author', 'username');
        if(posts.length === 0) return res.status(404).json({ error: "post not found"});
        res.status(201).json(posts);
    }catch(error){
        console.log(error);
        res.status(500).json({ error: 'Failed to get posts' });
    }
}


export const getAllTags = async (_req: any, res: Response) => {
    try {
        const tags = await Post.distinct('tags'); 
        res.status(200).json(tags);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch tags" });
    }
};


export const searchPost  = async(req :any , res : Response) => { 
    const { query } = req.params;
    if(!query) return res.status(404).json({ error: "query not found"});
    try{
        const posts = await Post.find({
            $or: [
                {
                    title: { $regex: query, $options: 'i' }
                },
                {
                    content: { $regex: query, $options: 'i' }
                },
                {
                    tags: { $regex: query, $options: 'i' }
                }
            ]
        }).populate('author', 'username');
        if(posts.length === 0) return res.status(404).json({ error: "post not found"});
        res.status(201).json(posts);
    }catch(error){
        console.log(error);
        res.status(500).json({ error: 'Failed to delete post' });
    }
}

export const getPostByUser = async(req: any, res: Response) => {
    try {
        const {userId} = req.params || req.user.id; 
        const posts = await Post.find({ author: userId }).populate('author', 'username');
        console.log(posts);
    
        if (posts.length === 0) {
          return res.status(404).json({ error: 'No posts found for this user' });
        }
    
        res.status(200).json(posts);
      } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Failed to fetch posts' });
      }
}

export const uploadImage = async(req : any, res : Response): Promise<void> => {
    try{
        if(!req.file){
            res.status(400).json({msg : "no image file provided"});
            return;
        }

        const imageUrl = req.file.path;
        
        res.json({
            url : imageUrl,
            msg : "image uploaded successfully",
        })

    }catch(error){
        console.error("image upload error", error);
        res.status(500).json({ error: 'Failed to upload image' });
    }
}