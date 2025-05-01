import cloudinary from "./Cloudinary.js";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";


const storage = new CloudinaryStorage({
    cloudinary:cloudinary,
    params:{
        folder:"chat-app",
    }
})

 
export const upload = multer({storage})