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

// Fetch allocations for a user (visible only when payment uploaded)
router.get('/users/:email/allocations', authMiddleware, async (req, res) => {
  try {
    const { email } = req.params;
    const orders = await Order.find({ email });
    const items = [];
    console.log("orders",orders);
    orders.forEach(o => {
      
       o.isPaymentUploaded &&((o.allocations || [])).forEach(a => {
        console.log("o.allocations",o.allocations);
        console.log("a",a);
        if (a.email === email) {
          items.push({
            orderId: String(o._id),
            allocationId: String(a._id),
            product: o.productName,
            price: o.price,
            quantity: a.quantity,
            address: a.address,
            date: o.date,
            link: o.link,
            email: a.email,
            ecommercePlatform: o.ecommercePlatform || '',
            isPlaced: o.isPlaced,
          });
        }
      })
    });
    console.log("allocations items",items);
    return res.json({ success: true, allocations: items });

  } catch (err) {
    console.error('fetch allocations error', err);
    return res.status(500).json({ success: false, message: 'Error fetching allocations' });
  }
});
module.exports = router;
