import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  IconButton,
  Grid,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const NewInitiativeModal = ({ isOpen, onClose, onLaunch }) => {
  const [formData, setFormData] = useState({
    heading: "",
    description: "",
    eventDate: "",
    timeFrom: "",
    timeTo: "",
    upperLimit: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !formData.heading ||
      !formData.description ||
      !formData.eventDate ||
      !formData.timeFrom ||
      !formData.timeTo ||
      !formData.upperLimit
    ) {
      alert("Please fill all fields");
      return;
    }
    onLaunch(formData);
  };

  return (
    <Dialog
      open={isOpen}
  
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          background: "linear-gradient(90deg, #047857 0%, #0e7490 100%)",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          py: 2,
        }}
      >
        <Box>
          <Box sx={{ fontWeight: 700, fontSize: "1.25rem" }}>
            Launch New Initiative 🚀
          </Box>
          <Box sx={{ fontSize: "0.875rem", opacity: 0.9, mt: 0.5 }}>
            Create a community drive to make an impact
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: "white",
            "&:hover": { bgcolor: "rgba(255, 255, 255, 0.1)" },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <TextField
              fullWidth
              label="Initiative Title"
              name="heading"
              value={formData.heading}
              onChange={handleChange}
              placeholder="e.g., Neighborhood Cleanup Drive"
              required
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": {
                    borderColor: "#047857",
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#047857",
                },
              }}
            />

            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={3}
              placeholder="Describe the goals of your initiative"
              required
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": {
                    borderColor: "#047857",
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#047857",
                },
              }}
            />

            <TextField
              fullWidth
              label="Event Date"
              name="eventDate"
              type="date"
              value={formData.eventDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              required
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": {
                    borderColor: "#047857",
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#047857",
                },
              }}
            />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Start Time"
                  name="timeFrom"
                  type="time"
                  value={formData.timeFrom}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  required
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&.Mui-focused fieldset": {
                        borderColor: "#047857",
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#047857",
                    },
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="End Time"
                  name="timeTo"
                  type="time"
                  value={formData.timeTo}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  required
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&.Mui-focused fieldset": {
                        borderColor: "#047857",
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#047857",
                    },
                  }}
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label="Maximum Participants"
              name="upperLimit"
              type="number"
              value={formData.upperLimit}
              onChange={handleChange}
              placeholder="e.g., 50"
              inputProps={{ min: 1 }}
              required
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": {
                    borderColor: "#047857",
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#047857",
                },
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={onClose}
            sx={{
              color: "#6b7280",
              "&:hover": { bgcolor: "rgba(0, 0, 0, 0.05)" },
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            sx={{
              bgcolor: "#047857",
              "&:hover": { bgcolor: "#059669" },
              fontWeight: 600,
              px: 3,
            }}
          >
            Launch Initiative
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default NewInitiativeModal;
