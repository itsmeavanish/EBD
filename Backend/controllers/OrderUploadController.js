// routes/uploads.js (or controllers/uploads.js)
const path = require("path");
const fs = require("fs/promises");
const { promisify } = require("util");
const { v4: uuidv4 } = require("uuid");
const { cloudinaryConnect } = require("../config/cloudinary"); // ensure this calls cloudinary.config(...)
const cloudinary = require("cloudinary").v2;
const { Order } = require("../models/Order");
const mime = require("mime-types");
const mongoose = require("mongoose");
const PlacedOrder = require("../models/PlacedOrder");

// Helpers
const FILE_DIR = path.join(__dirname, "files");
const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB, adjust as needed
const allowedImageMimes = new Set(["image/jpeg", "image/png", "image/jpg"]);

async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {
    // ignore EEXIST-like errors
  }
}

function isValidObjectId(id) {
  return mongoose.isValidObjectId(id);
}

async function safeMoveFile(file, destPath) {
  // file.mv is provided by express-fileupload, promisify it
  const mv = promisify(file.mv).bind(file);
  await mv(destPath);
}

async function uploadFileToCloudinary(filePath, folder) {
  const options = {
    folder: folder || "uploads",
    use_filename: true,
    unique_filename: false,
    resource_type: "auto",
  };
  return await cloudinary.uploader.upload(filePath, options);
}

