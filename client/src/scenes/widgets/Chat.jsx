import React, { useEffect, useState } from "react";
import { Box, Typography, useTheme, InputBase, Button } from "@mui/material";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import FlexBetween from "../../components/FlexBetween";
import UserImage from "../../components/UserImage";
import { X } from "@mui/icons-material";
import { io } from "socket.io-client";
import { useCallback } from "react";

const Chat = ({ friendId, bhang, bhosda }) => {


  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();
  const { _id } = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const [isConnected,setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [friend, setFriend] = useState(null);
  const [post, setPost] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const { palette } = useTheme();
  const main = palette.neutral.main;


  useEffect(() => {
    const newSocket = io("http://localhost:3002", {  // Note the different port
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('Connected to socket server');
      setIsConnected(true);
      newSocket.emit('join', _id);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    newSocket.on('message', (newMessage) => {
      console.log('Received message:', newMessage);
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [_id]);



  // Fetch friend and message data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const friendResponse = await fetch(
          `http://localhost:3001/users/${friendId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!friendResponse.ok) throw new Error("Failed to fetch friend data");
        const friendData = await friendResponse.json();
        setFriend(friendData);

        const messagesResponse = await fetch(
          `http://localhost:3001/message/${_id}/${friendId}/get`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!messagesResponse.ok)
          throw new Error("Failed to fetch message data");
        const messagesData = await messagesResponse.json();
        setMessages(messagesData);

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setFriend(null);
        setMessages([]);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [friendId, token, _id]);

  // Handle sending a message

  const sendMessage = useCallback(async () => {
    if (!post.trim() || !socket) return;

    const messageData = {
      from: _id,
      to: friendId,
      text: post
    };

    try {
      // Emit to socket
      socket.emit('sendMessage', messageData);
      
      // Save to backend
      console.log("caaling backend");
      await fetch(`http://localhost:3001/message/${_id}/${friendId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        credentials: 'include',
        body: JSON.stringify(messageData)
      });


      setPost(""); // Clear input
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }, [post, socket, _id, friendId, token]);



  // Redirect to homepage when `isChatUser` is set to false
  useEffect(() => {
    if (!bhosda) {
      navigate("/home");
    }
  }, [bhosda, navigate]);

  if (isLoading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: "0",
        right: "0",
        width: "30%",
        height: "60%",
        backgroundColor: palette.background.default,
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        borderRadius: "1rem 1rem 0 0",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Chat Header */}
      <FlexBetween sx={{ padding: "1rem", alignItems: "center" }}>
        <UserImage image={friend?.picturePath || ""} size="55px" />

        <Typography
          color={main}
          variant="h5"
          fontWeight="500"
          sx={{ cursor: "pointer", "&:hover": { color: palette.primary.main } }}
          onClick={() => navigate(`/profile/${friendId}`)}
        >
          {friend?.firstName} {friend?.lastName}
        </Typography>

        <X onClick={() => bhang(false)} />
      </FlexBetween>

      {/* Chat Messages */}
      <Box
        sx={{
          flex: "1",
          overflowY: "auto",
          padding: "1rem",
          display: "flex",
          flexDirection: "column-reverse",
        }}
      >
        {messages.length > 0 ? (
          messages
            .slice()
            .reverse()
            .map((message) => (
              <Typography
                key={message._id} // Changed from message.id to message._id
                align={message.from === _id ? "right" : "left"} // Changed logic to use from instead of to
                sx={{
                  backgroundColor: message.from === _id ? palette.primary.main : palette.neutral.light,
                  color: message.from === _id ? palette.background.dark : "inherit",
                  padding: "0.5rem 1rem",
                  borderRadius: "1rem",
                  marginBottom: "0.5rem",
                  maxWidth: "70%",
                  alignSelf: message.from === _id ? "flex-end" : "flex-start",
                  wordBreak: "break-word"
                }}
              >
                {message.text}
              </Typography>
            ))
        ) : (
          <Typography>No messages yet.</Typography>
        )}
      </Box>

      {/* Message Input */}
      <FlexBetween
        sx={{ padding: "1rem", borderTop: `1px solid ${palette.neutral.light}` }}
      >
        <InputBase
          placeholder="Write a message..."
          value={post}
          onChange={(e) => setPost(e.target.value)}
          sx={{
            flex: "1",
            backgroundColor: palette.neutral.light,
            borderRadius: "2rem",
            padding: "0.5rem 1rem",
          }}
        />
        <Button
          disabled={!post}
          onClick={sendMessage}
          sx={{
            marginLeft: "1rem",
            color: palette.background.alt,
            backgroundColor: palette.primary.main,
            borderRadius: "3rem",
          }}
        >
          Send
        </Button>
      </FlexBetween>
    </Box>
  );
};

export default Chat;
