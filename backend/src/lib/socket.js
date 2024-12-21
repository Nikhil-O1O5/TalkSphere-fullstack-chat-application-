import {Server} from "socket.io"
import http from "http"
import express from "express"

const app = express()
const server = http.createServer(app);
const io = new Server(server, {
  cors : {
    origin :  ["http://localhost:5173"]
  }
})

const userSocketMap = {};

export function getRecieverSocketId(userId){
  return userSocketMap[userId]
}

io.on("connection",(socket)=>{
  console.log(`A user has connected of socket id ${socket.id}`);
  const userId =  socket.handshake.query.userId
  if(userId)
    userSocketMap[userId] = socket.id
  io.emit("getOnlineUsers",Object.keys(userSocketMap));
  socket.on("disconnect",()=>{
    console.log(`A user has disconnected with id ${socket.id}`);
    delete userSocketMap[userId]
    io.emit("getOnlineUsers",Object.keys(userSocketMap));
  })
})

export {app, server, io};