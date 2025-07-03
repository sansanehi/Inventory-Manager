const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/authRoutes');

// Load environment variables
dotenv.config();

const app = express();

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// MongoDB connection with retry logic
const connectDB = async () => {
  const maxRetries = 5;
  let retries = 0;

  // Use environment variable with fallback
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/inventory-management';
  console.log('Attempting to connect to MongoDB at:', mongoURI);

  while (retries < maxRetries) {
    try {
      await mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
      });
      console.log('MongoDB connected successfully');
      break;
    } catch (error) {
      retries++;
      console.error(`MongoDB connection attempt ${retries} failed:`, error.message);
      if (retries === maxRetries) {
        console.error('Max retries reached. Could not connect to MongoDB');
        console.error('Please make sure MongoDB is running on your system');
        console.error('You can start MongoDB by running: mongod');
        process.exit(1);
      }
      console.log(`Retrying in 5 seconds... (Attempt ${retries}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};

// Start server
const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`Health check available at http://localhost:${PORT}/api/health`);
    });

    // Handle server errors
    server.on('error', (error) => {
      console.error('Server error:', error);
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please try a different port.`);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Don't crash the server, just log the error
}); 