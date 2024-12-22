import mongoose, { Schema, Document } from 'mongoose';

export interface Post extends Document {
    title: string;
    coverImage?: string;
    content: string;
    tags : string[];
    author: mongoose.Schema.Types.ObjectId;
    published: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const PostSchema = new Schema<Post>({
    title: { type: String, required: true },
    coverImage: { type: String },
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    tags:[{type: String}],
    published: { type: Boolean, required: true }
},
{
    timestamps: true
});

export default mongoose.model<Post>('Post', PostSchema);

