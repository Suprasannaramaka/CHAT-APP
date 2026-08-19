import { generateToken } from "../lib/utilits.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import bcrypt from "bcryptjs";

// Signup a new user
export const signup = async (req, res) => {
    const { fullName, email, password, bio } = req.body;
    try {
        if (!fullName || !email || !password || !bio) {
            return res.json({
                success: false,
                message: "Missing Details",
            });
        }
        const user = await User.findOne({ email });
        if (user) {
            return res.json({
                success: false,
                message: "Account already exists",
            });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(
            password,
            salt
        );
        const newUser = await User.create({
            fullName,
            email,
            password: hashedPassword,
            bio,
        });
        const token = generateToken(newUser._id);
        res.json({
            success: true,
            newUser,
            token,
            message: "Account created Successfully",
        });
    } catch (error) {
        console.error("Signup error:", error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
// Login a user
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const userData = await User.findOne({ email });
        if (!userData) {
            return res.json({
                success: false,
                message: "User not found",
            });
        }
        const isPasswordCorrect = await bcrypt.compare(
            password,
            userData.password
        );
        if (!isPasswordCorrect) {
            return res.json({
                success: false,
                message: "Invalid credentials",
            });
        }
        const token = generateToken(userData._id);
        res.json({
            success: true,
            userData,
            token,
            message: "Login Successful",
        });
    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
// Check if user is authenticated
export const checkAuth = (req, res) => {
    res.json({
        success: true,
        user: req.user,
    });
};
// Update user profile
export const updateProfile = async (req, res) => {
    try {
        const {
            fullName,
            bio,
            profilePic,
        } = req.body;

        // Validate required fields
        if (!fullName || !bio) {
            return res.json({
                success: false,
                message: "Full name and bio are required",
            });
        }
        // Make sure authentication middleware
        // has added the user to req.user
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized user",
            });
        }
        const userId = req.user._id;
        // Data that will be updated in MongoDB
        const updateData = {
            fullName: fullName.trim(),
            bio: bio.trim(),
        };
        // Upload profile picture to Cloudinary
        if (profilePic) {
            const uploadResponse =
                await cloudinary.uploader.upload(profilePic);

            updateData.profilePic =
                uploadResponse.secure_url;
        }
        // Update user in MongoDB
        const updatedUser =
            await User.findByIdAndUpdate(
                userId,
                updateData,
                {
                    new: true,
                }
            );

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        // Send response to frontend
        res.json({
            success: true,
            user: updatedUser,
            message: "Profile updated successfully",
        });

    } catch (error) {
        console.error(
            "Update profile controller error:",
            error
        );

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};