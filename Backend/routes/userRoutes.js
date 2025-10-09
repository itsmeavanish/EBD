const express = require("express");
const router = express.Router();
const { createUser, loginUser, getAllUsers } = require("../controllers/UserController.js");
const { User } = require("../models/User.js");  // ✅ make sure User.js exports { User }
const authMiddleware = require("../middleware/authMiddleware.js");
const {Order} = require("../models/Order"); // Import Order model
// User registration
router.post("/register", createUser);

// User login
router.post("/login", loginUser);
router.put("/orders/:id", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    res.json({ success: true, order });
  } catch (err) {
    console.error("Error updating order:", err);
    res.status(500).json({ success: false, message: "Error updating order" });
  }
});
//get all users


module.exports = router;
