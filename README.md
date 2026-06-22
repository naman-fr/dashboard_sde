# User Analytics Platform

An end-to-end user analytics platform built as a monorepo for tracking, ingesting, and visualizing user journeys and clicks on your web applications.

## 🚀 Tech Stack

- **Monorepo**: npm workspaces
- **Frontend Dashboard**: Next.js 15, Tailwind CSS v4, Shadcn UI, TanStack Query
- **Backend API**: Node.js, Express, TypeScript, Mongoose
- **Database**: MongoDB Atlas
- **Tracking SDK**: Vanilla TypeScript (compiled with esbuild)
- **Validation**: Zod
- **Logging**: Winston

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
```

## 🛠️ Local Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   - Copy `apps/api/.env.example` to `apps/api/.env` and fill in your MongoDB credentials.
   ```bash
   MONGO_URI=mongodb+srv://<db_username>:<db_password>@cluster0...
   ```

3. **Build Shared Packages & Tracker**
   ```bash
   npm run build
   ```

4. **Run the Project**
   You can start the backend and frontend simultaneously:
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
    apiUrl: "http://localhost:8080/api/v1"
  });
</script>
```

## ☁️ Deployment

- **Frontend (Dashboard)**: Deploy `apps/dashboard` to **Vercel**. Set root directory to `apps/dashboard`.
- **Backend (API)**: Deploy `apps/api` to **Render** or **Railway**. Set the build command to `npm run build` from root or within `apps/api`, and start command to `npm start` in `apps/api`.
- **Database**: Hosted on **MongoDB Atlas**. Ensure network access rules allow connections from your Render/Railway backend.

## 🧠 Design Decisions & Trade-offs

- **Monorepo Structure**: Facilitates sharing types (Zod) between the tracking script, backend API, and frontend dashboard ensuring end-to-end type safety.
- **Tracker SDK**: Uses `navigator.sendBeacon` for reliable transmission of data even when the user navigates away, falling back to `fetch`. Events are batched to reduce network overhead.
- **Data Model**: An append-only Events collection is used. While fine for millions of rows, hyper-scale applications might require a time-series database (like InfluxDB or ClickHouse).
- **Minimalist UI**: Prioritized data visibility and ease of use, employing Shadcn UI with Tailwind CSS for a premium SaaS feel.

## 🔮 Future Improvements

- **Real-time Analytics**: Implement WebSockets for live dashboard updates.
- **Session Replay**: Capture DOM mutations using `rrweb`.
- **Geolocation**: Enrich IP addresses to show user locations.
- **Event Queues**: Add Kafka or Redis before MongoDB for higher ingestion throughput.
