import mongoose from 'mongoose';

// Function to connect to the database
export const connectDB = async () => {
    try {
        // Connection event handlers
        mongoose.connection.on('connected', () => {
            console.log('✅ MongoDB Database is connected');
        });

        mongoose.connection.on('error', (error) => {
            console.error('❌ MongoDB connection error:', error);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('⚠️ MongoDB Database disconnected');
        });

        // Connect with optimized options
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: 'chat-app',
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            retryWrites: true,
            w: 'majority',
            maxPoolSize: 10,
            minPoolSize: 2,
        });

        console.log('✅ Database connection established successfully');
    } catch (error) {
        console.error('❌ Failed to connect to MongoDB:', error.message);
        process.exit(1);
    }
};