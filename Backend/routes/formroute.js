const express=require("express");
const router=express.Router();
const {imageUpload,localFileUpload,screenshotUpload}=require("../controllers/OrderUploadController");
const { fetchFile } = require("../controllers/fetchFiles");
 //api route 
 router.post("/localFileUpload",localFileUpload);
 router.post("/orders",imageUpload);
 router.post("/screenshotupload",screenshotUpload);
 router.get('/fetchfile',fetchFile);
 module.exports=router;