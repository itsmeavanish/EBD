// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const { User } = require("../models/User");
const { Order } = require("../models/Order");
const { Refund } = require("../models/Refund");
const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');
const os = require('os');

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

// Bulk allot orders to users (supports per-order overrides)
router.post("/orders/bulk-allot", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { assignments, userId, userName, userEmail } = req.body;

    // Backward compat: if orderIds passed, convert to assignments
    let normalizedAssignments = assignments;
    if ((!assignments || !Array.isArray(assignments)) && Array.isArray(req.body.orderIds)) {
      normalizedAssignments = req.body.orderIds.map((id) => ({ orderId: id }));
    }

    if (!normalizedAssignments || !Array.isArray(normalizedAssignments) || normalizedAssignments.length === 0) {
      return res.status(400).json({ success: false, message: "assignments array is required" });
    }

    if (!userId || !userName || !userEmail) {
      return res.status(400).json({ success: false, message: "User information is required" });
    }

    const orderIds = normalizedAssignments.map(a => a.orderId);
    const existingOrders = await Order.find({ _id: { $in: orderIds } });
    const existingById = new Map(existingOrders.map(o => [String(o._id), o]));
    const alreadyAlloted = existingOrders.filter(order => order.isAlloted);

    if (alreadyAlloted.length > 0) {
      return res.status(400).json({
        success: false,
        message: `${alreadyAlloted.length} order(s) are already allotted`,
        alreadyAllotedIds: alreadyAlloted.map(o => o._id)
      });
    }

    const updates = await Promise.all(normalizedAssignments.map(async (a) => {
      const id = a.orderId;
      const overrides = {};
      if (typeof a.quantity === 'number') overrides.quantity = a.quantity;
      if (typeof a.address === 'string' && a.address.trim() !== '') overrides.address = a.address.trim();
      const updated = await Order.findByIdAndUpdate(
        id,
        {
          $set: {
            ...overrides,
            isAlloted: true,
            userId: userId,
            userName: userName,
            email: userEmail,
            isPaymentUploaded: false,
          }
        },
        { new: true }
      );
      return updated;
    }));

    const modifiedCount = updates.filter(Boolean).length;

    res.json({
      success: true,
      message: `${modifiedCount} orders allotted successfully`,
      modifiedCount,
      orders: updates
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

// Allocate a single order with multiple address/quantity rows and optional payment screenshot verification
router.post("/orders/:id/allocate", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const orderId = req.params.id;
    // assignments: [{ address, quantity, email, userId, userName, paymentAmount }]
    const rawAssignments = req.body.assignments || [];

    if (!Array.isArray(rawAssignments) || rawAssignments.length === 0) {
      return res.status(400).json({ success: false, message: "assignments array is required" });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    let uploadedUrl = "";
    // optional payment screenshot verification per allocate request (single screenshot verifying total payment)
    if (req.files && req.files.paymentScreenshot && typeof rawAssignments[0]?.paymentAmount === 'number') {
      // save temp
      const isProd = process.env.NODE_ENV === 'production';
      const tempDir = isProd ? path.join(os.tmpdir(), 'uploads') : path.join(__dirname, '..', 'uploads');
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
      const tempFilePath = path.join(tempDir, `${Date.now()}-${req.files.paymentScreenshot.name}`);
      await req.files.paymentScreenshot.mv(tempFilePath);

      try {
        const { data: { text } } = await Tesseract.recognize(tempFilePath, 'eng');
        fs.unlink(tempFilePath, () => {});
        const pricePattern = /(?:₹|rs\.?|inr|price|amount|total)[\s:]*([0-9,]+\.?[0-9]*)/gi;
        const priceMatches = [...text.matchAll(pricePattern)];
        let extractedPrice = null;
        if (priceMatches.length > 0) {
          const priceString = priceMatches[priceMatches.length - 1][1].replace(/,/g, '');
          extractedPrice = parseFloat(priceString);
        }
        const expectedAmount = rawAssignments.reduce((s, a) => s + (a.paymentAmount || 0), 0);
        if (!extractedPrice || Math.abs(extractedPrice - expectedAmount) >= 1) {
          return res.status(400).json({ success: false, message: "Payment verification failed", extractedPrice, expectedAmount });
        }
      } catch (err) {
        return res.status(500).json({ success: false, message: "Error verifying payment screenshot" });
      }
    }

    // persist allocations
    const allocations = rawAssignments.map(a => ({
      address: a.address,
      quantity: a.quantity,
      userId: a.userId || '',
      userName: a.userName || '',
      email: a.email,
      isPaymentUploaded: false,
      paymentAmount: typeof a.paymentAmount === 'number' ? a.paymentAmount : undefined,
      paymentScreenshotUrl: '',
    }));

    order.isAlloted = true;
    order.allocations = [...(order.allocations || []), ...allocations];
    await order.save();

    return res.json({ success: true, order });
  } catch (err) {
    console.error('allocate error', err);
    return res.status(500).json({ success: false, message: "Error allocating order" });
  }
});

// Upload payment screenshot for a specific allocation
router.post('/orders/:orderId/allocations/:allocationId/payment', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { orderId, allocationId } = req.params;
    const file = req.files?.paymentScreenshot;
    if (!file) return res.status(400).json({ success: false, message: 'paymentScreenshot is required' });

    // Simple pass-through to existing upload helper via formroute controller would be ideal; for now, mark uploaded flag without cloud storage
    // In production, upload to Cloudinary similar to OrderUploadController
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    const allocation = (order.allocations || []).id(allocationId);
    if (!allocation) return res.status(404).json({ success: false, message: 'Allocation not found' });

    // Mark as uploaded (stub URL)
    allocation.isPaymentUploaded = true;
    allocation.paymentScreenshotUrl = 'uploaded';
    await order.save();
    return res.json({ success: true, order });
  } catch (err) {
    console.error('allocation payment upload error', err);
    return res.status(500).json({ success: false, message: 'Error uploading payment screenshot' });
  }
});

// Fetch allocations for a user (visible only when payment uploaded)
// moved to userRoutes for user access
