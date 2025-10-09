import mongoose from "mongoose";

const RefundSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  refundAmount: { type: Number, required: true },
  reason: { type: String, required: true },
  screenshot: { type: String, required: true },
  productName: { type: String, required: true },
  originalOrderDate: { type: String, required: true },
  customerName: { type: String, required: true },
  mediatorName: { type: String, required: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  verificationStatus: { type: String, enum: ["pending", "verified", "failed"], default: "pending" },
  extractedOrderId: { type: String, required: false },
  extractedPrice: { type: Number, required: false },
  verificationMessage: { type: String, required: false },
  submittedAt: { type: Date, default: Date.now }
});

export const Refund = mongoose.model("Refund", RefundSchema);
export default { Refund };
