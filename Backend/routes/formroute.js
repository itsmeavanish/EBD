const express=require("express");
const router=express.Router();
const {imageUpload,localFileUpload,screenshotUpload, uploadPaymentScreenshot}=require("../controllers/OrderUploadController");
const { fetchFile } = require("../controllers/fetchFiles");
 //api route 
 router.post("/localFileUpload",localFileUpload);
 router.post("/orders",imageUpload);
 router.post("/screenshotupload",screenshotUpload);
 // Admin payment screenshot for an order
 router.post('/orders/:orderId/payment-screenshot', uploadPaymentScreenshot);
 router.get('/fetchfile',fetchFile);
 module.exports=router;