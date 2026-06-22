# High-Level Design (HLD)

The User Analytics Platform is designed for high availability, fast ingestion, and scalable data querying.

## Architecture Diagram

```mermaid
graph TD
    Client[Client Web Browser] -->|Injects| SDK[Tracker SDK (Vanilla JS)]
    SDK -->|Sends Event Batches via sendBeacon/fetch| API_Ingest[API: Ingestion Layer]
    
    Dashboard[Next.js Dashboard UI] -->|Queries Data| API_Query[API: Query Layer]
    
    subgraph "Backend API (Node.js/Express)"
        API_Ingest --> RateLimiter[Rate Limiter & Validation (Zod)]
        API_Query --> Cache[(Redis Cache)]
        RateLimiter --> DB[(MongoDB Atlas)]
        Cache -.->|Cache Miss| DB
    end
    
    DB -->|Aggregates| API_Query
```

## Core Components

1. **Tracker SDK (`tracker-sdk`)**:
   A lightweight, framework-agnostic JavaScript snippet. It buffers events in memory and uses `navigator.sendBeacon` for robust delivery.
2. **Backend API (`apps/api`)**:
   A Node.js Express server acting as both the ingestion engine and the query engine.
3. **Database (`MongoDB Atlas`)**:
   Stores immutable events in a flat schema optimized with compound indexes.
4. **Cache (`Redis`)**:
   Reduces database load by caching heavy aggregation queries (e.g., paginated sessions and heatmap coordinate dumps).
5. **Dashboard (`apps/dashboard`)**:
   Next.js 15 app utilizing TanStack Query for optimal client-side fetching and Shadcn UI for premium aesthetics.

## Design Choices & Trade-offs
- **MongoDB vs Time-Series DB**: MongoDB is excellent for rapid prototyping and moderate scale, but at hyper-scale (billions of events), a Time-Series Database like ClickHouse would be more appropriate.
- **Direct DB Ingestion vs Message Queue**: We ingest directly to MongoDB for simplicity. For higher throughput, an ingestion buffer like Kafka or BullMQ (Redis) should sit between the API and MongoDB.
