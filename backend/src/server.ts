import 'dotenv/config'; // Load environment variables
import app from './app';
import connectDB from './config/db';

// Load configuration from .env
console.log
const PORT = process.env.PORT || 5000;
(async () => {
    await connectDB(); // Ensure database connection is established
    app.listen(PORT, () => {
        console.log(`Server is running successfully at port: ${PORT}`);
    });
})();
