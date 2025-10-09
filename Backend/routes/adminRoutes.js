// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const { User } = require("../models/User");
const { Order } = require("../models/Order");
const { Refund } = require("../models/Refund");

// Get all users
router.get("/users", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select("-password"); // exclude password
    res.json({ success: true, users });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ success: false, message: "Error fetching users" });
  }
});

// Get all orders with filters
router.get("/orders", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { startDate, endDate, brandName, status } = req.query;
    let query = {};

    if (startDate && endDate) {
      query.submittedAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (brandName && brandName !== 'all') {
      query.brandName = brandName;
    }

    if (status === 'placed') {
      query.isPlaced = true;
    } else if (status === 'confirmed') {
      query.isConfirmed = true;
    }

    const orders = await Order.find(query).sort({ submittedAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ success: false, message: "Error fetching orders" });
  }
});

// Update order status
router.put("/orders/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    res.json({ success: true, order });
  } catch (err) {
    console.error("Error updating order:", err);
    res.status(500).json({ success: false, message: "Error updating order" });
  }
});

// Bulk allot orders to users
router.post("/orders/bulk-allot", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { orderIds, userId, userName, userEmail } = req.body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ success: false, message: "Order IDs array is required" });
    }

    if (!userId || !userName || !userEmail) {
      return res.status(400).json({ success: false, message: "User information is required" });
    }

    const existingOrders = await Order.find({ _id: { $in: orderIds } });
    const alreadyAlloted = existingOrders.filter(order => order.isAlloted);

    if (alreadyAlloted.length > 0) {
      return res.status(400).json({
        success: false,
        message: `${alreadyAlloted.length} order(s) are already allotted`,
        alreadyAllotedIds: alreadyAlloted.map(o => o._id)
      });
    }

    const result = await Order.updateMany(
      { _id: { $in: orderIds }, isAlloted: false },
      {
        $set: {
          isAlloted: true,
          userId: userId,
          userName: userName,
          email: userEmail
        }
      }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} orders alloted successfully`,
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    console.error("Error bulk allotting orders:", err);
    res.status(500).json({ success: false, message: "Error bulk allotting orders" });
  }
});

// Get payment history for a user
router.get("/users/:userId/payment-history", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId: userId, isPlaced: true }).sort({ submittedAt: -1 });

    const totalAmount = orders.reduce((sum, order) => sum + (order.price || 0), 0);

    res.json({
      success: true,
      orders,
      totalAmount,
      orderCount: orders.length
    });
  } catch (err) {
    console.error("Error fetching payment history:", err);
    res.status(500).json({ success: false, message: "Error fetching payment history" });
  }
});

// Delete an order
router.delete("/orders/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    res.json({ success: true, message: "Order deleted successfully" });
  } catch (err) {
    console.error("Error deleting order:", err);
    res.status(500).json({ success: false, message: "Error deleting order" });
  }
});

// Get all refunds
router.get("/refunds", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const refunds = await Refund.find(); 
    res.json({ success: true, refunds });
  } catch (err) {
    console.error("Error fetching refunds:", err);
    res.status(500).json({ success: false, message: "Error fetching refunds" });
  }
});

// Update refund status
router.put("/refunds/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const refund = await Refund.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!refund) return res.status(404).json({ success: false, message: "Refund not found" });
    res.json({ success: true, refund });
  } catch (err) {
    console.error("Error updating refund:", err);
    res.status(500).json({ success: false, message: "Error updating refund" });
  }
});

// Delete a refund
router.delete("/refunds/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const refund = await Refund.findByIdAndDelete(req.params.id);
    if (!refund) return res.status(404).json({ success: false, message: "Refund not found" });
    res.json({ success: true, message: "Refund deleted successfully" });
  } catch (err) {
    console.error("Error deleting refund:", err);
    res.status(500).json({ success: false, message: "Error deleting refund" });
  }
});

module.exports = router;
