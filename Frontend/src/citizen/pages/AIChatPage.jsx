import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Chip,
  CircularProgress,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import RecyclingIcon from '@mui/icons-material/Recycling';
import axios from 'axios';
import ChatBox from '../components/ChatBox';

const AIChatPage = () => {
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      content: "👋 Hello! I'm EcoBot, your recycling and waste disposal assistant! Ask me anything about how to properly dispose of items, which bin to use, or general recycling tips.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const quickQuestions = [
    'How to dispose of batteries?',
    'Which bin for plastic bottles?',
    'Can I pour oil down the sink?',
    'How to recycle electronics?',
    'Glass bottle disposal',
    'Cardboard recycling tips',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (messageText) => {
    console.log(import.meta.env.VITE_API_KEY);
    if (!messageText.trim()) return;

    const userMessage = {
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const systemPrompt = `You are EcoBot, an expert assistant for recycling and waste disposal. 
      Help users understand how to properly dispose of various items, which bins to use, and environmental best practices.
      Be concise, friendly, and informative. Use emojis when appropriate to make responses engaging.
      Focus on: proper disposal methods, recycling guidelines, environmental impact, and safety concerns.
      
      User question: ${messageText}`;

      const res = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${import.meta.env.VITE_API_KEY}`,
        {
          contents: [
            {
              parts: [{ text: systemPrompt }],
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const botResponse = res.data.candidates[0].content.parts[0].text.replace(/\*\*/g, "");

      const botMessage = {
        role: 'bot',
        content: botResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        role: 'bot',
        content: "😕 Sorry, I'm having trouble connecting right now. Please try again in a moment!",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => {
    sendMessage(input);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickQuestion = (question) => {
    sendMessage(question);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, height: 'calc(100vh - 100px)' }}>
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Paper
          elevation={2}
          sx={{
            p: 2,
            mb: 2,
            background: 'linear-gradient(90deg, #047857 0%, #0e7490 100%)',
            color: 'white',
            borderRadius: 2,
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: '#10b981' }}>
              <SmartToyIcon />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={700}>
                EcoBot 🌱
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Your Recycling & Waste Disposal Assistant
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Quick Questions */}
        {messages.length === 1 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1, color: '#9ca3af' }}>
              Quick questions to get started:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {quickQuestions.map((question, index) => (
                <Chip
                  key={index}
                  label={question}
                  onClick={() => handleQuickQuestion(question)}
                  sx={{
                    cursor: 'pointer',
                    bgcolor: 'rgba(16, 185, 129, 0.1)',
                    color: '#10b981',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    '&:hover': { 
                      bgcolor: 'rgba(16, 185, 129, 0.2)',
                      borderColor: 'rgba(16, 185, 129, 0.5)',
                    },
                  }}
                  icon={<RecyclingIcon sx={{ color: '#10b981' }} />}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Messages Container */}
        <ChatBox messages={messages} loading={loading} messagesEndRef={messagesEndRef} />

        {/* Input Box */}
        <Paper
          elevation={2}
          sx={{
            p: 2,
            display: 'flex',
            gap: 1,
            borderRadius: 2,
            bgcolor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <TextField
            fullWidth
            multiline
            maxRows={3}
            placeholder="Ask about recycling, waste disposal, or proper item disposal..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                color: '#e5e7eb',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#10b981',
                },
              },
              '& .MuiInputBase-input::placeholder': {
                color: '#9ca3af',
                opacity: 1,
              },
            }}
          />
          <IconButton
            color="primary"
            onClick={handleSend}
            disabled={!input.trim() || loading}
            size="small"
            sx={{
              bgcolor: '#047857',
              color: 'white',
              width: '50px',
              height: '50px',
              flexShrink: 0,
              '&:hover': { bgcolor: '#059669' },
              '&:disabled': { bgcolor: '#e5e7eb' },
            }}
          >
            <SendIcon fontSize="small" />
          </IconButton>
        </Paper>
      </Box>
    </Container>
  );
};

export default AIChatPage;