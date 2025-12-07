// models/PlacedOrder.js (or models/Order.js)
const mongoose = require("mongoose");

const placedOrderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    // If you later want to link orders to users, you can add this:
    // user: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "User",
    //   required: false,
    // },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    date: {
      type: Date,
      required: true,
    },

    productName: {
      type: String,
      required: true,
      trim: true,
    },

    ecommercePlatform: {
      type: String,
      default: "",
      trim: true,
    },

    brandName: {
      type: String,
      required: true,
      trim: true,
    },

    season: {
      type: String,
      default: "",
      trim: true,
    },

    reviewerName: {
      type: String,
      required: true,
      trim: true,
    },

    mediatorName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      default: "",
      trim: true,
    },

    isPlaced: {
      type: Boolean,
      default: false,
    },

    isAlloted: {
      type: Boolean,
      default: false,
    },

    link: {
      type: String,
      default: "",
      trim: true,
    },

    screenshot: {
      type: String, // Cloudinary URL
      default: "",
    },

    address: {
      type: String,
      default: "",
      trim: true,
      // if you want it mandatory, add: required: true
    },

    isPaymentUploaded: {
      type: Boolean,
      default: false,
    },

    paymentScreenshotUrl: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PlacedOrder", placedOrderSchema);
