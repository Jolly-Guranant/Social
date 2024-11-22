import express from "express";
import { commentAdd, getFeedPosts , getUserPosts , likePost } from "../controllers/posts.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/*Create*/

/* Read */
router.get("/", verifyToken , getFeedPosts);
router.get("/:userId",verifyToken,getUserPosts);

/*update*/
router.patch("/:id/like",verifyToken , likePost); 
router.patch("/:id/comment",verifyToken, commentAdd);

export default router;