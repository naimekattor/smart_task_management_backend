# Backend API Module — Smart Project & Task Collaboration System

The backend service is built using Node.js, Express, and TypeScript. It strictly implements the **Controller → Service → Repository → Database** architecture to isolate database calls, decouple query operations, validate business rules, and secure endpoint paths.

---

## 🏗️ Architectural Layers

```
Request  ──>  Routes  ──>  Validation & Security  ──>  Controllers  ──>  Services  ──>  Repositories  ──>  Prisma Client  ──>  PostgreSQL
```

1. **Routes Layer (`src/routes/`)**: Map REST endpoints, append authentication checks, and enforce validation schemas.
2. **Controllers Layer (`src/controllers/`)**: Formulate requests, invoke services, and return responses in standard `{ success, message, data }` wrappers. Never accesses the database or Prisma directly.
3. **Services Layer (`src/services/`)**: Enforce business validation (e.g., check for duplicate task names in the same project, prevent overdue deadlines, verify workload limit warnings).
4. **Repositories Layer (`src/repositories/`)**: Abstract database queries. All Prisma Client operations live strictly inside repository classes.

---

## 🔒 Security & Middlewares

- **JWT Authentication**: Guards routes using `authMiddleware` which validates Access JWT tokens.
- **Role-Based Access Control (RBAC)**: Custom `roleMiddleware` that restricts routes based on user roles (`ADMIN`, `PROJECT_MANAGER`, `TEAM_MEMBER`).
- **Input Validation**: Uses **Zod schemas** passed into `validateBody` middleware to catch and return formatted validation error responses.
- **Traffic Protection**: Enforces rate limiting (`express-rate-limit`) on general routes (`apiLimiter`, 100 requests per 15 minutes) and stricter limits on login routes (`authLimiter`, 5 attempts per 15 minutes).
- **Security Headers**: Standardizes HTTP headers using `helmet` and configures cross-origin restrictions (`cors`).

---

## 📡 Socket.IO Real-Time Engine

We use **Socket.IO** to push live events to the client. 
- **Setup (`src/config/socket.ts`)**: On connection, users join a specific room identified by their unique user ID (`room:user_id`).
- **Triggers**: When modifications occur in services (e.g., task assigned, project archived, deadline updated), the backend automatically dispatches room socket alerts:
  - `TASK_ASSIGNED`
  - `PROJECT_DEADLINE`
  - `NOTIFICATION_RECEIVED`

---

## 📁 Storage Fallback Integration

- **AWS S3 Configuration (`src/config/storage.ts`)**: When AWS S3 environment keys are configured, file attachments upload directly to the bucket.
- **Local Fallback**: If S3 credentials are left blank, files save automatically in the local filesystem under `/backend/uploads/` and are served statically via Express.

---

## ⚡ Development & Scripts

Ensure your local PostgreSQL instance is running. The app utilizes `nodemon` to watch changes in `.ts` and `.json` source files, triggering hot-reloading:

```bash
# Install packages
npm install

# Apply migrations
npx prisma db push

# Populate initial demo records
npm run db:seed

# Start hot-reload server
npm run dev

# Compile typescript to javascript (dist/)
npm run build
```
