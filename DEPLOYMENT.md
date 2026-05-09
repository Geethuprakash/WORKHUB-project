# Work Hub - Deployment Guide

## 1. Backend Deployment (Render.com)

1.  **Push Code to GitHub**: Ensure your `backend` folder is in a GitHub repository.
2.  **Create New Web Service**:
    - Go to [Render Dashboard](https://dashboard.render.com/).
    - Click **New +** -> **Web Service**.
    - Connect your GitHub repository.
3.  **Configure Service**:
    - **Root Directory**: `backend`
    - **Runtime**: Node
    - **Build Command**: `npm install`
    - **Start Command**: `node server.js`
4.  **Environment Variables**:
    - Add the following variables in the "Environment" tab:
        - `DB_HOST`: (Your production MySQL host, e.g., from generic hosting or Aiven)
        - `DB_USER`: (Your DB user)
        - `DB_PASSWORD`: (Your DB password)
        - `DB_NAME`: `perila_db`
        - `JWT_SECRET`: (A strong random string)
        - `PORT`: `10000` (Render default)

## 2. Frontend Deployment (Vercel)

1.  **Push Code to GitHub**: Ensure your `web-app` folder is in the repository.
2.  **Import Project in Vercel**:
    - Go to [Vercel Dashboard](https://vercel.com/dashboard).
    - Click **Add New...** -> **Project**.
    - Import your GitHub repository.
3.  **Configure Project**:
    - **Framework Preset**: Next.js
    - **Root Directory**: `web-app` (Click Edit to select it).
4.  **Environment Variables**:
    - Start the deployment.
    - Note: You might need to update the API URL in the frontend code (`http://localhost:5000`) to your deployed Render URL (e.g., `https://workhub-backend.onrender.com`).
    - **Recommended**: Create a `.env.local` in `web-app` with `NEXT_PUBLIC_API_URL` and update all `axios` calls to use it.

## 3. Database Migration

- Export your local `workhubDB.sql` (or use the one provided).
- Import it into your production MySQL database (e.g., using phpMyAdmin or Workbench).

## 4. Final Steps

- Update the frontend API calls to point to the production backend URL.
- Replace `http://localhost:5000` with your new backend URL in all frontend files (or use a global constant/env var).
