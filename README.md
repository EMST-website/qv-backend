# QV Backend

Backend service for the QV Mobile Application, built with [NestJS](https://nestjs.com/) and [PostgreSQL](https://www.postgresql.org/).

## Features

- **Framework**: NestJS (v11)
- **Database**: PostgreSQL with [Drizzle ORM](https://orm.drizzle.team/)
- **Documentation**: Swagger UI
- **Language**: TypeScript

## Prerequisites

- Node.js (v18+)
- npm
- PostgreSQL running locally (or Docker)

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   The `.env` file should contain:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/qv_db"
   JWT_SECRET_KEY="super-secret-secret"
   PORT=3000
   ```

3. **Database Setup**
   Ensure your Postgres server is running and the database `qv_db` exists.
   ```bash
   # Push schema to database
   npm run db:push
   ```

## Running the App

```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod
```

## Documentation

Once the server is running, visit:
[http://localhost:3000/api](http://localhost:3000/api) for Swagger API documentation.