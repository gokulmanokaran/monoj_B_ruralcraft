# RuralCraft Global — Vercel Multi-Frontend Deployment Guide

This project is structured into **two independently deployable frontend applications** that share the same Supabase database and authentication system:

1. **Customer & Artisan Main Frontend** (`/`) → **Vercel Deployment 1**
2. **Admin Panel** (`/admin`) → **Vercel Deployment 2**

---

## 🏗️ Architecture Overview

```
                                  ┌──────────────────────────┐
                                  │   Supabase PostgreSQL   │
                                  │   & REST API Backend     │
                                  └─────────────┬────────────┘
                                                │
                     ┌──────────────────────────┴──────────────────────────┐
                     │                                                     │
                     ▼                                                     ▼
        ┌─────────────────────────┐                           ┌─────────────────────────┐
        │   Vercel Deployment 1   │                           │   Vercel Deployment 2   │
        │  Customer / Main App    │                           │       Admin Panel       │
        ├─────────────────────────┤                           ├─────────────────────────┤
        │ Root Directory: .       │                           │ Root Directory: admin   │
        │ • Global Marketplace    │                           │ • Customs & Invoices    │
        │ • Real-time Currency    │                           │ • HS Code Master Table  │
        │ • Artisan Studio        │                           │ • Platform Analytics    │
        │ • Cart & Checkout       │                           │ • Order Shipments       │
        │ • Order History         │                           │ • Artisan Verification  │
        └─────────────────────────┘                           └─────────────────────────┘
```

---

## 🚀 Deployment Instructions for Vercel

### Deployment 1: Customer / Main Frontend

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New..." → "Project"**.
2. Select and import your GitHub repository (`manoj_project` or your repo name).
3. In the project configuration:
   - **Project Name**: `ruralcraft-global` (or your choice)
   - **Framework Preset**: `Vite` (automatically detected)
   - **Root Directory**: Leave as `./` (default)
   - **Build Command**: `npm run build` (or `vite build`)
   - **Output Directory**: `dist`
4. In **Environment Variables**, add:
   ```env
   VITE_API_BASE=https://your-api-domain.com/api
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_ADMIN_URL=https://ruralcraft-admin.vercel.app
   ```
5. Click **Deploy**.

---

### Deployment 2: Admin Panel

1. In your [Vercel Dashboard](https://vercel.com/dashboard), click **"Add New..." → "Project"** again.
2. Select the **same GitHub repository**.
3. In the project configuration:
   - **Project Name**: `ruralcraft-admin` (or your choice)
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click **Edit** and choose `admin`
   - **Build Command**: `npm run build` (or `vite build`)
   - **Output Directory**: `dist`
4. In **Environment Variables**, add:
   ```env
   VITE_API_BASE=https://your-api-domain.com/api
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_MAIN_APP_URL=https://ruralcraft-global.vercel.app
   ```
5. Click **Deploy**.

---

## 💻 Running Both Locally

To develop and test both frontends together with the server on your computer:

```bash
# Start Server (port 5000) + Main Frontend (port 5173) + Admin Panel (port 5174) concurrently:
npm run dev
```

Or run them individually:

```bash
# Main Frontend only
npm run client

# Admin Panel only
npm run admin

# Express Backend only
npm run server
```

Local access URLs:
- **Main Frontend (Customer & Artisan)**: `http://localhost:5173`
- **Admin Panel**: `http://localhost:5174`
- **API Server**: `http://localhost:5000`

---

## 🔒 Shared Supabase Schema & Authentication

Both deployments share the exact same database tables and security policies:
- Run `supabase_schema.sql` in your Supabase SQL Editor.
- When an order is placed from **Deployment 1**, it immediately reflects in the live analytics and customs queue of **Deployment 2**.
- When an admin updates an HS code or order status in **Deployment 2**, it is reflected in **Deployment 1**.
