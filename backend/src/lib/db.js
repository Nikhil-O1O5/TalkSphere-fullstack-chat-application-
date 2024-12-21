import mongoose from "mongoose"
import dotenv from "dotenv"

export const connectDB = async() => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_DB_URI)
    console.log("connected to MONGO_DB");
  } catch (error) {
    console.log(error);
  }
}