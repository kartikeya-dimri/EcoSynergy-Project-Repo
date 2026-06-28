import React, { useState, useEffect } from 'react';
import { Container, Box } from '@mui/material';
import RecyclingIcon from '@mui/icons-material/Recycling';
import PeopleIcon from '@mui/icons-material/People';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import NatureIcon from '@mui/icons-material/Nature';
import HeroSection from '../components/HeroSection';
import RightCard from '../components/RightCard';


const HomePage = () => {
  const words = ['Collaborate', 'Conserve', 'Change', 'Connect'];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [activeCard, setActiveCard] = useState(0);

  const communityEfforts = [
    {
      icon: <PeopleIcon sx={{ fontSize: 60, color: '#047857' }} />,
      title: 'Community United',
      description: 'Join hands with local community to create a cleaner, greener environment',
    },
    {
      icon: <CleaningServicesIcon sx={{ fontSize: 60, color: '#0e7490' }} />,
      title: 'Be a part of Community Initiatives!',
      description: 'Organizing local cleanup drives to keep our neighborhoods pristine',
    },
    {
      icon: <RecyclingIcon sx={{ fontSize: 60, color: '#059669' }} />,
      title: 'Recycle Together',
      description: 'Be a part of sustainable waste management',
    },
    {
      icon: <NatureIcon sx={{ fontSize: 60, color: '#10b981' }} />,
      title: 'Green Future',
      description: 'Building a sustainable tomorrow through collective action today',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      
      setTimeout(() => {
        setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
        setActiveCard((prevIndex) => (prevIndex + 1) % communityEfforts.length);
        setIsVisible(true);
      }, 500); // Wait for fade out
    }, 3000); // Change both every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <Container maxWidth="xl" sx={{ minHeight: '90vh', display: 'flex', alignItems: 'center', py: 4, gap: 4 }}>
      <HeroSection words={words} currentWordIndex={currentWordIndex} isVisible={isVisible} />
      <RightCard communityEfforts={communityEfforts} activeCard={activeCard} />
    </Container>
  );
};

export default HomePage;