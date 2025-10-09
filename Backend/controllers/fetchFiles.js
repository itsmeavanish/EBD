const { Order } = require("../models/Order");

exports.fetchFile = async (req, res) => {
  try {
    const { email } = req.query; // get email from query params ?email=user@example.com

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const files = await Order.find({ email: email });

    return res.status(200).json({
      success: true,
      message: "Files fetched successfully",
      files,
    });
  } catch (error) {
    console.error("Error fetching files:", error);
    return res.status(500).json({
      success: false,
      message: "Error while fetching files",
    });
  }
};
