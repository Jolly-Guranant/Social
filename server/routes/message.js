import express from "express"
import { verifyToken } from "../middleware/auth.js";
import { createMessage, getMessages } from "../controllers/message.js";

const router=express.Router();

/*Create*/
router.post("/:userId/:friendId",verifyToken,createMessage);

/* Read */
router.get("/:userId/:friendId/get", verifyToken , getMessages);



export default router;