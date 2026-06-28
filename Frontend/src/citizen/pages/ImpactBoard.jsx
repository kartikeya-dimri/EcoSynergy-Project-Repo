import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Paper,
  Typography,
  IconButton,
  Avatar,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  TextField,
  AvatarGroup,
  Tooltip,
  Button,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PeopleIcon from "@mui/icons-material/People";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { useSocket } from "../../context/SocketContext";
import { jwtDecode } from "jwt-decode";

const ImpactBoard = () => {
  const { driveId } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const [loading, setLoading] = useState(true);
  const [driveData, setDriveData] = useState(null);
  const [impactData, setImpactData] = useState({
    summary: "",
  });
  const [activeUsers, setActiveUsers] = useState([]);
  const [focusedFields, setFocusedFields] = useState({});
  const [remoteCursors, setRemoteCursors] = useState({});
  const updateTimeoutRef = useRef({});
  const currentUserId = useRef(null);
  const currentUserName = useRef(null);
  const [isFinalized, setIsFinalized] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [confirmDialog, setConfirmDialog] = useState(false);

  useEffect(() => {
    // Get current user info from token
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      currentUserId.current = decoded.id;
      currentUserName.current = decoded.name;
    }
    
    fetchDriveData();
  }, [driveId]);

  // Socket connection for collaborative editing
  useEffect(() => {
    if (!socket || !driveId || !currentUserId.current) return;

    // Join impact board room
    socket.emit("joinImpactBoard", {
      driveId,
      userId: currentUserId.current,
      userName: currentUserName.current,
    });

    // Listen for active users
    socket.on("activeImpactUsers", (users) => {
      setActiveUsers(users.filter(u => u.userId !== currentUserId.current));
    });

    // Listen for users joining
    socket.on("userJoinedImpactBoard", (user) => {
      if (user.userId !== currentUserId.current) {
        setActiveUsers((prev) => [...prev, user]);
      }
    });

    // Listen for users leaving
    socket.on("userLeftImpactBoard", ({ userId }) => {
      setActiveUsers((prev) => prev.filter((u) => u.userId !== userId));
      setFocusedFields((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach(field => {
          if (updated[field]?.userId === userId) {
            delete updated[field];
          }
        });
        return updated;
      });
      setRemoteCursors((prev) => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });
    });

    // Listen for real-time updates from other users
    socket.on("impactBoardUpdate", ({ field, value, userId }) => {
      if (userId !== currentUserId.current) {
        setImpactData((prev) => ({
          ...prev,
          [field]: value,
        }));
      }
    });

    // Listen for field focus events
    socket.on("userFocusedField", ({ field, userId, userName }) => {
      if (userId !== currentUserId.current) {
        setFocusedFields((prev) => ({
          ...prev,
          [field]: { userId, userName },
        }));
      }
    });

    // Listen for field blur events
    socket.on("userBlurredField", ({ field, userId }) => {
      if (userId !== currentUserId.current) {
        setFocusedFields((prev) => {
          const updated = { ...prev };
          if (updated[field]?.userId === userId) {
            delete updated[field];
          }
          return updated;
        });
      }
    });

    // Listen for cursor position updates
    socket.on("remoteCursorUpdate", ({ field, userId, userName, cursorPosition }) => {
      if (userId !== currentUserId.current) {
        setRemoteCursors((prev) => ({
          ...prev,
          [userId]: { field, userName, cursorPosition },
        }));
      }
    });

    // Listen for impact board finalized event
    socket.on("impactBoardFinished", ({ driveId: finishedDriveId }) => {
      if (finishedDriveId === driveId) {
        setIsFinalized(true);
        setFinishing(false);
      }
    });

    // Cleanup
    return () => {
      socket.emit("leaveImpactBoard", { driveId, userId: currentUserId.current });
      socket.off("activeImpactUsers");
      socket.off("userJoinedImpactBoard");
      socket.off("userLeftImpactBoard");
      socket.off("impactBoardUpdate");
      socket.off("userFocusedField");
      socket.off("userBlurredField");
      socket.off("remoteCursorUpdate");
      socket.off("impactBoardFinished");
    };
  }, [socket, driveId]);

  const fetchDriveData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/user/impactBoard/${driveId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch drive data");
      }

      const data = await response.json();
      setDriveData(data.drive);
      setImpactData(data.drive.impactData || {
        summary: "",
      });
      setIsFinalized(data.drive.isFinalized || false);
    } catch (error) {
      console.error("Error fetching drive data:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleFinishClick = () => {
    if (!impactData.summary.trim()) {
      showSnackbar("Cannot finish an empty impact summary!", "error");
      return;
    }
    setConfirmDialog(true);
  };

  const handleFinishImpactBoard = async () => {
    setConfirmDialog(false);
    const token = localStorage.getItem("token");
    setFinishing(true);

    try {
      // Step 1: Call Gemini API directly from frontend to generate summary
      const systemPrompt = `You are a summarizer for environmental and community initiatives. 
      
      Below is a collaborative impact summary written by multiple participants of a community initiative titled "${driveData.heading}":
      
      "${impactData.summary}"
      
      Make it concise, inspiring, and professional. Ignore any gibberish remarks. Keep it under 100 words.`;

      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${import.meta.env.VITE_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: systemPrompt }],
              },
            ],
          }),
        }
      );

      if (!geminiResponse.ok) {
        const geminiError = await geminiResponse.json();
        throw new Error(geminiError.error?.message || "Failed to generate AI summary");
      }

      const geminiData = await geminiResponse.json();
      const aiResult = geminiData.candidates[0].content.parts[0].text.replace(/\*\*/g, "");

      // Step 2: Send the AI-generated result to backend to save
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/user/finishImpactBoard/${driveId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ result: aiResult }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to finish impact board");
      }

      const data = await response.json();
      setIsFinalized(true);
      showSnackbar("Impact Board finalized successfully! Summary has been generated.", "success");
      
      // Redirect to view summary page
      setTimeout(() => {
        navigate(`/view-summary/${driveId}`);
      }, 1500);
    } catch (error) {
      console.error("Error finishing impact board:", error);
      showSnackbar(error.message || "Failed to finalize impact board", "error");
    } finally {
      setFinishing(false);
    }
  };

  const handleFieldChange = (field, value, cursorPosition) => {
    // Update local state immediately
    setImpactData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Debounce the API call
    if (updateTimeoutRef.current[field]) {
      clearTimeout(updateTimeoutRef.current[field]);
    }

    updateTimeoutRef.current[field] = setTimeout(async () => {
      const token = localStorage.getItem("token");
      try {
        await fetch(
          `${import.meta.env.VITE_API_URL}/user/impactBoard/${driveId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ field, value, cursorPosition }),
          }
        );
      } catch (error) {
        console.error("Error updating impact board:", error);
      }
    }, 500);
  };

  const handleFieldFocus = (field, cursorPosition) => {
    if (socket) {
      socket.emit("impactFieldFocus", {
        driveId,
        field,
        userId: currentUserId.current,
        userName: currentUserName.current,
        cursorPosition,
      });
    }
  };

  const handleFieldBlur = (field) => {
    if (socket) {
      socket.emit("impactFieldBlur", {
        driveId,
        field,
        userId: currentUserId.current,
      });
    }
  };

  const handleCursorMove = (field, cursorPosition) => {
    if (socket) {
      socket.emit("cursorPositionUpdate", {
        driveId,
        field,
        userId: currentUserId.current,
        userName: currentUserName.current,
        cursorPosition,
      });
    }
  };

  if (loading) {
    return (
      <Container
        maxWidth="lg"
        sx={{
          py: 4,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
        }}
      >
        <CircularProgress sx={{ color: "#10b981" }} />
      </Container>
    );
  }

  if (!driveData) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h6" color="error">
          Drive not found
        </Typography>
      </Container>
    );
  }

  const getFieldLabel = (field) => {
    if (focusedFields[field]) {
      return `${field} (${focusedFields[field].userName} is editing...)`;
    }
    return field;
  };

  return (
    <Container
      maxWidth="lg"
      sx={{ py: 4, minHeight: "calc(100vh - 100px)" }}
    >
      {/* Header */}
      <Paper
        elevation={2}
        sx={{
          p: 2,
          mb: 3,
          background: "linear-gradient(90deg, #10b981 0%, #34d399 100%)",
          color: "white",
          borderRadius: 2,
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton onClick={() => navigate(-1)} sx={{ color: "white" }}>
              <ArrowBackIcon />
            </IconButton>
            <Avatar sx={{ bgcolor: "#059669" }}>
              <EmojiEventsIcon />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={700}>
                Impact Board 🏆
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {driveData.heading}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* Finish Button - Only for creator */}
            {!isFinalized && driveData.createdBy._id === currentUserId.current && (
              <Button
                variant="contained"
                onClick={handleFinishClick}
                disabled={finishing}
                sx={{
                  bgcolor: "#fbbf24",
                  color: "#000",
                  fontWeight: 700,
                  "&:hover": {
                    bgcolor: "#f59e0b",
                  },
                  "&:disabled": {
                    bgcolor: "#9ca3af",
                    color: "#fff",
                  },
                }}
              >
                {finishing ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "🏁 Finish"}
              </Button>
            )}

            {/* Finalized Badge */}
            {isFinalized && (
              <Chip
                label="✅ Finalized"
                sx={{
                  bgcolor: "#fbbf24",
                  color: "#000",
                  fontWeight: 700,
                }}
              />
            )}

            {/* Active Users */}
            {activeUsers.length > 0 && (
              <Tooltip title={`Active users: ${activeUsers.map(u => u.userName).join(", ")}`}>
                <AvatarGroup max={4} sx={{ cursor: "pointer" }}>
                  {activeUsers.map((user) => (
                    <Avatar
                      key={user.userId}
                      sx={{
                        bgcolor: "#10b981",
                        width: 32,
                        height: 32,
                        fontSize: "0.875rem",
                      }}
                    >
                      {user.userName?.charAt(0).toUpperCase()}
                    </Avatar>
                  ))}
                </AvatarGroup>
              </Tooltip>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Participants Card */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <Card
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
            }}
          >
            <CardContent sx={{ textAlign: "center" }}>
              <Avatar
                sx={{
                  bgcolor: "rgba(16, 185, 129, 0.2)",
                  color: "#10b981",
                  width: 56,
                  height: 56,
                  mx: "auto",
                  mb: 2,
                }}
              >
                <PeopleIcon fontSize="large" />
              </Avatar>
              <Typography variant="h4" fontWeight={700} sx={{ color: "#10b981", mb: 1 }}>
                {driveData.participants?.length || 0}
              </Typography>
              <Typography variant="body2" sx={{ color: "#9ca3af" }}>
                Total Participants
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Collaborative Impact Summary */}
      <Paper
        elevation={2}
        sx={{
          p: 3,
          bgcolor: "rgba(255, 255, 255, 0.05)",
          border: focusedFields.summary ? "2px solid #10b981" : "1px solid rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" fontWeight={700} sx={{ color: "#10b981", mb: 2 }}>
          {isFinalized 
            ? "Impact Summary (Finalized)" 
            : focusedFields.summary 
              ? `Impact Summary (${focusedFields.summary.userName} is editing...)` 
              : "Impact Summary (Collaborative)"}
        </Typography>
        <TextField
          value={impactData.summary}
          onChange={(e) => !isFinalized && handleFieldChange("summary", e.target.value, e.target.selectionStart)}
          onFocus={(e) => !isFinalized && handleFieldFocus("summary", e.target.selectionStart)}
          onBlur={() => !isFinalized && handleFieldBlur("summary")}
          onSelect={(e) => !isFinalized && handleCursorMove("summary", e.target.selectionStart)}
          placeholder={isFinalized ? "This impact board has been finalized." : "Share the complete story of this initiative - what was accomplished, challenges overcome, lessons learned, community impact, and future recommendations..."}
          multiline
          rows={12}
          fullWidth
          variant="outlined"
          disabled={isFinalized}
          sx={{
            "& .MuiOutlinedInput-root": {
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
              opacity: 0.7,
            },
          }}
        />
        
        <Box sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 2 }}>
          <Box>
            <Typography variant="body2" sx={{ color: "#9ca3af", mb: 0.5 }}>
              Event Date
            </Typography>
            <Typography variant="body1" sx={{ color: "#e5e7eb" }}>
              {new Date(driveData.eventDate).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: "#9ca3af", mb: 0.5 }}>
              Status
            </Typography>
            <Chip
              label="Completed"
              sx={{
                bgcolor: "rgba(59, 130, 246, 0.2)",
                color: "#3b82f6",
                fontWeight: 600,
              }}
            />
          </Box>
        </Box>
      </Paper>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog}
        onClose={() => setConfirmDialog(false)}
        PaperProps={{
          sx: {
            bgcolor: "#1e293b",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }
        }}
      >
        <DialogTitle sx={{ color: "#10b981", fontWeight: 700 }}>
          Finalize Impact Board
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "#e5e7eb" }}>
            Are you sure you want to finalize the Impact Board? This action cannot be undone and will stop all editing. The summary will be processed by AI and made available to everyone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setConfirmDialog(false)}
            sx={{ color: "#9ca3af" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleFinishImpactBoard}
            variant="contained"
            sx={{
              bgcolor: "#10b981",
              "&:hover": {
                bgcolor: "#059669",
              },
            }}
          >
            Finalize
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ImpactBoard;
