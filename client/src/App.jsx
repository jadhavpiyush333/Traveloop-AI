import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Destinations from './pages/Destinations';
import DestinationDetail from './pages/DestinationDetail';
import Planner from './pages/Planner';
import Login from './pages/Login';
import Signup from './pages/Signup';

// A simple wrapper to protect routes that require authentication
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return null; // or a loading spinner
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Layout component that includes the Navbar and base styling
const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white overflow-hidden">
      <Navbar />
      {children}
    </div>
  );
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      {/* Protected Routes */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/destinations" 
        element={
          <ProtectedRoute>
            <Layout>
              <Destinations />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/destination/:id" 
        element={
          <ProtectedRoute>
            <Layout>
              <DestinationDetail />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/planner" 
        element={
          <ProtectedRoute>
            <Layout>
              <Planner />
            </Layout>
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
