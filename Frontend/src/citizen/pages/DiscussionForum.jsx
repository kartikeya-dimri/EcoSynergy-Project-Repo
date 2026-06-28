import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  CircularProgress,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useSocket } from "../../context/SocketContext";

const DiscussionForum = () => {
  const { driveId } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [participants, setParticipants] = useState([]);
  const messagesEndRef = useRef(null);
  const [driveTitle, setDriveTitle] = useState("");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch messages on mount
  useEffect(() => {
    fetchMessages();
  }, [driveId]);

  // Socket listeners
  useEffect(() => {
    if (!socket || !driveId) return;

    // Join the drive room
    socket.emit("joinDriveRoom", driveId);

    // Listen for new messages
    socket.on("newMessage", (message) => {
      if (message.driveId === driveId) {
        setMessages((prev) => [...prev, message]);
      }
    });

    // Cleanup on unmount
    return () => {
      socket.emit("leaveDriveRoom", driveId);
      socket.off("newMessage");
    };
  }, [socket, driveId]);

  const fetchMessages = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/user/driveChat/${driveId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
        setCurrentUserId(data.currentUserId);
        setParticipants(data.participants);
      } else {
        const errorData = await response.json();
        console.error("Failed to fetch messages:", errorData.error);
        if (response.status === 403) {
          alert(errorData.error);
          navigate(-1);
        }
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setSending(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/user/driveChat/${driveId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message: newMessage.trim() }),
        }
      );

      if (response.ok) {
        setNewMessage("");
      } else {
        const errorData = await response.json();
        alert(`Failed to send message: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("An error occurred while sending the message");
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const renderDateSeparator = (currentMsg, prevMsg) => {
    if (!prevMsg) return formatDate(currentMsg.timestamp);
    
    const currentDate = new Date(currentMsg.timestamp).toDateString();
    const prevDate = new Date(prevMsg.timestamp).toDateString();
    
    if (currentDate !== prevDate) {
      return formatDate(currentMsg.timestamp);
    }
    return null;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
        <CircularProgress sx={{ color: "#10b981" }} />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, height: "calc(100vh - 100px)", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Paper
        elevation={2}
        sx={{
          p: 2,
          mb: 2,
          background: "linear-gradient(90deg, #047857 0%, #0e7490 100%)",
          color: "white",
          borderRadius: 2,
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton
            onClick={() => navigate(-1)}
            sx={{ color: "white" }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Discussion Forum 💬
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {participants.length} participant{participants.length !== 1 ? "s" : ""}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Messages Area */}
      <Paper
        elevation={2}
        sx={{
          flexGrow: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          borderRadius: 2,
          bgcolor: "rgba(255, 255, 255, 0.05)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            p: 3,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "rgba(255, 255, 255, 0.05)",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#10b981",
              borderRadius: "4px",
              "&:hover": {
                backgroundColor: "#059669",
              },
            },
          }}
        >
          {messages.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Typography variant="h6" sx={{ color: "#9ca3af" }}>
                No messages yet
              </Typography>
              <Typography variant="body2" sx={{ color: "#9ca3af" }}>
                Start the conversation!
              </Typography>
            </Box>
          ) : (
            messages.map((msg, index) => {
              const isCurrentUser = msg.sender._id === currentUserId;
              const dateSeparator = renderDateSeparator(msg, messages[index - 1]);

              return (
                <React.Fragment key={msg._id}>
                  {dateSeparator && (
                    <Box sx={{ textAlign: "center", my: 2 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          bgcolor: "rgba(255, 255, 255, 0.1)",
                          px: 2,
                          py: 0.5,
                          borderRadius: 2,
                          color: "#9ca3af",
                        }}
                      >
                        {dateSeparator}
                      </Typography>
                    </Box>
                  )}
                  
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: isCurrentUser ? "flex-end" : "flex-start",
                      alignItems: "flex-start",
                      gap: 1,
                    }}
                  >
                    {!isCurrentUser && (
                      <Avatar
                        sx={{
                          bgcolor: "#10b981",
                          width: 36,
                          height: 36,
                          fontSize: "0.875rem",
                        }}
                      >
                        {getInitials(msg.sender.name)}
                      </Avatar>
                    )}

                    <Box
                      sx={{
                        maxWidth: "70%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: isCurrentUser ? "flex-end" : "flex-start",
                      }}
                    >
                      {!isCurrentUser && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#10b981",
                            fontWeight: 600,
                            mb: 0.5,
                            ml: 1,
                          }}
                        >
                          {msg.sender.name}
                        </Typography>
                      )}
                      
                      <Paper
                        elevation={1}
                        sx={{
                          p: 1.5,
                          bgcolor: isCurrentUser ? "#047857" : "rgba(255, 255, 255, 0.08)",
                          color: isCurrentUser ? "white" : "#e5e7eb",
                          borderRadius: 2,
                          borderTopLeftRadius: !isCurrentUser ? 0 : 2,
                          borderTopRightRadius: isCurrentUser ? 0 : 2,
                        }}
                      >
                        <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                          {msg.message}
                        </Typography>
                      </Paper>
                      
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#9ca3af",
                          mt: 0.5,
                          mx: 1,
                        }}
                      >
                        {formatTime(msg.timestamp)}
                      </Typography>
                    </Box>

                    {isCurrentUser && (
                      <Avatar
                        sx={{
                          bgcolor: "#10b981",
                          width: 36,
                          height: 36,
                          fontSize: "0.875rem",
                        }}
                      >
                        {getInitials(msg.sender.name)}
                      </Avatar>
                    )}
                  </Box>
                </React.Fragment>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </Box>

        {/* Input Area */}
        <Box
          component="form"
          onSubmit={handleSendMessage}
          sx={{
            p: 2,
            bgcolor: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
            borderRadius: 2,
          }}
        >
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <TextField
              fullWidth
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={sending}
              variant="outlined"
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  color: "#e5e7eb",
                  "& fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.2)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.3)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#10b981",
                  },
                },
                "& .MuiInputBase-input::placeholder": {
                  color: "#9ca3af",
                  opacity: 1,
                },
              }}
            />
            <IconButton
              type="submit"
              disabled={!newMessage.trim() || sending}
              sx={{
                bgcolor: "#047857",
                color: "white",
                width: "50px",
                height: "50px",
                flexShrink: 0,
                "&:hover": {
                  bgcolor: "#059669",
                },
                "&:disabled": {
                  bgcolor: "#e5e7eb",
                },
              }}
            >
              {sending ? <CircularProgress size={24} sx={{ color: "white" }} /> : <SendIcon />}
            </IconButton>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default DiscussionForum;
