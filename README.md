# User Analytics Platform

An end-to-end user analytics platform built as a monorepo for tracking, ingesting, and visualizing user journeys and clicks on your web applications.

## 🚀 Tech Stack

- **Monorepo**: npm workspaces
- **Frontend Dashboard**: Next.js 16, Tailwind CSS v4, Shadcn UI, TanStack Query, Recharts
- **Backend API**: Node.js, Express, TypeScript, Mongoose
- **Database**: MongoDB Atlas
- **Tracking SDK**: Vanilla TypeScript (compiled with esbuild)
- **Validation**: Zod (shared between SDK, API, and Dashboard)
- **CI/CD**: GitHub Actions

## 📚 Architecture & Design
Check the `docs/` folder for comprehensive architecture diagrams and schemas:
- [High-Level Design (HLD)](docs/HLD.md)
- [Low-Level Design (LLD)](docs/LLD.md)

## 📁 Project Structure

```
task_sde/
├── apps/
│   ├── api/          # Express backend for event ingestion & querying
│   └── dashboard/    # Next.js frontend for visualizing analytics
├── packages/
│   ├── tracker-sdk/  # Lightweight Vanilla JS tracking script
│   ├── shared-types/ # Zod schemas and TypeScript interfaces
│   └── shared-utils/ # Logger and shared utilities
├── .github/workflows/ci.yml   # CI/CD pipeline
├── render.yaml                # Render deployment config (API)
└── package.json               # Monorepo root with workspaces
```

## 🛠️ Local Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   - Copy `apps/api/.env.example` to `apps/api/.env` and fill in your MongoDB credentials:
   ```bash
   MONGO_URI=mongodb+srv://<db_username>:<db_password>@cluster0...
   PORT=8080
   CORS_ORIGIN=http://localhost:3000
   ```

3. **Build Shared Packages & Tracker**
   ```bash
   npm run build:packages
   ```

4. **Run the Project**
   Start both the backend and frontend simultaneously:
   ```bash
   npm run dev
   ```
   - API will be running on `http://localhost:8080`
   - Dashboard will be running on `http://localhost:3000`

## 📊 Integrating the Tracker

Include the compiled `tracker.js` in your target application:

```html
<script src="path/to/tracker.js"></script>
<script>
  Analytics.init({
    apiUrl: "https://your-api-url.onrender.com/api/v1"
  });
</script>
```

## ☁️ Deployment

### Frontend (Dashboard) → Vercel
1. Connect your GitHub repo to Vercel
2. Set **Root Directory** to `apps/dashboard`
3. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = `https://your-api-url.onrender.com/api/v1`
4. Deploy — Vercel will auto-detect Next.js

### Backend (API) → Render
1. Connect your GitHub repo to Render
2. Create a **Web Service** using the `render.yaml` blueprint
3. Add environment variables in Render dashboard:
   - `MONGO_URI` = Your MongoDB Atlas connection string
   - `CORS_ORIGIN` = Your Vercel dashboard URL (e.g., `https://dashboard-sde-dashboard.vercel.app`)
4. Deploy

### Database → MongoDB Atlas
- Ensure **Network Access** allows `0.0.0.0/0` (required for Render's dynamic IPs)
- Create a database user with read/write permissions

## 🧠 Design Decisions & Trade-offs

- **Monorepo Structure**: Facilitates sharing types (Zod) between the tracking script, backend API, and frontend dashboard ensuring end-to-end type safety.
- **Tracker SDK**: Uses `navigator.sendBeacon` for reliable transmission of data even when the user navigates away, falling back to `fetch`. Events are batched to reduce network overhead.
- **Data Model**: An append-only Events collection is used. While fine for millions of rows, hyper-scale applications might require a time-series database (like InfluxDB or ClickHouse).
- **Separate Frontend/Backend**: Dashboard deployed on Vercel's edge network for fast global access. API deployed on Render for persistent server process with MongoDB connection pooling.

## 🔮 Future Improvements

- **Real-time Analytics**: Implement WebSockets for live dashboard updates.
- **Session Replay**: Capture DOM mutations using `rrweb`.
- **Geolocation**: Enrich IP addresses to show user locations.
- **Event Queues**: Add Kafka or Redis before MongoDB for higher ingestion throughput.
- **Redis Cache**: Cache heavy aggregation queries for faster dashboard loads.
