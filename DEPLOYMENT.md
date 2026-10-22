# RuralCraft Global — Vercel Multi-Frontend Deployment Guide

This project is structured into **two completely independent frontend applications**:

1. **Customer & Artisan Frontend** (`/frontend`) → **Vercel Deployment 1**
2. **Admin Panel** (`/admin`) → **Vercel Deployment 2**

Both connect to your configured Supabase database (`https://kavxfpixxanfeakornff.supabase.co`) and backend API.

---

## 🏗️ Architecture Layout

```
manoj_project/
├── frontend/                # Customer & Artisan Frontend (Vercel Deployment 1)
│   ├── package.json
│   ├── vite.config.ts
│   ├── vercel.json
│   ├── index.html
│   ├── .env
│   └── src/                 # ZERO admin components or admin routes
│       ├── components/
│       │   └── Navbar.tsx   # Perfectly aligned 3-column responsive header
│       ├── pages/           # Marketplace, ProductDetail, Cart, Checkout, ArtisanStudio
│       └── ...
├── admin/                   # Standalone Admin Portal (Vercel Deployment 2)
│   ├── package.json
│   ├── vite.config.ts
│   ├── vercel.json
│   ├── index.html
│   ├── .env
│   └── src/                 # Admin auth, dashboard, analytics, customs, HS codes
│       └── ...
└── server/                  # Shared Express & Customs Automation API Backend
```

---

## 🚀 Step-by-Step Vercel Deployment

### Deployment 1: Customer / Main Frontend
1. On your [Vercel Dashboard](https://vercel.com/dashboard), click **"Add New..." → "Project"**.
2. Import your GitHub repository (`manoj_project`).
3. In Project Configuration:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click **Edit** and select **`frontend`**
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. In **Environment Variables**, add:
   ```env
   VITE_API_BASE=https://your-api-domain.com/api
   VITE_SUPABASE_URL=https://kavxfpixxanfeakornff.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthdnhmcGl4eGFuZmVha29ybmZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2NTU4MTksImV4cCI6MjEwODIzMTgxOX0.CEl6EY6ypvAaQeSpjUq8X49O0U78JqKTTjcOytWkNYw
   ```
5. Click **Deploy**.

---

### Deployment 2: Admin Panel
1. In your [Vercel Dashboard](https://vercel.com/dashboard), click **"Add New..." → "Project"** again.
2. Select the **same GitHub repository** (`manoj_project`).
3. In Project Configuration:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click **Edit** and select **`admin`**
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. In **Environment Variables**, add:
   ```env
   VITE_API_BASE=https://your-api-domain.com/api
   VITE_SUPABASE_URL=https://kavxfpixxanfeakornff.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthdnhmcGl4eGFuZmVha29ybmZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2NTU4MTksImV4cCI6MjEwODIzMTgxOX0.CEl6EY6ypvAaQeSpjUq8X49O0U78JqKTTjcOytWkNYw
   VITE_MAIN_APP_URL=https://your-frontend-deployment.vercel.app
   ```
5. Click **Deploy**.

---

## 💻 Running Both Locally

```bash
# Start backend server (port 5000) + Customer frontend (port 5173) + Admin panel (port 5174):
npm run dev
```

Or test them independently:

```bash
# Frontend only (Customer & Artisan)
npm run dev:frontend

# Admin only (Admin Command Center)
npm run dev:admin

# API Server only
npm run server
```

- **Customer / Artisan Marketplace**: `http://localhost:5173`
- **Admin Panel**: `http://localhost:5174`
- **Backend API**: `http://localhost:5000`
