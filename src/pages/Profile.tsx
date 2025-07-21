import React from 'react';
import { Navigate } from 'react-router-dom';

const Profile = () => {
  // Redirect to My Pets as the default profile view
  return <Navigate to="/my-pets" replace />;
};

export default Profile;