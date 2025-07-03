const express = require("express");
const router = express.Router();
const upload = require("../utils/imageUpload");
const { protect } = require("../middleware/authMiddleware");
const cloudinary = require("../config/cloudinary.config");
const Product = require("../models/Product");

// Route for uploading an image
router.post("/create", upload.single("image"), protect, async (req, res) => {
  try {
    const schema = joi.object({
      product: joi.string().required().max(30).min(2),
      category: joi.string().required(),
      price: joi.string().required(),
      quantity: joi.number().required(),
      description: joi.string().required().max(250).min(15),
      // image: joi.string().required()
    });
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json(error.details[0].message);

    const { product, category, price, quantity, description } = req.body;

    const productExists = await Product.findOne({ product: req.body.product });
    if (productExists) return res.status(400).json("Product already exists");

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "stock",
    });

    let new_product = new Product({
      product,
      category,
      price,
      quantity,
      description,
      slug: product,
      image: result.secure_url,
      cloudinary_id: result.public_url,
    });

    await new_product.save();
    return res.status(201).json("Product has been saved.");
  } catch (error) {
    return res.status(500).json(error.message);
  }
});

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Failed to fetch product' });
  }
});

// Create product
router.post('/', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Failed to create product' });
  }
});

// Update product
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Failed to update product' });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Failed to delete product' });
  }
});

module.exports = router;
