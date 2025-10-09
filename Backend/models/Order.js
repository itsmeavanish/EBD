import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  orderId: { type: String, required:false },
  quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    date: { type: Date, required: false },
    productName: { type: String, required: true },
    brandName: { type: String, required: false },
    season: { type: String, required: false },
    address: { type: String, required: true },
    otherAddress: { type: String, required: false },
    reviewerName: { type: String, required: false },
    mediatorName: { type: String, required: false },
    screenshot: { type: String, required: false },
    email: { type: String, required: true },
    userId: { type: String, required: false },
    userName: { type: String, required: false },
    isPlaced: { type: Boolean, default: false },
    isAlloted: { type: Boolean, default: false },
    isConfirmed: { type: Boolean, default: false },
    link: { type: String, required: false },
    submittedAt: { type: Date, default: Date.now },
});
export const Order = mongoose.model("order", OrderSchema);
export default  {Order};

