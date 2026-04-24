import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Layout';
import Login from './pages/Login';
import Feed from './pages/Feed';
import Messaging from './pages/Messaging';
import Network from './pages/Network';
import Jobs from './pages/Jobs';
import Profile from './pages/Profile';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-blue-600 font-bold text-4xl tracking-tighter mb-4 animate-bounce">CH</div>
      <div className="w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-blue-600 animate-[loading_1.5s_infinite_ease-in-out]" />
      </div>
    </div>
  );
  
  if (!user) return <Navigate to="/login" replace />;
  
  return (
    <>
      <Navbar />
      <div className="bg-[#F3F2EF] min-h-[calc(100vh-64px)]">
        {children}
      </div>
    </>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
          <Route path="/messaging" element={<ProtectedRoute><Messaging /></ProtectedRoute>} />
          <Route path="/network" element={<ProtectedRoute><Network /></ProtectedRoute>} />
          <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
          <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><div className="p-20 text-center font-bold text-gray-400 italic">Notifications coming soon...</div></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
