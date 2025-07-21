# Water Tracker - Vercel Deployment Guide

This guide will help you deploy your Water Tracker app on Vercel with both frontend and backend functionality.

## Prerequisites

1. A Vercel account (free at [vercel.com](https://vercel.com))
2. A MongoDB Atlas database (free tier available)
3. Git repository with your code

## Setup Steps

### 1. MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas) and create a free account
2. Create a new cluster
3. Create a database user with read/write permissions
4. Get your connection string (it looks like: `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`)

### 2. Vercel Deployment

1. **Connect your repository to Vercel:**

   - Go to [vercel.com](https://vercel.com) and sign in
   - Click "New Project"
   - Import your Git repository
   - Select the repository containing your water tracker app

2. **Configure environment variables:**

   - In your Vercel project dashboard, go to Settings → Environment Variables
   - Add the following environment variable:
     - **Name:** `MONGODB_URI`
     - **Value:** Your MongoDB Atlas connection string
     - **Environment:** Production, Preview, Development

3. **Deploy:**
   - Vercel will automatically detect the configuration and deploy your app
   - The frontend will be served from the root domain
   - API routes will be available at `/api/water/*`

### 3. API Routes

The following API endpoints are available:

- `GET /api/water/today` - Get today's water data
- `POST /api/water/add` - Add water intake
- `PUT /api/water/goal` - Update daily goal
- `GET /api/water/history` - Get 7-day history
- `POST /api/water/reset` - Reset today's data
- `DELETE /api/water/remove/[entryId]` - Remove specific entry
- `DELETE /api/water/remove-amount` - Remove specific amount

### 4. Local Development

For local development, create a `.env.local` file in your project root:

```env
VITE_API_URL=http://localhost:5000/api/water
```

Then run:

```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
cd backend
npm run dev
```

## Project Structure

```
water-tracker-vite/
├── api/                    # Vercel serverless functions
│   ├── utils/
│   │   └── db.js          # Shared database connection
│   └── water/
│       ├── today.js       # GET today's data
│       ├── add.js         # POST add water
│       ├── goal.js        # PUT update goal
│       ├── history.js     # GET history
│       ├── reset.js       # POST reset data
│       ├── remove-amount.js # DELETE remove amount
│       └── remove/
│           └── [entryId].js # DELETE remove specific entry
├── src/                   # React frontend
├── backend/               # Original Express server (for local dev)
├── vercel.json           # Vercel configuration
└── package.json          # Frontend dependencies
```

## Features

- ✅ Full-stack deployment on Vercel
- ✅ Serverless API functions
- ✅ MongoDB Atlas integration
- ✅ CORS enabled for cross-origin requests
- ✅ Environment variable configuration
- ✅ Automatic builds and deployments

## Troubleshooting

1. **API not working:** Check that `MONGODB_URI` environment variable is set correctly in Vercel
2. **CORS errors:** The API routes include CORS headers for all origins
3. **Build errors:** Check the Vercel build logs for any missing dependencies

## Support

If you encounter any issues:

1. Check the Vercel deployment logs
2. Verify your MongoDB connection string
3. Ensure all environment variables are set correctly
