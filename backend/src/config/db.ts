import mongoose from 'mongoose';
import 'dotenv/config'; 

const connectDB = async (): Promise<void> => {
    try {
        const mongoUri = process.env.MONGODB_URI as string;
        if (!mongoUri) {
            throw new Error('MONGO_URI is not defined in the environment variables');
        }
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB successfully!');
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1); 
    }
};

export default connectDB;
