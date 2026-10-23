import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Leaf, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

/**
 * OAuth Callback Page - handles redirect after Google (or any provider) OAuth sign-in.
 * Supabase redirects to /auth/callback with the session in the URL hash.
 */
export const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Completing sign-in...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase automatically picks up the session from URL hash
        const { data, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (data.session?.user) {
          setStatus('success');
          setMessage(`Welcome! Redirecting...`);

          // Get user role to redirect properly
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.session.user.id)
            .maybeSingle();

          const role = profile?.role || 'customer';

          setTimeout(() => {
            if (role === 'artisan') navigate('/artisan', { replace: true });
            else if (role === 'admin') navigate('/admin', { replace: true });
            else navigate('/', { replace: true });
          }, 1000);
        } else {
          setStatus('error');
          setMessage('Authentication failed. Please try again.');
          setTimeout(() => navigate('/login', { replace: true }), 2000);
        }
      } catch (err: any) {
        setStatus('error');
        setMessage(err.message || 'Sign-in failed. Please try again.');
        setTimeout(() => navigate('/login', { replace: true }), 2000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D2818] via-[#143826] to-[#1B4332] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-sm text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#DDA15E] flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Leaf className="w-7 h-7 text-[#0D2818]" />
        </div>
        <div className="font-heading font-black text-xl text-stone-900 mb-1">RuralCraft Global</div>

        <div className="mt-6 flex flex-col items-center gap-3">
          {status === 'loading' && (
            <>
              <Loader2 className="w-8 h-8 animate-spin text-[#143826]" />
              <p className="text-sm text-stone-600 font-medium">{message}</p>
            </>
          )}
          {status === 'success' && (
            <>
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              <p className="text-sm text-emerald-700 font-semibold">{message}</p>
            </>
          )}
          {status === 'error' && (
            <>
              <AlertCircle className="w-8 h-8 text-red-500" />
              <p className="text-sm text-red-600 font-medium">{message}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
