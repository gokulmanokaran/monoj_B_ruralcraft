import React from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { CartDrawer } from '../components/CartDrawer';

interface MainLayoutProps {
  children: React.ReactNode;
  fullWidth?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, fullWidth = false }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF7]">
      <Navbar />
      <main className={`flex-1 pt-16 ${fullWidth ? '' : ''}`}>
        {children}
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
};
