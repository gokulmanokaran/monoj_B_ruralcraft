import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { ExplorePage } from './pages/ExplorePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { AuthPage } from './pages/AuthPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { ArtisansPage } from './pages/ArtisansPage';
import { ArtisanProfilePage } from './pages/ArtisanProfilePage';
import { OrdersPage } from './pages/OrdersPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { ArtisanDashboard } from './pages/artisan/ArtisanDashboard';
import { AddProductPage } from './pages/artisan/AddProductPage';

// Admin Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#FAFAF7]">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-[#143826] flex items-center justify-center animate-pulse">
        <span className="text-[#DDA15E] font-black text-lg">R</span>
      </div>
      <div className="text-sm text-stone-400 font-medium">Loading RuralCraft Global...</div>
    </div>
  </div>
);

const AdminLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#0D2818]">
    <div className="flex flex-col items-center gap-3">
      <div className="w-12 h-12 rounded-2xl bg-[#DDA15E] flex items-center justify-center animate-pulse">
        <span className="text-[#0D2818] font-black text-xl">RC</span>
      </div>
      <div className="text-xs text-[#DDA15E] font-semibold tracking-wider uppercase">Loading Admin Portal...</div>
    </div>
  </div>
);

// Protected Customer/Artisan route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredRole?: string }> = ({ children, requiredRole }) => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) return <PageLoader />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Protected Admin route wrapper (strictly enforces Supabase admin authenticated session)
const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) return <AdminLoader />;

  if (!isAuthenticated || role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Customer Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/explore" element={<ExplorePage />} />
      <Route path="/products" element={<ExplorePage />} />
      <Route path="/products/:slug" element={<ProductDetailPage />} />
      <Route path="/artisans" element={<ArtisansPage />} />
      <Route path="/artisans/:id" element={<ArtisanProfilePage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="/register" element={<AuthPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      {/* Protected Customer Routes */}
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/account" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
      <Route path="/account/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
      <Route path="/orders/:id" element={<OrderDetailPage />} />

      {/* Protected Artisan Routes */}
      <Route path="/artisan" element={<ProtectedRoute requiredRole="artisan"><ArtisanDashboard /></ProtectedRoute>} />
      <Route path="/artisan/add-product" element={<ProtectedRoute requiredRole="artisan"><AddProductPage /></ProtectedRoute>} />
      <Route path="/artisan/products" element={<ProtectedRoute requiredRole="artisan"><ArtisanDashboard /></ProtectedRoute>} />
      <Route path="/artisan/orders" element={<ProtectedRoute requiredRole="artisan"><ArtisanDashboard /></ProtectedRoute>} />
      <Route path="/artisan/sales" element={<ProtectedRoute requiredRole="artisan"><ArtisanDashboard /></ProtectedRoute>} />
      <Route path="/artisan/profile" element={<ProtectedRoute requiredRole="artisan"><ArtisanDashboard /></ProtectedRoute>} />

      {/* Unified Admin Routes */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<ProtectedAdminRoute><AdminDashboard initialTab="dashboard" /></ProtectedAdminRoute>} />
      <Route path="/admin/dashboard" element={<ProtectedAdminRoute><AdminDashboard initialTab="dashboard" /></ProtectedAdminRoute>} />
      <Route path="/admin/users" element={<ProtectedAdminRoute><AdminDashboard initialTab="users" /></ProtectedAdminRoute>} />
      <Route path="/admin/products" element={<ProtectedAdminRoute><AdminDashboard initialTab="products" /></ProtectedAdminRoute>} />
      <Route path="/admin/orders" element={<ProtectedAdminRoute><AdminDashboard initialTab="orders" /></ProtectedAdminRoute>} />
      <Route path="/admin/hs-codes" element={<ProtectedAdminRoute><AdminDashboard initialTab="hs-codes" /></ProtectedAdminRoute>} />
      <Route path="/admin/customs" element={<ProtectedAdminRoute><AdminDashboard initialTab="customs" /></ProtectedAdminRoute>} />
      <Route path="/admin/currency" element={<ProtectedAdminRoute><AdminDashboard initialTab="currency" /></ProtectedAdminRoute>} />
      <Route path="/admin/settings" element={<ProtectedAdminRoute><AdminDashboard initialTab="settings" /></ProtectedAdminRoute>} />

      {/* Catch-all redirect to Marketplace home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <CurrencyProvider>
          <AuthProvider>
            <CartProvider>
              <Suspense fallback={<PageLoader />}>
                <AppRoutes />
              </Suspense>
            </CartProvider>
          </AuthProvider>
        </CurrencyProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
