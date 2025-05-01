import { User } from "../models/User.Model.js";
import bcrypt from "bcrypt";
import { generateToken } from "../middleware/Auth.Middleware.js";

// ✅ SignUp API
export const SignUp = async (req, res) => {
  try {
    const { userName, email, password } = req.body;

    // Validate inputs
    if (!userName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (!email.includes("@")) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    // Check if user already exists
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Hash password
    const hashPassword = await bcrypt.hash(password, 10);

    // Handle profile image upload
    let profileImage = req.file?.path || "";

    // Create user
    const user = await User.create({
      userName,
      email,
      password: hashPassword,
      profileImage,
    });

    if (!user) {
      return res.status(400).json({ message: "User creation failed" });
    }

    // Generate JWT token
    generateToken(user._id, res);

    return res.status(201).json({ message: "Signup successful", user });
  } catch (error) {
    return res.status(500).json({ message: "Server error at SignUp" });
  }
};

// ✅ LogIn API
export const LogIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    generateToken(user._id, res);

    return res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    return res.status(500).json({ message: "Server error at LogIn" });
  }
};

// ✅ LogOut API
export const LogOut = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Secure in production only
      sameSite: "strict",
    });

    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    return res.status(500).json({ message: "Server error at LogOut" });
  }
};

// ✅ Update User API
export const UpdateUser = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    const updatedData = {};
    if (req.body.userName) updatedData.userName = req.body.userName;
    if (req.body.email) updatedData.email = req.body.email;
    if (req.file?.path) updatedData.image = req.file?.path; 

    const updatedUser = await User.findByIdAndUpdate(user._id, updatedData, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res
      .status(200)
      .json({
        message: "User profile updated successfully",
        user: updatedUser,
      });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error while updating user" });
  }
};

// ✅ Check Auth API
export const CheckAuth = async (req, res) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No user logged in" });
    }

    return res.status(200).json({
      message: "User authenticated successfully",
      user: req.user,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error while checking authentication" });
  }
};

// ✅ Get All Users API
export const getAllUsers = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId)
      return res
        .status(401)
        .json({ message: "Unauthorized: No user logged in" });

    const users = await User.find({ _id: { $ne: userId } }).select("-password");

    return res.status(200).json({ users });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error while getting all users" });
  }
};
