import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { register } from "./controllers/auth.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import messageRoutes from"./routes/message.js";
import { verifyToken } from "./middleware/auth.js";
import { createPost } from "./controllers/posts.js";
import User from "./models/User.js";
import Post from "./models/Post.js";
import { users,posts } from "./data/index.js";
import { v2 as cloudinary } from 'cloudinary';


/* Configurations */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

const app = express();

app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors({
    origin: "http://localhost:3000", // Your frontend URL
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
    credentials: true
}));
// app.use(cors());
app.use("/assets", express.static(path.join(__dirname, 'public/assets')));

app.get("/", (req, res) => {
    res.send("Hello, World!");
});

/* File storage */
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "public/assets");
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  });

const upload = multer({ storage });

// Cloudinary upload middleware
import fs from 'fs';


const uploadToCloudinary = async (req, res, next) => {
    try {
        if (!req.file) {
            return next();
        }
        
        // Check file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(req.file.mimetype)) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error deleting invalid file:', err);
            });
            return res.status(400).json({ message: "Invalid file type. Only JPG, JPEG and PNG allowed." });
        }
        
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "Social-uploads",
            resource_type: "auto",
            allowed_formats: ["jpg", "jpeg", "png"], // Explicitly specify allowed formats
            transformation: [
                { quality: "auto:good" } // Optimize image quality
            ]
        });
        
        req.body.picturePath = result.secure_url;
        
        // Clean up local file
        fs.unlink(req.file.path, (err) => {
            if (err) console.error('Error deleting local file:', err);
        });
        
        next();
    } catch (error) {
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error deleting local file:', err);
            });
        }
        return res.status(500).json({ message: "Error uploading to Cloudinary", error: error.message });
    }
};

/*Routes wiht files 
 , middle wear, controller(register here))
*/

app.post("/auth/register", upload.single("picture"),uploadToCloudinary,register);

app.post("/posts",verifyToken, upload.single("picture"),uploadToCloudinary,createPost);

// app.use((req, res, next) => {
//     console.log(`Incoming request: ${req.method} ${req.url}`);
//     next();
// });

/* Routes*/
app.use("/message",messageRoutes)
app.use("/auth", authRoutes);
app.use("/users" , userRoutes);

app.use("/posts",postRoutes);

/* Mongoose Setup */
const PORT = process.env.PORT || 6001;
mongoose.connect(process.env.MONGO_URL, {
})
    .then(() => {
        app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));

        // /*ADD DATA ONE TIME */
        // User.insertMany(users);
        // Post.insertMany(posts);
    })
    .catch((error) => console.log(`${error} did not connect`));
