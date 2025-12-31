# Vercel Deployment Guide

Complete guide for deploying the HeyU Reservation System backend to Vercel.

## Overview

This backend is built as **Vercel Serverless Functions**, using the file-based routing system. Each API endpoint is a separate serverless function in the `api/` directory.

## Prerequisites

- A [Vercel account](https://vercel.com/signup) (free tier is sufficient)
- A GitHub/GitLab/Bitbucket repository (recommended) or local project
- Node.js 18+ installed locally (for testing)

## Project Structure

```
backend/
├── api/                          # Serverless Functions
│   ├── index.js                  # Root endpoint (/api)
│   ├── health.js                 # Health check (/api/health)
│   ├── bookings/                 # Bookings API
│   │   ├── index.js             # GET/POST /api/bookings
│   │   └── [bookingId].js       # GET /api/bookings/:id
│   ├── services.js               # Services API (/api/services)
│   ├── blocked-dates/            # Blocked dates API
│   │   ├── index.js             # GET/POST /api/blocked-dates
│   │   ├── [date].js            # DELETE /api/blocked-dates/:date
│   │   └── [date]/
│   │       └── times/
│   │           └── [time].js    # DELETE /api/blocked-dates/:date/times/:time
│   └── email/
│       └── send-confirmation.js  # Email API (/api/email/send-confirmation)
├── utils/                        # Utility modules
│   ├── redis.js                  # Redis/KV client
│   ├── bookingUtils.js           # Booking data operations
│   ├── serviceUtils.js           # Service data operations
│   ├── blockedDatesUtils.js      # Blocked dates operations
│   └── emailUtils.js             # Email utilities
├── scripts/                      # Utility scripts
│   ├── migrate-to-redis.js       # Migrate from JSON to Redis
│   └── clear-bookings.js         # Clear booking data
├── data/                         # JSON files (fallback/local dev)
│   ├── bookings.json
│   ├── services.json
│   └── blockedDates.json
├── vercel.json                   # Vercel configuration
├── package.json                  # Dependencies
└── REDIS_SETUP.md               # Redis configuration guide
```

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**

   - Visit [https://vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"

2. **Import Repository**

   - Connect your Git provider (GitHub/GitLab/Bitbucket)
   - Select your repository
   - Click "Import"

3. **Configure Project Settings**

   - **Root Directory**: Set to `backend` (not the project root)
   - **Framework Preset**: Other
   - **Build Command**: Leave empty (no build needed)
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install` (or leave default)

4. **Environment Variables**

   - Click "Environment Variables" (or configure later in Settings)
   - Add variables (see [Environment Variables](#environment-variables) section below)

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**

   ```bash
   npm install -g vercel
   ```

2. **Navigate to Backend Directory**

   ```bash
   cd backend
   ```

3. **Login to Vercel**

   ```bash
   vercel login
   ```

4. **Deploy**

   ```bash
   vercel
   ```

   Follow the prompts:

   - Link to existing project or create new
   - Confirm root directory is `backend`
   - Confirm no build command needed

5. **Production Deployment**
   ```bash
   vercel --prod
   ```

## Environment Variables

### Required: Upstash Redis Configuration

The backend uses **Upstash Redis** for data storage. When you create a KV database in Vercel, you're actually creating an Upstash Redis database that Vercel manages.

#### Setup Steps

1. **In Vercel Dashboard** → Your Project → **Storage** tab
2. Click **"Create Database"** → Select **"KV"** (this creates an Upstash Redis database)
3. Choose a name (e.g., `heyu-kv`)
4. Select a region (choose one close to your users)
5. Click **"Create"**

Vercel will automatically set these environment variables:

- `KV_URL` - Used by `@vercel/kv` package
- `KV_REST_API_URL` - Upstash REST API URL
- `KV_REST_API_TOKEN` - Upstash REST API Token
- `KV_REST_API_READ_ONLY_TOKEN` - Read-only Token (optional)

**No manual configuration needed!** The code uses `@vercel/kv` which automatically reads these environment variables.

#### Package Options

This project currently uses **`@vercel/kv`** to access the database. Both `@vercel/kv` and `@upstash/redis` can be used with the same database - they're just different ways to access it:

- **`@vercel/kv`** (Current): Simpler, optimized for Vercel
- **`@upstash/redis`**: More flexible, can be used anywhere

Both packages use the same environment variables (`KV_REST_API_URL` and `KV_REST_API_TOKEN`) to connect to the same Upstash Redis database.

See [REDIS_SETUP.md](./REDIS_SETUP.md) for more details.

### Optional: Email Configuration

For email functionality (booking confirmations), configure Nodemailer:

1. **Using Gmail** (recommended for testing):

   - `EMAIL_HOST=smtp.gmail.com`
   - `EMAIL_PORT=587`
   - `EMAIL_USER=your-email@gmail.com`
   - `EMAIL_PASS=your-app-password` (use App Password, not regular password)

2. **Using Other SMTP Services**:

   - `EMAIL_HOST=your-smtp-host`
   - `EMAIL_PORT=587` (or 465 for SSL)
   - `EMAIL_USER=your-email@domain.com`
   - `EMAIL_PASS=your-password`
   - `EMAIL_SECURE=false` (or `true` for SSL)

3. **Optional Settings**:
   - `EMAIL_FROM=HeyU禾屿 <noreply@yourdomain.com>`
   - `NODE_ENV=production`

> **Note**: Email functionality will gracefully fail if not configured - bookings will still work, but confirmation emails won't be sent.

## API Endpoints

After deployment, your API will be available at:

- **Base URL**: `https://your-project.vercel.app`

### Available Endpoints:

- `GET /api` - API information
- `GET /api/health` - Health check
- `GET /api/bookings` - Get all bookings (query: `?status=confirmed&date=2025-12-25`)
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/:bookingId` - Get single booking
- `GET /api/services` - Get all services
- `POST /api/services` - Create/update service
- `GET /api/blocked-dates` - Get all blocked dates
- `POST /api/blocked-dates` - Create/update blocked date
- `DELETE /api/blocked-dates/:date` - Delete blocked date
- `DELETE /api/blocked-dates/:date/times/:time` - Delete specific time slot
- `POST /api/email/send-confirmation` - Send confirmation email

## Testing Deployment

### 1. Health Check

```bash
curl https://your-project.vercel.app/api/health
```

Expected response:

```json
{
  "status": "ok",
  "message": "HeyU backend service is running"
}
```

### 2. Test API Info

```bash
curl https://your-project.vercel.app/api
```

### 3. Test Bookings Endpoint

```bash
curl https://your-project.vercel.app/api/bookings
```

## Local Development

### Run Locally with Vercel CLI

1. **Install Vercel CLI** (if not already installed):

   ```bash
   npm install -g vercel
   ```

2. **Navigate to backend directory**:

   ```bash
   cd backend
   ```

3. **Link to your Vercel project** (first time only):

   ```bash
   vercel link
   ```

4. **Pull environment variables**:

   ```bash
   vercel env pull .env.local
   ```

5. **Run development server**:

   ```bash
   vercel dev
   ```

   This will:

   - Start a local server (usually on `http://localhost:3000`)
   - Hot-reload on code changes
   - Use the same environment variables as production

### Run with Node.js (Alternative)

1. **Install dependencies**:

   ```bash
   cd backend
   npm install
   ```

2. **Set up environment variables**:

   - Create `.env` file (see [Environment Variables](#environment-variables))
   - Or use `.env.local` (pulled from Vercel)

3. **Run the entry point**:

   ```bash
   npm start
   ```

   Note: This uses `api/index.js` as entry point for local testing.

## Troubleshooting

### "Resource not found" Error

**Problem**: Getting `{"success":false,"message":"Resource not found"}`

**Solutions**:

1. ✅ Check that root directory is set to `backend` in Vercel project settings
2. ✅ Verify file structure - ensure `api/` directory exists in `backend/`
3. ✅ Check that you're accessing the correct path (e.g., `/api/bookings` not `/bookings`)
4. ✅ Review deployment logs in Vercel Dashboard → Deployments → Latest → Logs

### Redis/KV Connection Errors

**Problem**: Database operations failing

**Solutions**:

1. ✅ Verify environment variables are set correctly
2. ✅ Check Redis/KV database is active in Vercel Dashboard → Storage
3. ✅ For Vercel KV: Ensure database is linked to the project
4. ✅ For Upstash: Verify credentials in Upstash Console
5. ✅ Check function logs for specific error messages

### CORS Errors

**Problem**: Frontend can't access API

**Solutions**:

1. ✅ Verify CORS headers are set in API functions (already configured)
2. ✅ Check frontend API URL matches deployed backend URL
3. ✅ Ensure `Access-Control-Allow-Origin` header is set (currently `*`)

### Email Not Sending

**Problem**: Booking confirmations not received

**Solutions**:

1. ✅ Verify email environment variables are configured
2. ✅ For Gmail: Use App Password, not regular password
3. ✅ Check function logs for email errors (emails fail gracefully)
4. ✅ Test email endpoint directly: `POST /api/email/send-confirmation`

### Date/Time Issues

**Problem**: Dates showing incorrect values

**Solutions**:

1. ✅ All dates are stored as YYYY-MM-DD strings (local date, no timezone)
2. ✅ No timezone conversion is performed on dates
3. ✅ Check that frontend is sending dates in correct format

## Updating Deployment

### Automatic Deployments

- Push to `main` (or `master`) branch = Production deployment
- Push to other branches = Preview deployment
- Vercel automatically deploys on every push

### Manual Deployment

```bash
cd backend
vercel --prod
```

### Rollback

1. Go to Vercel Dashboard → Your Project → Deployments
2. Find the deployment you want to rollback to
3. Click the "⋯" menu → "Promote to Production"

## Production Checklist

Before going live:

- [ ] Redis/KV database configured and tested
- [ ] Environment variables set correctly
- [ ] Health check endpoint working (`/api/health`)
- [ ] Bookings API tested (create and read)
- [ ] Services API tested
- [ ] Blocked dates API tested
- [ ] Email configuration tested (optional)
- [ ] CORS configured correctly
- [ ] Frontend API URL updated to production backend URL
- [ ] Error logging checked in Vercel Dashboard

## Monitoring

### View Logs

1. **Vercel Dashboard**:

   - Go to your project → Deployments
   - Click on a deployment
   - View "Logs" tab

2. **Via CLI**:
   ```bash
   vercel logs [deployment-url]
   ```

### Function Metrics

- View in Vercel Dashboard → Your Project → Analytics
- Monitor:
  - Function invocations
  - Execution time
  - Error rate
  - Memory usage

## Cost Considerations

### Free Tier Limits (Hobby Plan)

- **Serverless Functions**: 100GB-hours/month
- **Bandwidth**: 100GB/month
- **Vercel KV**: Free tier available (limited storage/requests)

For typical usage, the free tier is sufficient. Monitor usage in Vercel Dashboard.

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Serverless Functions Guide](https://vercel.com/docs/functions)
- [Vercel KV Documentation](https://vercel.com/docs/storage/vercel-kv)
- [Redis Setup Guide](./REDIS_SETUP.md)

## Support

For issues specific to this project:

1. Check deployment logs in Vercel Dashboard
2. Review function code in `api/` directory
3. Verify environment variables are set correctly
4. Test endpoints individually using curl or Postman

For Vercel platform issues:

- [Vercel Support](https://vercel.com/support)
- [Vercel Community](https://github.com/vercel/vercel/discussions)
