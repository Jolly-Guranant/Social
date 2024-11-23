import Message from "../models/Message.js";
import User from "../models/User.js";

/*create*/

export const createMessage = async (req, res) => {
    try {
        console.log("Request body:", req.body);
        console.log("Request params:", req.params);
        
        const { userId, friendId } = req.params;
        const { text } = req.body;

        // Validate inputs
        if (!userId || !friendId || !text) {
            return res.status(400).json({ 
                message: "Missing required fields",
                received: { userId, friendId, text }
            });
        }

        const newMessage = new Message({
            from: userId,
            to: friendId,
            text: text
        });
        
        console.log("Creating new message:", newMessage);
        
        const savedMessage = await newMessage.save();
        console.log("Message saved successfully:", savedMessage);
        
        res.status(201).json(savedMessage);
    }
    catch (err) {
        console.error("Error in createMessage:", err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ 
                message: "Validation Error", 
                details: err.message 
            });
        }
        res.status(409).json({ 
            message: "Error creating message", 
            error: err.message,
            details: err.stack
        });
    }
}
/* READ */

export const getMessages = async (req, res) => {
    try {
        const { userId, friendId } = req.params;

        // Correcting the query for Message.find
        const messages = await Message.find({
            $or: [
                { to: userId, from: friendId }, // Messages from friendId to userId
                { to: friendId, from: userId }  // Messages from userId to friendId
            ]
        });

        res.status(200).json(messages);

    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};


