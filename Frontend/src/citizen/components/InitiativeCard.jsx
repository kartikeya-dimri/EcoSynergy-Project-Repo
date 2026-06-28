import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  Card,
  CardContent,
  Snackbar,
  Alert,
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PeopleIcon from "@mui/icons-material/People";
import PersonIcon from "@mui/icons-material/Person";
import CancelIcon from "@mui/icons-material/Cancel";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ForumIcon from "@mui/icons-material/Forum";
import AssessmentIcon from "@mui/icons-material/Assessment";

const InitiativeCard = ({
  initiative,
  showOrganizer = false,
  isJoined = false,
  onCancel,
  onJoin,
  onLeave,
  onDiscussion,
  onImpactBoard,
}) => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleDiscussionClick = () => {
    // Check if drive is cancelled or completed
    if (initiative.status === "cancelled" || initiative.status === "completed") {
      setSnackbarMessage("This initiative is now closed");
      setSnackbarOpen(true);
      return;
    }

    // Check if user has joined
    if (!isJoined && !onCancel) {
      // If not joined and not the organizer (onCancel means it's the organizer's card)
      setSnackbarMessage("Only joined members can access the discussion forum");
      setSnackbarOpen(true);
    } else {
      onDiscussion && onDiscussion(initiative._id);
    }
  };

  const handleImpactBoardClick = () => {
    // If result exists, anyone can view the summary
    if (initiative.result) {
      onImpactBoard && onImpactBoard(initiative._id, true); // Pass true for view summary mode
    } else {
      // For active impact board, check if user has joined or is the organizer
      if (!isJoined && !onCancel) {
        setSnackbarMessage("Impact board is accessible only to participants");
        setSnackbarOpen(true);
      } else {
        onImpactBoard && onImpactBoard(initiative._id, false); // Pass false for edit mode
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };
  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return {
          bgcolor: "rgba(16, 185, 129, 0.1)",
          color: "#10b981",
        };
      case "completed":
        return {
          bgcolor: "rgba(59, 130, 246, 0.1)",
          color: "#3b82f6",
        };
      case "cancelled":
        return {
          bgcolor: "rgba(107, 114, 128, 0.1)",
          color: "#6b7280",
        };
      default:
        return {
          bgcolor: "rgba(107, 114, 128, 0.1)",
          color: "#6b7280",
        };
    }
  };

  return (
    <Card
      elevation={2}
      sx={{
        height: "100%",
        width: "350px",
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
        backgroundColor: "#1e293b",
        transition: "all 0.3s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 3, display: "flex", flexDirection: "column" }}>
        {/* Header with Title and Status */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "start",
            mb: 2,
          }}
        >
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{ color: "#10b981", flexGrow: 1 }}
          >
            {initiative.heading}
          </Typography>
          <Chip
            label={initiative.status}
            size="large"
            sx={{
              ...getStatusColor(initiative.status),
              fontWeight: 600,
              textTransform: "capitalize",
              marginLeft: 2,
            }}
          />
        </Box>

        {/* Description with Scrollbar */}
        <Box
          sx={{
            mb: showOrganizer ? 2 : 3,
            maxHeight: "80px",
            overflowY: "auto",
            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "rgba(0, 0, 0, 0.05)",
              borderRadius: "3px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#10b981",
              borderRadius: "3px",
              "&:hover": {
                backgroundColor: "#059669",
              },
            },
          }}
        >
          <Typography
            variant="body2"
            sx={{ lineHeight: 1.6, color: "#94a3b8" }}
          >
            {initiative.description}
          </Typography>
        </Box>

        {/* Organizer Info (optional) */}
        {showOrganizer && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <PersonIcon sx={{ fontSize: 16, color: "#64748b" }} />
            <Typography variant="caption" sx={{ color: "#94a3b8" }}>
              Organized by {initiative.createdBy?.name || "Unknown"}
            </Typography>
          </Box>
        )}

        {/* Event Details */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <EventIcon sx={{ fontSize: 18, color: "#10b981" }} />
            <Typography variant="body2" sx={{ color: "#94a3b8" }}>
              {new Date(initiative.eventDate).toLocaleDateString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AccessTimeIcon sx={{ fontSize: 18, color: "#06b6d4" }} />
            <Typography variant="body2" sx={{ color: "#94a3b8" }}>
              {new Date(initiative.timeFrom).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              -{" "}
              {new Date(initiative.timeTo).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <PeopleIcon sx={{ fontSize: 18, color: "#10b981" }} />
            <Typography variant="body2" sx={{ color: "#94a3b8" }}>
              {initiative.participants.length} / {initiative.upperLimit}{" "}
              participants
            </Typography>
          </Box>
        </Box>

        {/* Cancellation Reason */}
        {initiative.status === "cancelled" && initiative.cancellationReason && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              bgcolor: "rgba(239, 68, 68, 0.15)",
              borderRadius: 1,
              borderLeft: "3px solid #ef4444",
            }}
          >
            <Typography
              variant="caption"
              color="#ef4444"
              fontWeight={600}
              display="block"
              sx={{ mb: 0.5 }}
            >
              Cancellation Reason:
            </Typography>
            <Typography variant="body2" sx={{ color: "#fca5a5" }}>
              {initiative.cancellationReason}
            </Typography>
          </Box>
        )}

        {/* Spacer to push buttons to bottom */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Action Buttons */}
        {initiative.status === "active" && (
          <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid #334155", display: "flex", flexDirection: "column", gap: 1.5 }}>
            {onCancel && (
              <Button
                fullWidth
                variant="outlined"
                color="error"
                size="small"
                startIcon={<CancelIcon />}
                onClick={() => onCancel(initiative._id)}
                sx={{
                  borderColor: "#ef4444",
                  color: "#ef4444",
                  "&:hover": {
                    borderColor: "#dc2626",
                    bgcolor: "rgba(239, 68, 68, 0.04)",
                  },
                }}
              >
                Cancel Drive
              </Button>
            )}

            {onLeave && isJoined && (
              <Button
                fullWidth
                variant="outlined"
                color="error"
                size="small"
                startIcon={<ExitToAppIcon />}
                onClick={() => onLeave(initiative._id)}
                sx={{
                  borderColor: "#ef4444",
                  color: "#ef4444",
                  "&:hover": {
                    borderColor: "#dc2626",
                    bgcolor: "rgba(239, 68, 68, 0.04)",
                  },
                }}
              >
                Leave Drive
              </Button>
            )}

            {onJoin && !isJoined && (
              <Button
                fullWidth
                variant="contained"
                size="small"
                startIcon={<CheckCircleIcon />}
                onClick={() => onJoin(initiative._id)}
                sx={{
                  bgcolor: "#047857",
                  "&:hover": { bgcolor: "#059669" },
                  fontWeight: 600,
                }}
              >
                Join Drive
              </Button>
            )}
          </Box>
        )}

        {/* Discussion Forum Button - Always visible except for completed */}
        {initiative.status !== "completed" && (
          <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid #334155" }}>
            <Button
              fullWidth
              variant="outlined"
              size="small"
              startIcon={<ForumIcon />}
              onClick={handleDiscussionClick}
              sx={{
                borderColor: "#06b6d4",
                color: "#06b6d4",
                "&:hover": {
                  borderColor: "#22d3ee",
                  bgcolor: "rgba(6, 182, 212, 0.1)",
                },
              }}
            >
              Discussion Forum
            </Button>
          </Box>
        )}

        {/* Impact Board / View Summary Button - Only for completed initiatives */}
        {initiative.status === "completed" && (
          <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid #334155" }}>
            <Button
              fullWidth
              variant="outlined"
              size="small"
              startIcon={<AssessmentIcon />}
              onClick={handleImpactBoardClick}
              sx={{
                borderColor: initiative.result ? "#10b981" : "#8b5cf6",
                color: initiative.result ? "#10b981" : "#8b5cf6",
                "&:hover": {
                  borderColor: initiative.result ? "#34d399" : "#a78bfa",
                  bgcolor: initiative.result ? "rgba(16, 185, 129, 0.1)" : "rgba(139, 92, 246, 0.1)",
                },
              }}
            >
              {initiative.result ? "📊 View Summary" : "✏️ Impact Board"}
            </Button>
          </Box>
        )}
      </CardContent>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="warning"
          sx={{ width: "200px" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default InitiativeCard;
