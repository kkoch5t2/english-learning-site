import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getAuthToken } from '../apiClient';

const PrivateRoute = () => {
  const token = getAuthToken();
  return token ? <Outlet /> : <Navigate to="/login/" />;
};

export default PrivateRoute;
