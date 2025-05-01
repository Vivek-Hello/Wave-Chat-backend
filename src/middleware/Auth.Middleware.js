import jwt from "jsonwebtoken";
import { User } from "../models/User.Model.js";

// 🔥 Generate Token Function
export const generateToken = (id, res) => {
    try {
        const token = jwt.sign({ id }, process.env.TOKEN_SECRET, { expiresIn: "7d" });

        res.cookie("token", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000, // Matches "7d"
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production", // Secure in production only
        });

        return token;
    } catch (error) {
        console.error("Error generating token:", error);
        throw new Error("Token generation failed");
    }
};

// 🔥 Authentication Middleware
export const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies?.token; // Optional chaining for safety

        if (!token) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }

        const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Auth Error:", error);

        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Invalid token" });
        } else if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expired" });
        } else {
            return res.status(500).json({ message: "Server error in authentication" });
        }
    }
};
