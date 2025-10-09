//app create
require("dotenv").config();
const cors=require("cors")
const express=require("express");
const fileupload=require("express-fileupload");
const app=express();

// PORT find kro 


const PORT=process.env.PORT || 3001;

//midlleware add krna hai  


app.use(express.json());
app.use(cors({
    origin: ["*","http://localhost:5173","https://ebd-bdly.vercel.app"], // Allow requests from your frontend
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
    credentials: true // Allow cookies to be sent with requests (if needed)
}));

app.use(
    fileupload({
        useTempFiles: true, // Enables temporary file storage
        tempFileDir: "/tmp/", // Temporary directory for uploaded files
    })
);

// db se connect

const db =require('./config/database');
db.connect()

// cloud se connect 

const cloudinary = require("./config/cloudinary");
cloudinary.cloudinaryConnect();
// Home Route
app.get("/",
    (req,res)=>{
        res.json("The EBD Backend is live")
    }
)
// API Route Mounting
const Upload = require("./routes/formroute");
const UserRoutes=require("./routes/userRoutes");
const AdminRoutes=require("./routes/adminRoutes");
const RefundRoutes=require("./routes/refundRoutes");
const BrandRoutes=require("./routes/brandRoutes");
app.use('/api/auth',UserRoutes);
app.use('/api/auth/upload', Upload);
app.use('/api/auth/admin', AdminRoutes);
app.use('/api/refunds', RefundRoutes);
app.use('/api/brands', BrandRoutes);
//activating server
app.listen(PORT,()=>{
    console.log(`App is running at ${PORT}`)
});