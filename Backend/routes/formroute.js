const express=require("express");
const router=express.Router();
const {imageUpload,localFileUpload,screenshotUpload, uploadPaymentScreenshot,placingOrder,deleteAllocation}=require("../controllers/OrderUploadController");
const { fetchFile,fetchPlacedOrder } = require("../controllers/fetchFiles");
 //api route 
 router.post("/localFileUpload",localFileUpload);
 router.post("/orders",imageUpload);
 router.post("/placingorder",placingOrder);
 router.post("/screenshotupload",screenshotUpload);
 router.delete(
  "/orders/:orderId/allocations/:allocationId",
  deleteAllocation
);
 // Admin payment screenshot for an order
 router.post('/orders/:orderId/payment-screenshot', uploadPaymentScreenshot);
 router.get('/fetchfile',fetchFile);
 router.get('/fetchplacedorder', fetchPlacedOrder);
 module.exports=router;