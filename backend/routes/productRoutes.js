const express = require("express");
const router = express.Router();
const upload = require("../utils/imageUpload");
const { protect } = require("../middleware/authMiddleware");
const cloudinary = require("../config/cloudinary.config");
const productController = require("../controllers/productController");

// Route for adding a product (with image upload)
router.post("/create", protect, productController.addProduct);

// Get all products
router.get("/", productController.getProducts);

// Get single product
router.get("/:id", productController.getProduct);

// Create product (without image upload)
router.post("/", protect, productController.addProduct);

// Update product
router.put("/:id", protect, productController.updateProduct);

// Delete product
router.delete("/:id", protect, productController.deleteProduct);

module.exports = router;
