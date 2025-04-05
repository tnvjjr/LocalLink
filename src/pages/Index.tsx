
import React from 'react';
import { Navigate } from 'react-router-dom';

// This component is now just a redirect to the welcome page
const Index = () => {
  return <Navigate to="/" replace />;
};

export default Index;
