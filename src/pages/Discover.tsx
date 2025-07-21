import React from 'react';
import { Navigate } from 'react-router-dom';

const Discover = () => {
  // Redirect to Pet Social as the default discover view
  return <Navigate to="/pet-social" replace />;
};

export default Discover;