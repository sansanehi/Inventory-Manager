const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const orderController = require("../controllers/orderController");

// Get all orders
router.get("/", protect, orderController.getAllOrders);

// Create new order
router.post("/", protect, orderController.createOrder);

// Update order status
router.patch("/:id/status", protect, orderController.updateOrderStatus);

// Get single order
router.get("/:id", protect, orderController.getOrderById);

module.exports = router;
