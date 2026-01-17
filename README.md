# QV Backend

Backend service for the QV Mobile Application, built with [NestJS](https://nestjs.com/) and [PostgreSQL](https://www.postgresql.org/).

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Setup PostgreSQL database
createdb qv_db

# 3. Create .env file
cp .env.example .env  # Or create manually

# 4. Run migrations
npm run db:push

# 5. Start development server
npm run start:dev
```

Visit [http://localhost:3000/api](http://localhost:3000/api) for Swagger docs.

## Features

- **Framework**: NestJS (v11)
- **Database**: PostgreSQL with Drizzle ORM
- **Caching**: Redis (optional)
- **Authentication**: JWT
- **File Upload**: Cloudinary
- **Email**: Nodemailer
- **API Docs**: Swagger UI

## Table of Contents

- [Quick Start](#quick-start)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [Running](#running)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- Node.js v18+
- PostgreSQL v14+
- Redis (optional)

```bash
# Verify installations
node --version
npm --version
psql --version
```

## Setup

### 1. Clone & Install

```bash
git clone <repository-url>
cd qv-backend
npm install
```

### 2. PostgreSQL Setup

**Ubuntu/Debian:**
```bash
sudo apt install postgresql
sudo systemctl start postgresql
```

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Create Database:**
```bash
sudo -u postgres psql
CREATE DATABASE qv_db;
\q
```

### 3. Redis Setup (Optional)

**Ubuntu/Debian:**
```bash
sudo apt install redis-server
sudo systemctl start redis
```

**macOS:**
```bash
brew install redis
brew services start redis
```

### 4. Configure Environment

Create `.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/qv_db"
JWT_SECRET_KEY="your-secret-key"
PORT=3000
```

### 5. Run Migrations

```bash
npm run db:push
```

### 6. Start Server

```bash
npm run start:dev
```

## Environment Variables

```env
# Application
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/qv_db"

# JWT
JWT_SECRET_KEY="your-secret-key"
JWT_EXPIRES_IN="7d"

# Redis (Optional)
REDIS_HOST=localhost
REDIS_PORT=6379

# Email (Optional)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-password"

# Cloudinary (Optional)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

## Database

### Commands

```bash
# Generate migration from schema changes
npm run db:generate

# Push schema to database
npm run db:push

# Run migrations
npm run db:migrate

# Open Drizzle Studio
npm run db:studio
```

### Workflow

```bash
# 1. Update schema in src/modules/**/schema.ts
# 2. Generate & apply migration
npm run db:generate
npm run db:push
```

## Running

```bash
# Development with hot reload
npm run start:dev

# Debug mode
npm run start:debug

# Lint
npm run lint
```

API: [http://localhost:3000](http://localhost:3000)  
Docs: [http://localhost:3000/api](http://localhost:3000/api)

## Testing

```bash
# Unit tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

## Troubleshooting

### Database Connection Failed
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql
sudo systemctl start postgresql
```

### Port Already in Use
```bash
# Find & kill process on port 3000
lsof -i :3000
kill -9 <PID>
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Redis Connection Error
```bash
# Start Redis or disable in code
redis-cli ping
sudo systemctl start redis
```

### Migration Issues
```bash
# Reset database (CAUTION: deletes data)
npm run db:push
```

## Resources

- [NestJS Docs](https://docs.nestjs.com/)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
