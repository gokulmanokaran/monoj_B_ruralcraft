import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight, Globe, Sparkles, FileText, Coins,
  Star, Award, ShieldCheck, Leaf, ChevronRight, Play
} from 'lucide-react';
import { MainLayout } from '../layouts/MainLayout';

const stats = [
  { value: '500+', label: 'Rural Artisans', icon: '🧑‍🎨' },
  { value: '25+', label: 'Countries Reached', icon: '🌍' },
  { value: '2,000+', label: 'Handmade Products', icon: '🏺' },
  { value: '96%', label: 'HS Code Accuracy', icon: '✅' }
];

const features = [
  {
    icon: Globe,
    color: 'bg-[#143826]/10 text-[#143826]',
    title: 'Global Marketplace',
    description: 'Connecting rural artisans of India with conscious international buyers across 25+ countries through a seamless digital storefront.'
  },
  {
    icon: Coins,
    color: 'bg-amber-100 text-amber-700',
    title: 'Multi-Currency Prices',
    description: 'All products stored in INR, auto-converted to USD, EUR, GBP, AED, AUD, CAD, SGD, and JPY using live exchange rates.'
  },
  {
    icon: Sparkles,
    color: 'bg-purple-100 text-purple-700',
    title: 'Smart HS Code Engine',
    description: 'AI-style rule-based HS code classification for easier product categorization and customs tariff lookup. Admin-verified per export.'
  },
  {
    icon: FileText,
    color: 'bg-emerald-100 text-emerald-700',
    title: 'Customs Ready PDFs',
    description: 'One-click Commercial Invoice & Customs Declaration PDF generation with HS codes, buyer/exporter details, and official disclaimers.'
  }
];

