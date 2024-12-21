import express from "express"
import authRoute from "./routes/auth.route.js"
import dotenv from "dotenv"
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser"
import messageRoute from "./routes/message.route.js"
import cors from "cors"
import {app, server, io} from "./lib/socket.js"
import path from "path"

dotenv.config()

const __dirname = path.resolve()

app.use(express.json())
app.use(cookieParser());
app.use(cors({
  origin : "http://localhost:5173",
  credentials : true
}));

const PORT = process.env.PORT

app.use("/api/auth",authRoute);
app.use("/api/messages",messageRoute);

if(process.env.NODE_ENV === "development"){
  app.use(express.static(path.join(__dirname,"../frontend/dist")))
}

server.listen(PORT,()=>{
  console.log("App is listening on port " + PORT);
  connectDB();
})