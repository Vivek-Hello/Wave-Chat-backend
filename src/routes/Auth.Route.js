import express from "express";
import { CheckAuth, LogIn, LogOut, SignUp,getAllUsers,UpdateUser} from "../controllers/Auth.Controller.js";
import { upload } from "../utils/Multer.js";
import { authMiddleware } from "../middleware/Auth.Middleware.js";

const authRout = express.Router();

authRout.post("/signup", upload.single("image"), SignUp);
authRout.post("/login", LogIn);
authRout.put("/edituser", authMiddleware, upload.single("image"), UpdateUser); 
authRout.get("/logout", authMiddleware, LogOut);
authRout.get("/checkauth", authMiddleware, CheckAuth);
authRout.get("/getallusers", authMiddleware, getAllUsers);
export default authRout;
