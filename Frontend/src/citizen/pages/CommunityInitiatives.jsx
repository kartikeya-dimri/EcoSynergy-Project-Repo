import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Paper,
  Typography,
  Chip,
  Grid,
  Avatar,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  DialogContentText,
} from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";
import InitiativeCard from "../components/InitiativeCard";
import { useSocket } from "../../context/SocketContext";

const CommunityInitiatives = () => {
  const navigate = useNavigate();
  const socket = useSocket();
  const [initiatives, setInitiatives] = useState([]);
  const [filter, setFilter] = useState("active");
  const [joinedDrives, setJoinedDrives] = useState(new Set());
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [leaveDialog, setLeaveDialog] = useState({ open: false, driveId: null });

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const fetchInitiatives = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    let url = `${import.meta.env.VITE_API_URL}/user/allDrives`;
    if (filter !== "all") {
      url += `?status=${filter}`;
    }

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setInitiatives(data.drives);
        
        // Track which drives the current user has joined
        const userId = JSON.parse(atob(token.split('.')[1])).id;
        const joined = new Set();
        data.drives.forEach(drive => {
          if (drive.participants.includes(userId)) {
            joined.add(drive._id);
          }
        });
        setJoinedDrives(joined);
      }
    } catch (error) {
      console.error("Error fetching initiatives:", error);
    }
  };

  useEffect(() => {
    fetchInitiatives();
  }, [filter]);

  // Socket event listeners for real-time updates
  useEffect(() => {
    if (!socket) return;

    // Listen for new drive created
    socket.on("driveCreated", (newDrive) => {
      console.log("📢 New drive created:", newDrive);
      setInitiatives((prevInitiatives) => {
        // Add to list if it matches current filter
        if (newDrive.status === filter || filter === "all") {
          return [newDrive, ...prevInitiatives];
        }
        return prevInitiatives;
      });
      showSnackbar("New community drive created!", "info");
    });

    // Listen for drive updates (join/leave)
    socket.on("driveUpdated", ({ driveId, participantsCount, action }) => {
      console.log(`📢 Drive ${action}:`, driveId, participantsCount);
      setInitiatives((prevInitiatives) =>
        prevInitiatives.map((drive) =>
          drive._id === driveId
            ? { ...drive, participants: Array(participantsCount).fill(null) }
            : drive
        )
      );
    });

    // Listen for drive cancellation
    socket.on("driveCancelled", (cancelledDrive) => {
      console.log("📢 Drive cancelled:", cancelledDrive);
      setInitiatives((prevInitiatives) =>
        prevInitiatives.map((drive) =>
          drive._id === cancelledDrive._id
            ? { ...drive, status: "cancelled", cancellationReason: cancelledDrive.cancellationReason }
            : drive
        )
      );
      
      // Remove from active filter view if currently on active
      if (filter === "active") {
        setInitiatives((prevInitiatives) =>
          prevInitiatives.filter((drive) => drive._id !== cancelledDrive._id)
        );
      }
      
      showSnackbar("A drive has been cancelled", "warning");
    });

    // Cleanup listeners on unmount
    return () => {
      socket.off("driveCreated");
      socket.off("driveUpdated");
      socket.off("driveCancelled");
    };
  }, [socket, filter]);


  const handleJoinDrive = async (driveId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      showSnackbar("You must be logged in to join a drive.", "error");
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/user/joinDrive/${driveId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        showSnackbar("Successfully joined the drive!", "success");
        fetchInitiatives();
      } else {
        const errorData = await response.json();
        showSnackbar(errorData.error || "Failed to join drive", "error");
      }
    } catch (error) {
      console.error("Error joining drive:", error);
      showSnackbar("An error occurred while joining the drive.", "error");
    }
  };

  const handleLeaveDrive = (driveId) => {
    setLeaveDialog({ open: true, driveId });
  };

  const confirmLeaveDrive = async () => {
    const token = localStorage.getItem("token");
    const { driveId } = leaveDialog;

    if (!token) {
      showSnackbar("You must be logged in.", "error");
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/user/leaveDrive/${driveId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        showSnackbar("Successfully left the drive.", "success");
        setLeaveDialog({ open: false, driveId: null });
        fetchInitiatives();
      } else {
        const errorData = await response.json();
        showSnackbar(`Failed to leave drive: ${errorData.error}`, "error");
      }
    } catch (error) {
      console.error("Error leaving drive:", error);
      showSnackbar("An error occurred while leaving the drive.", "error");
    }
  };

  const handleDiscussionForum = (driveId) => {
    // Navigate to discussion forum page
    navigate(`/discussion/${driveId}`);
  };

  const handleImpactBoard = (driveId, isViewSummary) => {
    // Navigate to view summary if finalized, otherwise impact board
    if (isViewSummary) {
      navigate(`/view-summary/${driveId}`);
    } else {
      navigate(`/impact-board/${driveId}`);
    }
  };

  const isJoined = (driveId) => joinedDrives.has(driveId);

  return (
    <>
      <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        {/* Header */}
        <Paper
          elevation={2}
          sx={{
            p: 3,
            mb: 3,
            background: "linear-gradient(90deg, #047857 0%, #0e7490 100%)",
            color: "white",
            borderRadius: 2,
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Avatar sx={{ bgcolor: "#10b981", width: 56, height: 56 }}>
              <GroupsIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight={700}>
                Community Initiatives 🌍
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Join community drives and make a difference together
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Filter Chips */}
        <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
          <Chip
            label="All"
            onClick={() => setFilter("all")}
            sx={{
              bgcolor: filter === "all" ? "rgba(16, 185, 129, 0.2)" : "rgba(0, 0, 0, 0.05)",
              color: filter === "all" ? "#10b981" : "#6b7280",
              border: filter === "all" ? "1px solid rgba(16, 185, 129, 0.5)" : "none",
              fontWeight: 600,
              "&:hover": {
                bgcolor: filter === "all" ? "rgba(16, 185, 129, 0.3)" : "rgba(0, 0, 0, 0.1)",
              },
            }}
          />
          <Chip
            label="Active"
            onClick={() => setFilter("active")}
            sx={{
              bgcolor: filter === "active" ? "rgba(16, 185, 129, 0.2)" : "rgba(0, 0, 0, 0.05)",
              color: filter === "active" ? "#10b981" : "#6b7280",
              border: filter === "active" ? "1px solid rgba(16, 185, 129, 0.5)" : "none",
              fontWeight: 600,
              "&:hover": {
                bgcolor: filter === "active" ? "rgba(16, 185, 129, 0.3)" : "rgba(0, 0, 0, 0.1)",
              },
            }}
          />
          <Chip
            label="Completed"
            onClick={() => setFilter("completed")}
            sx={{
              bgcolor: filter === "completed" ? "rgba(16, 185, 129, 0.2)" : "rgba(0, 0, 0, 0.05)",
              color: filter === "completed" ? "#10b981" : "#6b7280",
              border: filter === "completed" ? "1px solid rgba(16, 185, 129, 0.5)" : "none",
              fontWeight: 600,
              "&:hover": {
                bgcolor: filter === "completed" ? "rgba(16, 185, 129, 0.3)" : "rgba(0, 0, 0, 0.1)",
              },
            }}
          />
        </Box>

        {/* Initiatives Grid */}
        {initiatives.length > 0 ? (
          <Grid container spacing={3}>
            {initiatives.map((initiative) => (
              <Grid item xs={12} sm={6} md={4} key={initiative._id}>
                <InitiativeCard
                  initiative={initiative}
                  showOrganizer={true}
                  isJoined={isJoined(initiative._id)}
                  onJoin={handleJoinDrive}
                  onLeave={handleLeaveDrive}
                  onDiscussion={handleDiscussionForum}
                  onImpactBoard={handleImpactBoard}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper
            elevation={0}
            sx={{
              p: 8,
              textAlign: "center",
              bgcolor: "rgba(0, 0, 0, 0.02)",
              borderRadius: 2,
            }}
          >
            <GroupsIcon sx={{ fontSize: 64, color: "#ffffff", mb: 2 }} />
            <Typography variant="h6" color="#ffffff" gutterBottom>
              No initiatives found
            </Typography>
            <Typography variant="body2" color="#ffffff">
              Check back later for new community initiatives!
            </Typography>
          </Paper>
        )}
      </Box>
    </Container>

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

    <Dialog open={leaveDialog.open} onClose={() => setLeaveDialog({ open: false, driveId: null })}>
      <DialogTitle sx={{ background: "linear-gradient(90deg, #047857 0%, #0e7490 100%)", color: "#fff" }}>
        Leave Drive
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <DialogContentText>
          Are you sure you want to leave this drive? You can rejoin later if needed.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={() => setLeaveDialog({ open: false, driveId: null })}
          sx={{ color: "#6b7280" }}
        >
          Cancel
        </Button>
        <Button
          onClick={confirmLeaveDrive}
          variant="contained"
          sx={{
            background: "linear-gradient(90deg, #047857 0%, #0e7490 100%)",
            color: "#fff",
            "&:hover": {
              background: "linear-gradient(90deg, #059669 0%, #0891b2 100%)",
            },
          }}
        >
          Leave Drive
        </Button>
      </DialogActions>
    </Dialog>
    </>
  );
};

export default CommunityInitiatives;