import { getRecieverSocketId } from "../lib/socket.js";
import { messageModel } from "../models/message.model.js";
import User from "../models/user.model.js";
import cloudinary from "cloudinary"
import { io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const userId = req.user?._id; 
    if (!userId) {
      return res.status(400).json({ message: "User ID not found in request" });
    }

    const users = await User.find({ _id: { $ne: userId } }).select("-password");
    res.status(200).json(users);
  } catch (error) {
    console.error("Error in getUsersForSidebar:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const getMessages = async (req, res) => {
  try {
    const { id: recieverId } = req.params;
    const senderId = req.user._id;

    // Ensure the database query is awaited
    const messages = await messageModel.find({
      $or: [
        { senderId: senderId, recieverId: recieverId },
        { senderId: recieverId, recieverId: senderId }
      ]
    });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages message controller:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    let { id: receiverId } = req.params; // receiverId from the URL
    receiverId = receiverId.trim(); // Remove any extra spaces or newline characters

    const { text, image } = req.body;
    const senderId = req.user._id;

    // Debugging output
    console.log("Receiver ID:", receiverId);

    if (!receiverId) {
      return res.status(400).json({ message: "Receiver ID is required" });
    }

    let imageUrl = null;
    if (image) {
      try {
        const response = await cloudinary.uploader.upload(image);
        imageUrl = response.secure_url;
      } catch (error) {
        console.error("Error uploading image to Cloudinary:", error.message);
      }
    }

    const newMessage = new messageModel({
      senderId,
      receiverId,  // Use the trimmed receiverId
      text,
      image: imageUrl
    });

    // Save the message
    const savedMessage = await newMessage.save();

    const recieverSocketId = getRecieverSocketId(receiverId);
    if(recieverSocketId)
      io.to(recieverSocketId).emit("newMessage",newMessage);

    res.status(200).json(savedMessage);
  } catch (error) {
    console.error("Error in sendMessage controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