// Local File Upload
exports.localFileUpload = async (req, res) => {
  try {
    const file = req.files?.file;
    if (!file) return res.status(400).json({ success: false, message: "No file provided" });

    if (file.size > MAX_FILE_BYTES) {
      return res.status(400).json({ success: false, message: "File too large" });
    }

    const safeName = uuidv4() + path.extname(file.name || "");
    await ensureDir(FILE_DIR);
    const dest = path.join(FILE_DIR, safeName);

    await safeMoveFile(file, dest);

    return res.json({ success: true, message: "Local File Uploaded Successfully", path: dest });
  } catch (error) {
    console.error("Failed to upload file locally:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Create Order (allocation parent) with optional file upload in same request
exports.imageUpload = async (req, res) => {
  try {
    // extract fields
    const {
      orderId,
      quantity,
      price,
      date,
      productName,
      ecommercePlatform,
      brandName,
      season,
      reviewerName,
      mediatorName,
      isPlaced,
      email,
      isAlloted,
      link,
    } = req.body;

    // optional file in same request named 'screenshot'
    const file = req.files?.screenshot;
    let screenshotUrl = "";

    if (file) {
      // validate mime and size
      if (!allowedImageMimes.has(file.mimetype)) {
        return res.status(400).json({ success: false, message: "Unsupported file type" });
      }
      if (file.size > MAX_FILE_BYTES) {
        return res.status(400).json({ success: false, message: "File too large" });
      }

      // move to temp dir and upload
      const tempName = `tmp_${uuidv4()}${path.extname(file.name)}`;
      await ensureDir(FILE_DIR);
      const tempPath = path.join(FILE_DIR, tempName);

      await safeMoveFile(file, tempPath);

      try {
        const cloudRes = await uploadFileToCloudinary(tempPath, "Codehelp");
        screenshotUrl = cloudRes.secure_url || "";
      } catch (uploadErr) {
        console.error("Cloudinary upload failed:", uploadErr);
        // optionally delete temp file
      } finally {
        // remove temp file
        try { await fs.unlink(tempPath); } catch (e) { /* ignore */ }
      }
    }

    // create parent order (validate values as needed)
    const newOrder = await Order.create({
      orderId: orderId || "",
      quantity,
      price,
      date,
      productName,
      ecommercePlatform: ecommercePlatform || "",
      brandName: brandName || "",
      season: season || "",
      reviewerName: reviewerName || "",
      mediatorName: mediatorName || "",
      email: email || "",
      isPlaced: !!isPlaced,
      isAlloted: !!isAlloted,
      link: link || "",
      screenshot: screenshotUrl,
      isPaymentUploaded: false,
      paymentScreenshotUrl: "",
    });

    return res.json({ success: true, message: "Order successfully created", order: newOrder });
  } catch (error) {
    console.error("❌ Failed to create order:", error);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// Generic screenshot upload endpoint that returns URL
exports.screenshotUpload = async (req, res) => {
  try {
    const file = req.files?.screenshot;
    if (!file) return res.status(400).json({ success: false, message: "No file received" });

    if (!allowedImageMimes.has(file.mimetype)) {
      return res.status(400).json({ success: false, message: "Unsupported file type" });
    }
    if (file.size > MAX_FILE_BYTES) {
      return res.status(400).json({ success: false, message: "File too large" });
    }

    await ensureDir(FILE_DIR);
    const tmpFile = path.join(FILE_DIR, `tmp_${uuidv4()}${path.extname(file.name)}`);
    await safeMoveFile(file, tmpFile);

    try {
      const cloudRes = await uploadFileToCloudinary(tmpFile, "Codehelp");
      return res.status(200).json({ success: true, url: cloudRes.secure_url || "" });
    } finally {
      try { await fs.unlink(tmpFile); } catch (e) {}
    }
  } catch (err) {
    console.error("screenshotUpload error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Payment screenshot upload + update order
exports.uploadPaymentScreenshot = async (req, res) => {
  try {
    const { orderId } = req.params;
    const file = req.files?.paymentScreenshot;

    if (!orderId || !isValidObjectId(orderId)) {
      return res.status(400).json({ success: false, message: "Valid orderId param is required" });
    }
    if (!file) return res.status(400).json({ success: false, message: "No file received" });

    if (!allowedImageMimes.has(file.mimetype)) {
      return res.status(400).json({ success: false, message: "Unsupported file type" });
    }
    if (file.size > MAX_FILE_BYTES) {
      return res.status(400).json({ success: false, message: "File too large" });
    }

    await ensureDir(FILE_DIR);
    const tmpFile = path.join(FILE_DIR, `tmp_${uuidv4()}${path.extname(file.name)}`);
    await safeMoveFile(file, tmpFile);

    let paymentScreenshotUrl = "";
    try {
      const cloudRes = await uploadFileToCloudinary(tmpFile, "EBD-Payments");
      paymentScreenshotUrl = cloudRes.secure_url || "";
    } catch (uploadErr) {
      console.error("Cloudinary payment upload failed:", uploadErr);
      return res.status(500).json({ success: false, message: "Upload failed" });
    } finally {
      try { await fs.unlink(tmpFile); } catch (e) {}
    }

    const updated = await Order.findByIdAndUpdate(
      orderId,
      { $set: { isPaymentUploaded: true, paymentScreenshotUrl } },
      { new: true }
    );

    if (!updated) return res.status(404).json({ success: false, message: "Order not found" });

    return res.status(200).json({ success: true, order: updated });
  } catch (error) {
    console.error("uploadPaymentScreenshot error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ============================================================================
//  PLACE ORDER  (supports screenshot URL or screenshot file upload)
//  + deletes allocation from Order.allocations after creation
// ============================================================================
exports.placingOrder = async (req, res) => {
  console.log("req.body =>", req.body);
  console.log("req.files =>", req.files);
  try {
    // Extract fields from body
    const {
      orderId,           // marketplace order id (string from frontend)
      quantity,
      price,
      date,
      productName,
      ecommercePlatform,
      brandName,
      season,
      reviewerName,
      mediatorName,
      email,
      isPlaced,
      isAlloted,
      link,
      screenshot: screenshotFromBody,
      address,

      // IMPORTANT: these come from frontend to delete allocation
      parentOrderId,     // main Order _id (with allocations[])
      allocationId,      // allocation _id to remove
    } = req.body;

    // -----------------------------
    // VALIDATION
    // -----------------------------
    if (
      !orderId ||
      !price ||
      !date ||
      !productName ||
      !brandName ||
      !quantity ||
      !reviewerName ||
      !mediatorName
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Check if duplicate order ID in PlacedOrder (not in Order)
    const existingOrder = await PlacedOrder.findOne({ orderId });
    if (existingOrder) {
      return res.status(409).json({
        success: false,
        message: "Order with this Order ID already exists",
      });
    }

    const priceNum = Number(price);
    const qtyNum = Number(quantity);

    if (isNaN(priceNum) || isNaN(qtyNum)) {
      return res.status(400).json({
        success: false,
        message: "Price and Quantity must be valid numbers",
      });
    }

    // -----------------------------
    // HANDLE SCREENSHOT UPLOAD
    // -----------------------------
    let screenshotUrl = screenshotFromBody || "";   // If frontend already uploaded to Cloudinary

    const file = req.files?.screenshot;
    if (file) {
      // Validate file
      if (!allowedImageMimes.has(file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: "Unsupported file type",
        });
      }

      if (file.size > MAX_FILE_BYTES) {
        return res.status(400).json({
          success: false,
          message: "File too large",
        });
      }

      await ensureDir(FILE_DIR);

      const tempName = `tmp_${uuidv4()}${path.extname(file.name)}`;
      const tempPath = path.join(FILE_DIR, tempName);

      // Move file to temp folder
      await safeMoveFile(file, tempPath);

      try {
        // Upload to Cloudinary
        const cloudRes = await uploadFileToCloudinary(tempPath, "Codehelp");
        screenshotUrl = cloudRes.secure_url || "";
      } catch (err) {
        console.error("Cloudinary Upload Error:", err);
        return res.status(500).json({
          success: false,
          message: "Screenshot upload failed",
        });
      } finally {
        // Always delete temp file
        try {
          await fs.unlink(tempPath);
        } catch (e) {}
      }
    }

    // -----------------------------
    // CREATE PlacedOrder DOCUMENT
    // -----------------------------
    const newOrder = await PlacedOrder.create({
      orderId,
      quantity: qtyNum,
      price: priceNum,
      date,
      productName,
      ecommercePlatform: ecommercePlatform || "",
      brandName,
      season: season || "",
      reviewerName,
      mediatorName,
      email: email || "",
      isPlaced: !!isPlaced,
      isAlloted: !!isAlloted,
      link: link || "",
      screenshot: screenshotUrl,
      address: address || "",
      isPaymentUploaded: false,
      paymentScreenshotUrl: "",
    });

    // -----------------------------
    // AFTER SUCCESS: delete allocation from Order.allocations
    // -----------------------------
    if (
      parentOrderId &&
      allocationId &&
      isValidObjectId(parentOrderId) &&
      isValidObjectId(allocationId)
    ) {
      try {
        await Order.findByIdAndUpdate(
          parentOrderId,
          {
            $pull: {
              allocations: { _id: allocationId },
            },
          },
          { new: true }
        );
      } catch (allocErr) {
        console.error("Failed to delete allocation after placingOrder:", allocErr);
        // don't fail the request just because cleanup failed
      }
    }

    return res.status(201).json({
      success: true,
      message: "Order successfully created",
      order: newOrder,
    });

  } catch (error) {
    console.error("placingOrder Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// Delete a single allocation from an Order (manual endpoint if you still want it)
exports.deleteAllocation = async (req, res) => {
  try {
    const { orderId, allocationId } = req.params;

    if (!orderId || !isValidObjectId(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Valid orderId param is required",
      });
    }

    if (!allocationId || !isValidObjectId(allocationId)) {
      return res.status(400).json({
        success: false,
        message: "Valid allocationId param is required",
      });
    }

    // Find the order with this id
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Find that allocation inside order.allocations
    const allocation = order.allocations.id(allocationId);
    if (!allocation) {
      return res.status(404).json({
        success: false,
        message: "Allocation not found",
      });
    }

    // Optional: if allocation has paymentScreenshotUrl, delete from Cloudinary
    if (allocation.paymentScreenshotUrl) {
      try {
        const url = allocation.paymentScreenshotUrl;
        const fileNameWithoutExt = path.basename(url, path.extname(url));
        const publicId = `EBD-Payments/${fileNameWithoutExt}`;

        await cloudinary.uploader.destroy(publicId, {
          resource_type: "image",
        });
      } catch (cloudErr) {
        console.error("Cloudinary delete allocation payment screenshot error:", cloudErr);
        // don't fail deletion because of Cloudinary error
      }
    }

    // Remove allocation from array and save
    allocation.deleteOne();
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Allocation deleted successfully",
      order,
    });
  } catch (error) {
    console.error("deleteAllocation error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
