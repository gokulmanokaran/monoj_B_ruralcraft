import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User as UserIcon, Palette } from 'lucide-react';

export const RoleSwitcher: React.FC = () => {
  const { user, role, demoLogin, loading } = useAuth();
  const { success } = useToast();

  const handleSwitch = async (targetRole: 'customer' | 'artisan') => {
    if (role === targetRole) return;
    await demoLogin(targetRole);
    const names = {
      customer: 'Customer (Johnathan Doe)',
      artisan: 'Artisan (Lakshmi Handicrafts)'
    };
    success(`Switched to demo role: ${names[targetRole]}`);
  };

  return (
    <div className="bg-[#143826] text-white py-1.5 px-4 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-[#2D6A4F]/60">
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="font-semibold text-emerald-200 uppercase tracking-wider text-[10px]">
          Demo Role Switcher:
        </span>
        <span className="hidden sm:inline text-stone-300">
          Current: <strong className="text-white capitalize">{role || 'Guest'}</strong> {user ? `(${user.full_name})` : ''}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={loading}
          onClick={() => handleSwitch('customer')}
          className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
            role === 'customer'
              ? 'bg-[#DDA15E] text-[#1F2421] shadow-sm font-bold'
              : 'bg-white/10 hover:bg-white/20 text-white'
          }`}
        >
          <UserIcon className="w-3.5 h-3.5" />
          <span>Customer</span>
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={() => handleSwitch('artisan')}
          className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
            role === 'artisan'
              ? 'bg-[#DDA15E] text-[#1F2421] shadow-sm font-bold'
              : 'bg-white/10 hover:bg-white/20 text-white'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Artisan</span>
        </button>
      </div>
    </div>
  );
};
