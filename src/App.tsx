import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';

// Pages (lazy loaded for performance)
import { LandingPage } from './pages/LandingPage';
import { ExplorePage } from './pages/ExplorePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { AuthPage } from './pages/AuthPage';
import { ArtisansPage } from './pages/ArtisansPage';
import { ArtisanProfilePage } from './pages/ArtisanProfilePage';
import { OrdersPage } from './pages/OrdersPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ArtisanDashboard } from './pages/artisan/ArtisanDashboard';
import { AddProductPage } from './pages/artisan/AddProductPage';

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

// Protected route wrapper
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

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/explore" element={<ExplorePage />} />
      <Route path="/products/:slug" element={<ProductDetailPage />} />
      <Route path="/artisans" element={<ArtisansPage />} />
      <Route path="/artisans/:id" element={<ArtisanProfilePage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="/register" element={<AuthPage />} />

      {/* Protected Customer Routes */}
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/account" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
      <Route path="/account/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
      <Route path="/orders/:id" element={<OrderDetailPage />} />

      {/* Artisan Routes */}
      <Route path="/artisan" element={<ProtectedRoute requiredRole="artisan"><ArtisanDashboard /></ProtectedRoute>} />
      <Route path="/artisan/add-product" element={<ProtectedRoute requiredRole="artisan"><AddProductPage /></ProtectedRoute>} />
      <Route path="/artisan/products" element={<ProtectedRoute requiredRole="artisan"><ArtisanDashboard /></ProtectedRoute>} />
      <Route path="/artisan/orders" element={<ProtectedRoute requiredRole="artisan"><ArtisanDashboard /></ProtectedRoute>} />
      <Route path="/artisan/sales" element={<ProtectedRoute requiredRole="artisan"><ArtisanDashboard /></ProtectedRoute>} />
      <Route path="/artisan/profile" element={<ProtectedRoute requiredRole="artisan"><ArtisanDashboard /></ProtectedRoute>} />

      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/products" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/orders" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/hs-codes" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/customs" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/currency" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />

      {/* Catch-all redirect */}
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
