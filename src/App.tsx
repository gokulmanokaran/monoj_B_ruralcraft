import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';

import { Link } from 'react-router-dom';
import { Shield, ExternalLink } from 'lucide-react';

// Pages
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
import { ArtisanDashboard } from './pages/artisan/ArtisanDashboard';
import { AddProductPage } from './pages/artisan/AddProductPage';

const AdminPortalNotice: React.FC = () => {
  const adminUrl = import.meta.env.VITE_ADMIN_URL || 'http://localhost:5174';
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-stone-200 shadow-xl text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#0D2818] flex items-center justify-center mx-auto mb-4 text-[#DDA15E]">
          <Shield className="w-7 h-7" />
        </div>
        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200 uppercase tracking-wider">
          Independent Vercel Deployment
        </span>
        <h2 className="font-heading font-black text-2xl text-stone-900 mt-3 mb-2">Admin Portal</h2>
        <p className="text-xs text-stone-500 mb-6 leading-relaxed">
          The RuralCraft Global Admin Panel is deployed as an independent application on Vercel with dedicated customs automation and analytics.
        </p>
        <a
          href={adminUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-2xl bg-[#143826] hover:bg-[#0D2818] text-white font-bold text-sm transition-all shadow-md hover:shadow-lg cursor-pointer"
        >
          <span>Launch Admin Panel</span>
          <ExternalLink className="w-4 h-4 text-[#DDA15E]" />
        </a>
        <div className="mt-5 pt-4 border-t border-stone-100">
          <Link to="/" className="text-xs text-stone-500 hover:text-[#143826] font-medium">
            ← Return to Artisan & Customer Storefront
          </Link>
        </div>
      </div>
    </div>
  );
};

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

      {/* Admin Portal Redirect (Deployed Separately on Vercel) */}
      <Route path="/admin/*" element={<AdminPortalNotice />} />
      <Route path="/admin" element={<AdminPortalNotice />} />

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
