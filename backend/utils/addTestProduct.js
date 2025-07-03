const mongoose = require('mongoose');
const Product = require('../models/Product');

const testProduct = {
  name: "Free Test Product",
  description: "This is a free test product for inventory management testing. Perfect for testing order tracking and inventory updates.",
  price: 0,
  image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80",
  stock: 100,
  category: "Test",
  featured: true,
  specifications: {
    "Type": "Test Product",
    "Availability": "In Stock",
    "Condition": "New"
  },
  colors: ["White", "Black"],
  rating: 4.5,
  reviews: 10
};

const addTestProduct = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/inventory-management');
    console.log('Connected to MongoDB');

    // Check if test product already exists
    const existingProduct = await Product.findOne({ name: testProduct.name });
    if (existingProduct) {
      console.log('Test product already exists');
      return;
    }

    // Create new test product
    const product = await Product.create(testProduct);
    console.log('Test product added successfully:', product);

  } catch (error) {
    console.error('Error adding test product:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the script
addTestProduct(); 