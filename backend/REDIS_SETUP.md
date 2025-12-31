# Redis (Upstash) Configuration Guide

## Understanding Vercel KV and Upstash Redis

### What is Vercel KV?

**Vercel KV** is Vercel's integration with **Upstash Redis**. When you create a Redis database in the Vercel Dashboard (under Storage → KV), you're actually creating an **Upstash Redis database** that Vercel manages for you.

### The Relationship

- **Same Database**: Vercel KV and Upstash Redis refer to the same underlying database when created through Vercel
- **Two Ways to Access**: You can use either:
  - `@vercel/kv` package (Vercel's wrapper, recommended for simplicity)
  - `@upstash/redis` package (direct Upstash client, more flexible)

### Current Implementation

This project currently uses **`@vercel/kv`** to access the Upstash Redis database created through Vercel Dashboard. The code can be easily switched to use `@upstash/redis` if needed.

### When to Use Which Package?

**Use `@vercel/kv` (Current)**:

- ✅ Simpler API
- ✅ Automatic environment variable handling
- ✅ Optimized for Vercel deployments
- ✅ Built-in connection pooling

**Use `@upstash/redis`**:

- ✅ More control and flexibility
- ✅ Access to all Upstash Redis features
- ✅ Can be used outside Vercel
- ✅ More explicit configuration

## Setup in Vercel Dashboard

### Create Upstash Redis Database via Vercel

1. **Go to Vercel Dashboard** → Your Project → **Storage** tab
2. Click **"Create Database"** → Select **"KV"** (this creates an Upstash Redis database)
3. Choose a name (e.g., `heyu-kv`)
4. Select a region
5. Click **"Create"**

Vercel will automatically configure the following environment variables:

- `KV_URL` - Used by `@vercel/kv` package
- `KV_REST_API_URL` - Upstash REST API URL
- `KV_REST_API_TOKEN` - Upstash REST API Token
- `KV_REST_API_READ_ONLY_TOKEN` - Read-only Token (optional)

**That's it!** No additional configuration needed. The code uses `@vercel/kv` which automatically reads these environment variables.

### Alternative: Use `@upstash/redis` Package

If you want to use `@upstash/redis` instead of `@vercel/kv`:

1. Install the package:

   ```bash
   npm install @upstash/redis
   ```

2. Update `utils/redis.js` to use `@upstash/redis`:

   ```javascript
   import { Redis } from "@upstash/redis";

   export const redis = new Redis({
     url: process.env.KV_REST_API_URL,
     token: process.env.KV_REST_API_TOKEN,
   });
   ```

3. The same environment variables (`KV_REST_API_URL` and `KV_REST_API_TOKEN`) work with both packages!

**Note**: Both packages connect to the same Upstash Redis database you created in Vercel Dashboard. The choice is mainly about which API you prefer.

## Local Development Configuration

### Get Environment Variables from Vercel

Since you're using the Upstash Redis database created through Vercel, you need to get the environment variables:

1. **Option 1: Via Vercel CLI** (Recommended)

   ```bash
   cd backend
   vercel env pull .env.local
   ```

   This automatically downloads all environment variables from your Vercel project.

2. **Option 2: Manual from Vercel Dashboard**

   - Go to your Vercel project → Settings → Environment Variables
   - Copy the values for:
     - `KV_REST_API_URL`
     - `KV_REST_API_TOKEN`
     - `KV_URL` (optional, only needed if using `@vercel/kv`)

3. **Create `.env` or `.env.local` file** in the `backend` directory:

```env
# Required for @vercel/kv (current implementation)
KV_URL=your_kv_url_here
KV_REST_API_URL=your_rest_api_url_here
KV_REST_API_TOKEN=your_rest_api_token_here

# Optional
PORT=3001
```

**Note**: If you're using `@vercel/kv` (current), you need all three variables. If you switch to `@upstash/redis`, you only need `KV_REST_API_URL` and `KV_REST_API_TOKEN`.

### Start Server

Install dependencies (if not already installed):

```bash
cd backend
npm install
```

Start the server:

```bash
npm start
# or development mode
npm run dev
```

**Note**: The current code uses `@vercel/kv` which automatically reads `KV_REST_API_URL` and `KV_REST_API_TOKEN` from environment variables. Both packages connect to the same Upstash Redis database.

## Data Migration

If you previously used JSON files to store data, you can use the migration script to migrate data to Redis:

### Using Migration Script

1. Ensure environment variables are correctly configured (see "Local Development Configuration" above)
2. Run the migration script:

```bash
cd backend
npm run migrate
```

The script will automatically:

- Check Redis connection
- Migrate data from `data/bookings.json` to Redis
- Migrate data from `data/services.json` to Redis
- Migrate data from `data/blockedDates.json` to Redis

### Manual Migration

If you don't want to use the script, you can also:

1. Start using directly, new data will automatically be saved to Redis
2. If there's no data in Redis, the system will return an empty array
3. Old JSON files can be kept as backup, or deleted

## Verify Connection

After starting the server, if you see the following logs, Redis connection is successful:

```
✅ Redis connection verified (Vercel KV)
```

If you see warning or error messages, check:

1. Environment variables are set correctly (use `vercel env pull` to download them)
2. The `.env` or `.env.local` file exists in the `backend` directory
3. The Upstash Redis database is active in Vercel Dashboard → Storage
4. Network connectivity (for local development)
