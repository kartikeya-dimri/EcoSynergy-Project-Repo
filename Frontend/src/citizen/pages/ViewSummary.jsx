import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Paper,
  Typography,
  IconButton,
  Avatar,
  Chip,
  CircularProgress,
  Card,
  CardContent,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import PeopleIcon from "@mui/icons-material/People";

const ViewSummary = () => {
  const { driveId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [driveData, setDriveData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSummary();
  }, [driveId]);

  const fetchSummary = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/user/viewSummary/${driveId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch summary");
      }

      const data = await response.json();
      setDriveData(data.drive);
    } catch (error) {
      console.error("Error fetching summary:", error);
      setError(error.message);
    } finally {
      setLoading(false);
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

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper
          elevation={2}
          sx={{
            p: 3,
            bgcolor: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
            borderRadius: 2,
            textAlign: "center",
          }}
        >
          <Typography variant="h6" color="error" gutterBottom>
            {error}
          </Typography>
          <Typography variant="body2" sx={{ color: "#9ca3af", mt: 2 }}>
            The impact summary may not be available yet.
          </Typography>
        </Paper>
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

  return (
    <Container maxWidth="lg" sx={{ py: 4, minHeight: "calc(100vh - 100px)" }}>
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton onClick={() => navigate(-1)} sx={{ color: "white" }}>
            <ArrowBackIcon />
          </IconButton>
          <Avatar sx={{ bgcolor: "#059669" }}>
            <EmojiEventsIcon />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" fontWeight={700}>
              Impact Summary 📊
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {driveData.heading}
            </Typography>
          </Box>
          <Chip
            label="✅ Completed"
            sx={{
              bgcolor: "#fbbf24",
              color: "#000",
              fontWeight: 700,
            }}
          />
        </Box>
      </Paper>

      {/* Drive Info Card */}
      <Card
        sx={{
          bgcolor: "rgba(255, 255, 255, 0.05)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          mb: 3,
        }}
      >
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Box>
              <Typography variant="body2" sx={{ color: "#9ca3af", mb: 0.5 }}>
                Organized by
              </Typography>
              <Typography variant="body1" sx={{ color: "#e5e7eb", fontWeight: 600 }}>
                {driveData.createdBy.name}
              </Typography>
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Typography variant="body2" sx={{ color: "#9ca3af", mb: 0.5 }}>
                Event Date
              </Typography>
              <Typography variant="body1" sx={{ color: "#e5e7eb", fontWeight: 600 }}>
                {new Date(driveData.eventDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar
              sx={{
                bgcolor: "rgba(16, 185, 129, 0.2)",
                color: "#10b981",
                width: 40,
                height: 40,
              }}
            >
              <PeopleIcon />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={700} sx={{ color: "#10b981" }}>
                {driveData.participants?.length || 0}
              </Typography>
              <Typography variant="body2" sx={{ color: "#9ca3af" }}>
                Participants
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* AI Generated Summary */}
      <Paper
        elevation={2}
        sx={{
          p: 4,
          bgcolor: "rgba(255, 255, 255, 0.05)",
          border: "2px solid #10b981",
          backdropFilter: "blur(10px)",
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <Avatar
            sx={{
              bgcolor: "rgba(16, 185, 129, 0.2)",
              color: "#10b981",
              width: 48,
              height: 48,
            }}
          >
            🤖
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ color: "#10b981" }}>
              AI-Generated Impact Report
            </Typography>
            <Typography variant="body2" sx={{ color: "#9ca3af" }}>
              Summarized by Gemini AI
            </Typography>
          </Box>
        </Box>

        <Typography
          variant="body1"
          sx={{
            color: "#e5e7eb",
            lineHeight: 1.8,
            whiteSpace: "pre-line",
            fontSize: "1.05rem",
          }}
        >
          {driveData.result}
        </Typography>
      </Paper>

      {/* Description Section */}
      <Paper
        elevation={2}
        sx={{
          p: 3,
          mt: 3,
          bgcolor: "rgba(255, 255, 255, 0.05)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" fontWeight={700} sx={{ color: "#10b981", mb: 2 }}>
          Original Initiative Description
        </Typography>
        <Typography variant="body1" sx={{ color: "#e5e7eb", lineHeight: 1.8 }}>
          {driveData.description}
        </Typography>
      </Paper>
    </Container>
  );
};

export default ViewSummary;
