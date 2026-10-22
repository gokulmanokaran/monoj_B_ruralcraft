import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Globe, Share2, Send, MessageCircle, Heart, Mail, Phone } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0D2818] text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-[#2D6A4F] flex items-center justify-center">
                <Leaf className="w-5 h-5 text-[#DDA15E]" />
              </div>
              <div>
                <div className="font-heading font-extrabold text-lg leading-none text-white">RuralCraft Global</div>
                <div className="text-[9px] text-[#DDA15E] tracking-widest uppercase mt-0.5">Artisan E-Commerce Platform</div>
              </div>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed mb-5">
              Made to connect rural craftsmanship with the world. Every purchase sustains a traditional craft and supports a rural family.
            </p>
            <div className="flex items-center gap-2.5">
              {[
                { Icon: Globe, href: '#', label: 'Website' },
                { Icon: Share2, href: '#', label: 'Share' },
                { Icon: Send, href: '#', label: 'Channel' },
                { Icon: MessageCircle, href: '#', label: 'Community' }
              ].map(({ Icon, href, label }, i) => (
                <a key={i} href={href} aria-label={label} className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#DDA15E] flex items-center justify-center text-white transition-all hover:scale-110">
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Platform links */}
          <div>
            <h4 className="font-heading font-bold text-sm uppercase tracking-wider text-[#DDA15E] mb-4">Platform</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Explore Products', href: '/explore' },
                { label: 'Meet Our Artisans', href: '/artisans' },
                { label: 'How It Works', href: '/#how-it-works' },
                { label: 'Customs Intelligence', href: '/#features' },
                { label: 'Become an Artisan', href: '/register?role=artisan' }
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link to={href} className="text-sm text-stone-400 hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-heading font-bold text-sm uppercase tracking-wider text-[#DDA15E] mb-4">Support</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'FAQ / Help Center', href: '#' },
                { label: 'Shipping Policy', href: '#' },
                { label: 'Returns & Refunds', href: '#' },
                { label: 'Customs Documentation', href: '#' },
                { label: 'Privacy Policy', href: '#' },
                { label: 'Terms of Use', href: '#' }
              ].map(({ label, href }) => (
                <li key={label}>
                  <a href={href} className="text-sm text-stone-400 hover:text-white transition-colors">{label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact / Stats */}
          <div>
            <h4 className="font-heading font-bold text-sm uppercase tracking-wider text-[#DDA15E] mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2.5 text-sm text-stone-400">
                <Mail className="w-4 h-4 text-[#52B788] shrink-0" />
                <span>contact@ruralcraft.global</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-stone-400">
                <Phone className="w-4 h-4 text-[#52B788] shrink-0" />
                <span>+91 80 4200 8888</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-stone-400">
                <Globe className="w-4 h-4 text-[#52B788] shrink-0" />
                <span>Registered in India. Serving 25+ countries.</span>
              </li>
            </ul>

            {/* Stats bar */}
            <div className="mt-6 grid grid-cols-3 gap-2">
              {[
                { val: '500+', label: 'Artisans' },
                { val: '25+', label: 'Countries' },
                { val: '2K+', label: 'Products' }
              ].map(({ val, label }) => (
                <div key={label} className="text-center p-2 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-base font-black text-[#DDA15E] font-heading">{val}</div>
                  <div className="text-[9px] text-stone-500 uppercase tracking-wider">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-500">
          <p>© 2026 RuralCraft Global. All rights reserved. | Student Demo Platform — Not Commercially Active.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for rural artisan communities.
          </p>
        </div>
      </div>
    </footer>
  );
};
