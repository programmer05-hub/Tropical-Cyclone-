# CycloShield AI - Deployment Guide

## 1. Live Cloud URL (Already Deployed)
Your application is already deployed and live on Google Cloud Run via Google AI Studio:
- **Shared App URL:** [https://ais-pre-quyzxsdhi4mihwsdnnqdfx-262391657599.asia-southeast1.run.app](https://ais-pre-quyzxsdhi4mihwsdnnqdfx-262391657599.asia-southeast1.run.app)
- **Development App URL:** [https://ais-dev-quyzxsdhi4mihwsdnnqdfx-262391657599.asia-southeast1.run.app](https://ais-dev-quyzxsdhi4mihwsdnnqdfx-262391657599.asia-southeast1.run.app)

---

## 2. Deploy to Render (Full-Stack with Express Backend)
Render hosts both the Vite frontend and Express server on its free tier:

1. Push this repository to **GitHub** (or connect your repo).
2. Go to [render.com](https://render.com) and log in.
3. Click **New +** -> **Web Service**.
4. Select your GitHub repository.
5. Render will automatically detect `render.yaml`, or use these settings:
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
6. Under **Environment Variables**, add:
   - `NODE_ENV` = `production`
   - `GEMINI_API_KEY` = *your Google Gemini API Key* (optional, fallback models are built-in)
7. Click **Create Web Service**. Your live Render link (`https://cycloshield-ai.onrender.com`) will be active in ~2 minutes!

---

## 3. Deploy to Vercel (Fast Global Edge Frontend)
Vercel hosts the frontend instantly:

1. Go to [vercel.com](https://vercel.com) and click **Add New...** -> **Project**.
2. Import your GitHub repository.
3. Vercel automatically detects `vite` with `dist` as the output directory.
4. Settings:
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Click **Deploy**. Your live Vercel link (`https://your-project.vercel.app`) will be active in seconds!
