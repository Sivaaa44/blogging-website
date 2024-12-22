
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import cloudinary from "./cloudinary";

const storage = new CloudinaryStorage({
    cloudinary : cloudinary,
    params : {
        folder : 'blog_posts',
        allowedFormats : ['jpg', 'png', 'jpeg'],
        transformation : [{ width : 1000, crop  : "limit"}]
    }as any
});

const upload = multer({ storage : storage });

export default upload;  