import express from "express";
import {
  CreateMessage,
  GetMessage,
} from "../controllers/Message.Controller.js";
import { authMiddleware } from "../middleware/Auth.Middleware.js";
import { upload } from "../utils/Multer.js";

const messageRoute = express.Router();

// Get all messages between user/group
messageRoute.get("/get-message/:id", authMiddleware, GetMessage);

// Create a new message
messageRoute.post("/create-message", upload.single("image"),authMiddleware, CreateMessage);

// Delete a message


export default messageRoute;
