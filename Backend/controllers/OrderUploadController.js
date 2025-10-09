const { cloudinaryConnect } = require("../config/cloudinary");
const {Order}= require("../models/Order");
const cloudinary = require("cloudinary").v2;

// Local File Upload -> Handler Function
exports.localFileUpload = async (req, res) => {
    try {
        // Fetch the file
        const file = req.files.file;
        console.log("Received file:", file);

        // Define the file path
        let path = __dirname + "/files/" + Date.now() + "_" + file.name;

        // Move the file to the desired path
        file.mv(path, (err) => {
            if (err) {
                console.error("Error while saving the file locally:", err);
                return res.status(500).json({
                    success: false,
                    message: "Error while saving the file locally",
                });
            }
            res.json({
                success: true,
                message: "Local File Uploaded Successfully",
            });
        });
    } catch (error) {
        console.error("Failed to upload file locally:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        }); 
    }
};

// Check if file type is supported
function isFileTypeSupported(type, supportedTypes) {
    return supportedTypes.includes(type);
}

// Upload file to Cloudinary
async function uploadFileToCloudinary(file, folder) {
    const options = {
        folder,
        use_filename: true,
        unique_filename: false,
        resource_type: "auto", // Automatically detect file type
    };

    console.log("Temp file path:", file.tempFilePath);
    try {
        const result = await cloudinary.uploader.upload(file.tempFilePath, options);
        return result;
    } catch (error) {
        console.error("Error uploading to Cloudinary:", error);
        throw error;
    }
}
exports.imageUpload = async (req, res) => {
  try {
    // 1️⃣ Extract request body
    const {
      orderId,
      quantity,
      price,
      date,
      productName,
      brandName,
      season,
      address,
      reviewerName,
      mediatorName,
      otherAddress,
      isPlaced,
      email,
      isAlloted,
      link,
    } = req.body;

    console.log("Received data:", {
      orderId,
      price,
      date,
      productName,
      brandName,
      season,
      address,
      reviewerName,
      mediatorName,
      otherAddress,
      isPlaced,
      email,
      isAlloted,
      link
    });

    let screenshotUrl = ""; // default empty

    // 2️⃣ Check if file is sent

    // 3️⃣ Save order to DB regardless of screenshot upload success
    const newOrder = await Order.create({
      orderId: orderId || "",
      quantity,
      price,
      date,
      productName,
      brandName: brandName || "",
      season: season || "",
      address: address || "",
      reviewerName: reviewerName || "",
      mediatorName: mediatorName || "",
      otherAddress: otherAddress || "",
      email: email || "Anuj@gmail.com",
      isPlaced: isPlaced || false,
        isAlloted: isAlloted || false,
        link: link || "",
      screenshot: screenshotUrl, // empty string if no upload
    });

    // 4️⃣ Respond
    res.json({
      success: true,
      message: "Order successfully created",
      order: newOrder,
    });
  } catch (error) {
    console.error("❌ Failed to create order:", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// Screenshot Upload Handler
 exports.screenshotUpload = async (req, res) => {
  const file = req.files?.screenshot;
  console.log("Received file:", file);

  let screenshotUrl = ""; // default if no file or upload fails

  if (file) {
    const supportedTypes = ["jpg", "jpeg", "png"];
    const fileType = file.name.split(".").pop().toLowerCase();

    if (supportedTypes.includes(fileType)) {
      try {
        console.log("Uploading to Cloudinary...");
        const cloudinaryResponse = await uploadFileToCloudinary(file, "Codehelp");
        screenshotUrl = cloudinaryResponse.secure_url || "";
      } catch (uploadErr) {
        console.error("⚠️ Cloudinary upload failed:", uploadErr);
        screenshotUrl = ""; // fallback
      }
    } else {
      console.warn("⚠️ File format not supported:", fileType);
    }
  } else {
    console.warn("⚠️ No file received");
  }

  // Send the URL back to client
  return res.status(200).json({
    success: true,
    url: screenshotUrl,
  });
};