const crafts = [
  { img: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?q=80&w=600&auto=format&fit=crop', title: 'Bamboo Weaving' },
  { img: 'https://images.unsplash.com/photo-1514517521153-1be72277b32f?q=80&w=600&auto=format&fit=crop', title: 'Terracotta Pottery' },
  { img: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=600&auto=format&fit=crop', title: 'Handloom Textiles' },
  { img: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=600&auto=format&fit=crop', title: 'Wood Carving' },
  { img: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=600&auto=format&fit=crop', title: 'Jute Crafts' },
  { img: 'https://images.unsplash.com/photo-1582561424760-0321d75e81fa?q=80&w=600&auto=format&fit=crop', title: 'Dokra Metalwork' }
];

const steps = [
  { num: '01', title: 'Browse & Discover', desc: 'Explore thousands of authentic handmade products from verified rural artisans across India.' },
  { num: '02', title: 'Select Your Currency', desc: 'View prices in USD, EUR, GBP, AED or 5 more currencies — always based on live rates.' },
  { num: '03', title: 'Place International Order', desc: 'Complete checkout with your international shipping address. Order ID generated instantly.' },
  { num: '04', title: 'Customs Docs Auto-Created', desc: 'Commercial invoice and customs declaration PDF generated with suggested HS codes for hassle-free export clearance.' }
];

export const LandingPage: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);

  return (
    <MainLayout>
      {/* Hero */}
      <section ref={heroRef} className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-[#0D2818] via-[#143826] to-[#1B4332]">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full border border-white/5"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 70, repeat: Infinity, ease: 'linear' }}
            className="absolute -bottom-24 -left-24 w-[400px] h-[400px] rounded-full border border-[#DDA15E]/10"
          />
          <div className="absolute top-1/4 right-1/3 w-2 h-2 rounded-full bg-[#DDA15E]/50 animate-pulse" />
          <div className="absolute top-1/2 right-1/4 w-3 h-3 rounded-full bg-[#52B788]/40 animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-1/3 left-1/4 w-2 h-2 rounded-full bg-white/30 animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid lg:grid-cols-2 gap-12 items-center relative z-10 w-full">
          {/* Left Text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-[#DDA15E]/15 border border-[#DDA15E]/30 text-[#DDA15E] px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6"
            >
              <Leaf className="w-3.5 h-3.5" />
              Rural Artisan International E-Commerce
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="font-heading text-5xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight mb-6"
            >
              From Rural
              <br />
              <span className="text-[#DDA15E]">Hands</span> to
              <br />
              Global <span className="text-[#52B788]">Homes.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="text-base lg:text-lg text-stone-300 leading-relaxed mb-8 max-w-lg"
            >
              Discover authentic handmade products crafted by talented rural artisans and delivered to customers around the world — with automated customs documentation.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="flex flex-wrap gap-3 mb-10"
            >
              <Link
                to="/explore"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#DDA15E] hover:bg-[#BC6C25] text-[#0D2818] font-bold rounded-2xl transition-all hover:shadow-lg hover:shadow-[#DDA15E]/30 hover:scale-[1.02] active:scale-[0.98]"
              >
                Explore Products
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/register?role=artisan"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl border border-white/20 transition-all backdrop-blur-sm"
              >
                Become an Artisan
              </Link>
            </motion.div>

            {/* Mini Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex flex-wrap gap-3"
            >
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                  className="flex items-center gap-2 bg-white/8 border border-white/12 backdrop-blur-sm rounded-xl px-3 py-2"
                >
                  <span className="text-lg">{s.icon}</span>
                  <div>
                    <div className="font-heading font-black text-white text-sm leading-none">{s.value}</div>
                    <div className="text-[10px] text-stone-400">{s.label}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Image Grid */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            style={{ y: heroY }}
            className="grid grid-cols-2 gap-3 lg:gap-4 hidden lg:grid"
          >
            {crafts.slice(0, 4).map((craft, i) => (
              <motion.div
                key={craft.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className={`overflow-hidden rounded-2xl ${i === 0 ? 'row-span-2' : ''}`}
              >
                <div className="relative h-40 group">
                  <img
                    src={craft.img}
                    alt={craft.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                    <span className="text-white text-xs font-semibold">{craft.title}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce opacity-50">
          <div className="w-0.5 h-8 bg-white/40 rounded-full" />
          <div className="text-white text-[10px] uppercase tracking-widest">Scroll</div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-[#FAFAF7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#BC6C25] mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Why RuralCraft Global
            </div>
            <h2 className="font-heading text-3xl lg:text-5xl font-black text-[#1F2421] leading-tight mb-4">
              Built for Global Artisan Trade
            </h2>
            <p className="text-stone-500 max-w-xl mx-auto text-base">
              The first international e-commerce platform built from the ground up for rural Indian craftmakers — with customs intelligence built in.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 border border-stone-200 hover:border-[#2D6A4F]/40 hover:shadow-lg hover:-translate-y-1 transition-all group"
              >
                <div className={`w-11 h-11 rounded-xl ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-bold text-base text-stone-900 mb-2">{f.title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 bg-gradient-to-br from-[#143826] to-[#0D2818] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#DDA15E] mb-3">
              <Play className="w-3.5 h-3.5 fill-[#DDA15E]" /> How It Works
            </div>
            <h2 className="font-heading text-3xl lg:text-5xl font-black leading-tight">
              From Craft to Customer,
              <br />
              <span className="text-[#DDA15E]">Globally.</span>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="relative"
              >
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-[#DDA15E]/40 to-transparent z-0" />
                )}
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-[#DDA15E]/15 border border-[#DDA15E]/30 flex items-center justify-center mb-4">
                    <span className="font-heading font-black text-[#DDA15E] text-xl">{step.num}</span>
                  </div>
                  <h3 className="font-heading font-bold text-base mb-2 text-white">{step.title}</h3>
                  <p className="text-sm text-stone-400 leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Showcase Strip */}
      <section className="py-24 bg-[#FAFAF7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-[#BC6C25] mb-2">Our Craft Collection</div>
              <h2 className="font-heading text-3xl lg:text-4xl font-black text-[#1F2421]">
                Traditional Crafts,<br />Modern World.
              </h2>
            </div>
            <Link to="/explore" className="hidden sm:flex items-center gap-2 text-sm font-bold text-[#143826] hover:text-[#2D6A4F] transition-colors">
              View All Products <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {crafts.map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="group cursor-pointer"
              >
                <Link to="/explore">
                  <div className="aspect-square overflow-hidden rounded-2xl bg-stone-100 mb-2">
                    <img
                      src={c.img}
                      alt={c.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <p className="text-xs font-semibold text-stone-700 text-center group-hover:text-[#143826] transition-colors">{c.title}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="about" className="py-20 bg-gradient-to-br from-[#DDA15E]/10 via-[#FAFAF7] to-[#143826]/8">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="w-16 h-16 rounded-2xl bg-[#143826] flex items-center justify-center mx-auto mb-6">
              <Award className="w-8 h-8 text-[#DDA15E]" />
            </div>
            <h2 className="font-heading text-3xl lg:text-5xl font-black text-[#1F2421] mb-4 leading-tight">
              Join the Rural Craft Revolution
            </h2>
            <p className="text-base text-stone-500 mb-8 max-w-lg mx-auto leading-relaxed">
              Whether you're a rural craftmaker or an international buyer, RuralCraft Global creates a direct, fair, and transparent global trade ecosystem.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/explore" className="px-8 py-4 bg-[#143826] hover:bg-[#0D2818] text-white font-bold rounded-2xl transition-all hover:shadow-lg hover:shadow-[#143826]/30 inline-flex items-center gap-2">
                Start Exploring
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/register?role=artisan" className="px-8 py-4 border-2 border-[#143826] text-[#143826] font-bold rounded-2xl hover:bg-[#143826]/5 transition-all inline-flex items-center gap-2">
                Register as Artisan
                <ShieldCheck className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </MainLayout>
  );
};
