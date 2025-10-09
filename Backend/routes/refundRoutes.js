const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { verifyScreenshot } = require("../controllers/VerificationController");
const { Refund } = require("../models/Refund");
const cloudinary = require("../config/cloudinary");

router.post("/verify-screenshot", authMiddleware, verifyScreenshot);

router.post("/submit", authMiddleware, async (req, res) => {
  try {
    const {
      orderId,
      refundAmount,
      reason,
      productName,
      originalOrderDate,
      customerName,
      mediatorName,
      userId,
      userName,
      userEmail,
      extractedOrderId,
      extractedPrice,
      verified
    } = req.body;

    if (!verified || verified !== 'true') {
      return res.status(400).json({
        success: false,
        message: "Screenshot verification required before submission"
      });
    }

    let screenshotUrl = null;
    if (req.files && req.files.screenshot) {
      const cloudinary = require("cloudinary").v2;
      const file = req.files.screenshot;

      const uploadResult = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: "refunds",
        resource_type: "auto"
      });

      screenshotUrl = uploadResult.secure_url;
    }

    const refund = new Refund({
      orderId,
      refundAmount: parseFloat(refundAmount),
      reason,
      screenshot: screenshotUrl,
      productName,
      originalOrderDate,
      customerName,
      mediatorName,
      userId,
      userName,
      userEmail,
      verificationStatus: "verified",
      extractedOrderId,
      extractedPrice: parseFloat(extractedPrice)
    });

    await refund.save();

    res.json({
      success: true,
      message: "Refund request submitted successfully",
      refund
    });
  } catch (error) {
    console.error("Error submitting refund:", error);
    res.status(500).json({
      success: false,
      message: "Error submitting refund request"
    });
  }
});

router.get("/refunds", authMiddleware, async (req, res) => {
  try {
    const refunds = await Refund.find().populate("userEmail"); // exclude password
    res.json({ success: true, refunds });
  } catch (err) {
    console.error("Error fetching refunds:", err);
    res.status(500).json({ success: false, message: "Error fetching refunds" });
  }
});

module.exports = router;
