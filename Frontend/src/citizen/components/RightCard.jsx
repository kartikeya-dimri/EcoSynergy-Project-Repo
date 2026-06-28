import React from 'react';
import { Box, Card, CardContent, Typography, Fade } from '@mui/material';

const RightCard = ({ communityEfforts, activeCard }) => {
  return (
    <Box 
      sx={{ 
        flex: 1, 
        display: { xs: 'none', md: 'flex' }, 
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        minHeight: '400px',
      }}
    >
      {communityEfforts.map((effort, index) => (
        <Fade key={index} in={activeCard === index} timeout={1000}>
          <Card
            sx={{
              position: 'absolute',
              width: '100%',
              maxWidth: '450px',
              background: 'linear-gradient(135deg, #a7f3d0 0%, #7dd3fc 100%)',
              borderRadius: 4,
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
              transform: activeCard === index ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(10px)',
              opacity: activeCard === index ? 1 : 0,
              transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              display: activeCard === index ? 'block' : 'none',
            }}
          >
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  mb: 3,
                  animation: 'float 3s ease-in-out infinite',
                  '@keyframes float': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                  },
                }}
              >
                {effort.icon}
              </Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  color: '#047857',
                  mb: 2,
                  fontFamily: 'Poppins, sans-serif',
                }}
              >
                {effort.title}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: '#475569',
                  fontSize: '1.1rem',
                  lineHeight: 1.6,
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 700,
                }}
              >
                {effort.description}
              </Typography>
            </CardContent>
          </Card>
        </Fade>
      ))}
    </Box>
  );
};

export default RightCard;
