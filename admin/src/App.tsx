import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboard } from './pages/AdminDashboard';

const AdminLoading = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#0D2818]">
    <div className="flex flex-col items-center gap-3">
      <div className="w-12 h-12 rounded-2xl bg-[#DDA15E] flex items-center justify-center animate-pulse">
        <span className="text-[#0D2818] font-black text-xl">RC</span>
      </div>
      <div className="text-xs text-[#DDA15E] font-semibold tracking-wider uppercase">Loading Admin Portal...</div>
    </div>
  </div>
);

const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAdminAuth();

  if (loading) return <AdminLoading />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AdminRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<AdminLoginPage />} />

      {/* Admin Panel Sections */}
      <Route path="/" element={<ProtectedAdminRoute><Navigate to="/dashboard" replace /></ProtectedAdminRoute>} />
      <Route path="/dashboard" element={<ProtectedAdminRoute><AdminDashboard initialTab="dashboard" /></ProtectedAdminRoute>} />
      <Route path="/users" element={<ProtectedAdminRoute><AdminDashboard initialTab="users" /></ProtectedAdminRoute>} />
      <Route path="/products" element={<ProtectedAdminRoute><AdminDashboard initialTab="products" /></ProtectedAdminRoute>} />
      <Route path="/orders" element={<ProtectedAdminRoute><AdminDashboard initialTab="orders" /></ProtectedAdminRoute>} />
      <Route path="/hs-codes" element={<ProtectedAdminRoute><AdminDashboard initialTab="hs-codes" /></ProtectedAdminRoute>} />
      <Route path="/customs" element={<ProtectedAdminRoute><AdminDashboard initialTab="customs" /></ProtectedAdminRoute>} />
      <Route path="/currency" element={<ProtectedAdminRoute><AdminDashboard initialTab="currency" /></ProtectedAdminRoute>} />
      <Route path="/settings" element={<ProtectedAdminRoute><AdminDashboard initialTab="settings" /></ProtectedAdminRoute>} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AdminAuthProvider>
          <AdminRoutes />
        </AdminAuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
