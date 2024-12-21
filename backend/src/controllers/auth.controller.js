import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";
import { generatetoken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js"

export const signup = async (req, res) => {
  try {
    const { fullName, password, email } = req.body;

    if (!fullName || !password || !email) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password is too small" });
    }

    const user = await User.findOne({ email }); 

    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10); 
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      fullName,
      password: hashedPassword,
      email,
    });

    // Generate JWT token
    generatetoken(newUser._id, res);

    res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic,
    });
  } catch (error) {
    console.error("Error in signup controller:", error.message);
    if (error.code === 'ECONNRESET') {
      res.status(503).json({ message: "Connection was reset" });
    } else {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
};


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Email from req.body:", email);

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    console.log("User data:", user);

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    // Generate JWT token
    generatetoken(user._id, res);

    return res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.error("Error in login controller:", error.message);

    if (error.code === "ECONNRESET") {
      return res.status(503).json({ message: "Connection was reset. Please try again later." });
    }

    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = (req,res) => {
  try {
    res.cookie("jwt","",{ maxAge : 0});
    res.status(200).json({message : "Logged Out successfully"})
  } catch (error) {
    console.error("Error in logout controller:", error.message);
    if (error.code === 'ECONNRESET') {
      res.status(503).json({ message: "Connection was reset" });
    } else
    return res.status(500).json({message : "Internal Server Error"});
  }
}


export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    if (!profilePic) {
      return res.status(400).json({ message: "Profile Pic was not provided" });
    }

    const userId = req.user._id;
    const response = await cloudinary.uploader.upload(profilePic);

    const updateUser = await User.findByIdAndUpdate(userId, { profilePic: response.secure_url }, { new: true });
    res.status(200).json(updateUser);
  } catch (error) {
    console.log("Error in controller updateProfile", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    return res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in controller checkAuth", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};