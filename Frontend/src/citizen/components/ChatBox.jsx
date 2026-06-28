import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  CircularProgress,
} from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';

const ChatBox = ({ messages, loading, messagesEndRef }) => {
  return (
    <Paper
      elevation={1}
      sx={{
        flex: 1,
        p: 2,
        mb: 2,
        overflow: 'auto',
        bgcolor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 2,
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
      }}
    >
      {messages.map((message, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
            mb: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
              gap: 1,
              maxWidth: '75%',
            }}
          >
            <Avatar
              sx={{
                bgcolor: message.role === 'user' ? '#0e7490' : '#10b981',
                width: 36,
                height: 36,
              }}
            >
              {message.role === 'user' ? <PersonIcon /> : <SmartToyIcon />}
            </Avatar>
            <Paper
              sx={{
                p: 2,
                bgcolor: message.role === 'user' 
                  ? 'rgba(14, 116, 144, 0.9)' 
                  : 'rgba(255, 255, 255, 0.08)',
                color: message.role === 'user' ? 'white' : '#e5e7eb',
                borderRadius: 2,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {message.content}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  mt: 0.5,
                  opacity: 0.7,
                }}
              >
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Typography>
            </Paper>
          </Box>
        </Box>
      ))}
      {loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Avatar sx={{ bgcolor: '#10b981', width: 36, height: 36 }}>
            <SmartToyIcon />
          </Avatar>
          <Paper sx={{ 
            p: 2, 
            borderRadius: 2,
            bgcolor: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
          }}>
            <CircularProgress size={20} sx={{ color: '#10b981' }} />
            <Typography variant="body2" component="span" sx={{ ml: 1, color: '#e5e7eb' }}>
              EcoBot is typing...
            </Typography>
          </Paper>
        </Box>
      )}
      <div ref={messagesEndRef} />
    </Paper>
  );
};

export default ChatBox;
