import mongoose, { Schema, Document} from 'mongoose';

export interface User extends Document { 
    username: string;
    email: string;
    passwordHash: string;
    createdAt: Date;
    updatedAt: Date;   
}

const userSchema = new Schema<User>({
    username:{required: true, type: String, unique: true},
    email:{required: true, type: String, unique: true},
    passwordHash:{required: true, type: String},    
},{
    timestamps: true
})

export default mongoose.model<User>('User', userSchema)
