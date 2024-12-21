import mongoose from "mongoose";
import express from "express"
import { Router } from "express"
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { getUsersForSidebar, getMessages, sendMessage } from "../controllers/message.controller.js";

const router = Router();

router.get("/users",authMiddleware,getUsersForSidebar);
router.get("/:id",authMiddleware,getMessages);
router.post("/sendMessage/:id",authMiddleware,sendMessage);

export default router;