const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

// Create a new order
router.post('/', auth, async (req, res) => {
  try {
    // Validate required fields
    const { items, totalAmount } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ message: 'Invalid total amount' });
    }

    // Verify product existence and stock
    for (const item of items) {
      if (!item.product) {
        return res.status(400).json({ message: 'Product ID is required for each item' });
      }

      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({ message: `Product with ID ${item.product} not found` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}` 
        });
      }
    }

    // Create order with user ID from auth middleware
    const order = new Order({
      ...req.body,
      user: req.user._id
    });

    // Update product stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    await order.save();
    
    // Populate product details before sending response
    const populatedOrder = await Order.findById(order._id)
      .populate('items.product')
      .populate('user', 'name email');

    res.status(201).json(populatedOrder);
  } catch (error) {
    console.error('Order creation error:', error);
    
    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: Object.values(error.errors).map(err => err.message).join(', ')
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: 'Invalid product ID format'
      });
    }

    res.status(400).json({ 
      message: error.message || 'Failed to create order'
    });
  }
});

// Get all orders (admin only)
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('items.product')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's orders
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific order
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product')
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is authorized to view this order
    if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update an order
router.put('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is authorized to update this order
    if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }

    // Only allow updating certain fields
    const allowedUpdates = ['shippingAddress', 'paymentStatus', 'status'];
    const updates = Object.keys(req.body)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    ).populate('items.product');

    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update order status (admin only)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update order status' });
    }

    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('items.product');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 