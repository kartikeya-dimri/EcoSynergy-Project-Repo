import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Chip,
  Grid,
  Avatar,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EventIcon from "@mui/icons-material/Event";
import NewInitiativeModal from "../components/NewInitiativeModal";
import InitiativeCard from "../components/InitiativeCard";
import { useSocket } from "../../context/SocketContext";

const MyInitiatives = () => {
  const navigate = useNavigate();
  const socket = useSocket();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initiatives, setInitiatives] = useState([]);
  const [filter, setFilter] = useState("all");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [cancelDialog, setCancelDialog] = useState({ open: false, driveId: null });
  const [cancellationReason, setCancellationReason] = useState("");

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const fetchInitiatives = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    let url = `${import.meta.env.VITE_API_URL}/user/myDrive`;
    if (filter !== "all") {
      url += `?filter=${filter}`;
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

    const token = localStorage.getItem("token");
    if (!token) return;

    const userId = JSON.parse(atob(token.split('.')[1])).id;

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

    // Listen for drive cancellation (if someone else cancels a drive you created)
    socket.on("driveCancelled", (cancelledDrive) => {
      console.log("📢 Drive cancelled:", cancelledDrive);
      
      // Update the drive if it's one of the user's drives
      if (cancelledDrive.createdBy === userId || cancelledDrive.createdBy._id === userId) {
        setInitiatives((prevInitiatives) =>
          prevInitiatives.map((drive) =>
            drive._id === cancelledDrive._id
              ? { ...drive, status: "cancelled", cancellationReason: cancelledDrive.cancellationReason }
              : drive
          )
        );
      }
    });

    // Cleanup listeners on unmount
    return () => {
      socket.off("driveUpdated");
      socket.off("driveCancelled");
    };
  }, [socket, filter]);


  const handleLaunchInitiative = async (formData) => {
    const token = localStorage.getItem("token");
    if (!token) {
      showSnackbar("You must be logged in to create an initiative.", "error");
      return;
    }

    const timeFrom = new Date(`${formData.eventDate}T${formData.timeFrom}`);
    const timeTo = new Date(`${formData.eventDate}T${formData.timeTo}`);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/user/communityDrive`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...formData, timeFrom, timeTo }),
        }
      );

      if (response.ok) {
        setIsModalOpen(false);
        showSnackbar("Initiative created successfully!", "success");
        fetchInitiatives();
      } else {
        const errorData = await response.json();
        showSnackbar(`Failed to create initiative: ${errorData.error}`, "error");
      }
    } catch (error) {
      console.error("Error launching initiative:", error);
      showSnackbar("An error occurred while launching the initiative.", "error");
    }
  };

  const handleCancelDrive = (driveId) => {
    setCancelDialog({ open: true, driveId });
    setCancellationReason("");
  };

  const confirmCancelDrive = async () => {
    const token = localStorage.getItem("token");
    const { driveId } = cancelDialog;

    if (!token) {
      showSnackbar("You must be logged in.", "error");
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/user/cancelDrive/${driveId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ cancellationReason }),
        }
      );

      if (response.ok) {
        showSnackbar("Drive cancelled successfully.", "success");
        setCancelDialog({ open: false, driveId: null });
        setCancellationReason("");
        fetchInitiatives();
      } else {
        const errorData = await response.json();
        showSnackbar(`Failed to cancel drive: ${errorData.error}`, "error");
      }
    } catch (error) {
      console.error("Error cancelling drive:", error);
      showSnackbar("An error occurred while cancelling the drive.", "error");
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

  return (
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
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar sx={{ bgcolor: "#10b981", width: 56, height: 56 }}>
                <EventIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight={700}>
                  My Initiatives 🌱
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Create and manage your community drives
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setIsModalOpen(true)}
              sx={{
                bgcolor: "white",
                color: "#047857",
                fontWeight: 600,
                px: 3,
                py: 1.5,
                "&:hover": {
                  bgcolor: "#f0fdf4",
                },
              }}
            >
              Launch New Initiative
            </Button>
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
                  onCancel={handleCancelDrive}
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
            <EventIcon sx={{ fontSize: 64, color: "#ffffff", mb: 2 }} />
            <Typography variant="h6" color="#ffffff" gutterBottom>
              No initiatives found
            </Typography>
            <Typography variant="body2" color="#ffffff">
              Get started by launching your first community initiative!
            </Typography>
          </Paper>
        )}
      </Box>

      <NewInitiativeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onLaunch={handleLaunchInitiative}
      />

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

      <Dialog open={cancelDialog.open} onClose={() => setCancelDialog({ open: false, driveId: null })}>
        <DialogTitle sx={{ background: "linear-gradient(90deg, #047857 0%, #0e7490 100%)", color: "#fff" }}>
          Cancel Drive
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please provide a reason for cancellation (optional):
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
            placeholder="Enter cancellation reason..."
            variant="outlined"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setCancelDialog({ open: false, driveId: null })}
            sx={{ color: "#6b7280" }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmCancelDrive}
            variant="contained"
            sx={{
              background: "linear-gradient(90deg, #047857 0%, #0e7490 100%)",
              color: "#fff",
              "&:hover": {
                background: "linear-gradient(90deg, #059669 0%, #0891b2 100%)",
              },
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyInitiatives;