# Docker, Nginx, and GitHub Actions CI/CD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Docker containerization, Nginx reverse proxy, and GitHub Actions CI/CD pipeline for automated deployment to VPS.

**Architecture:** Multi-stage Docker build for optimized Next.js production image, Docker Compose for local development and production, Nginx as reverse proxy with security headers and caching, GitHub Actions workflow to build and deploy to VPS via SSH.

**Tech Stack:** Node.js 20 Alpine, PostgreSQL 16, Nginx Alpine, GitHub Actions, Docker, Docker Compose.

---

### Task 6.1: Create Dockerfile

**Files:**
- Create: `Dockerfile`

- [ ] **Step 1: Create Dockerfile with multi-stage build**

```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

- [ ] **Step 2: Verify Dockerfile syntax**

Run: `docker build -t technical-vibe-test .` (optional, may fail without Docker)
Expected: If Docker is available, build should succeed.

- [ ] **Step 3: Commit Dockerfile**

```bash
git add Dockerfile
git commit -m "feat: add multi-stage Dockerfile for Next.js"
```

### Task 6.2: Create Docker Compose Files

**Files:**
- Create: `docker-compose.yml`
- Create: `docker-compose.dev.yml`
- Create: `Dockerfile.dev`
- Create: `.dockerignore`

- [ ] **Step 1: Create production docker-compose.yml**

```yaml
version: '3.8'

services:
  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-user}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-password}
      POSTGRES_DB: ${POSTGRES_DB:-technical_vibe}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-user}"]
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    build: .
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER:-user}:${POSTGRES_PASSWORD:-password}@db:5432/${POSTGRES_DB:-technical_vibe}?schema=public
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      NEXTAUTH_URL: ${NEXTAUTH_URL:-http://localhost:3000}
    depends_on:
      db:
        condition: service_healthy

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - app

volumes:
  postgres_data:
```

- [ ] **Step 2: Create development docker-compose.dev.yml**

```yaml
version: '3.8'

services:
  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: technical_vibe
    volumes:
      - postgres_data_dev:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://user:password@db:5432/technical_vibe?schema=public
      NEXTAUTH_SECRET: dev-secret
      NEXTAUTH_URL: http://localhost:3000
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    depends_on:
      - db

volumes:
  postgres_data_dev:
```

- [ ] **Step 3: Create development Dockerfile.dev**

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
CMD ["npm", "run", "dev"]
```

- [ ] **Step 4: Create .dockerignore**

```
node_modules
.next
.git
.env
.env.local
*.md
nginx
```

- [ ] **Step 5: Verify Docker Compose syntax**

Run: `docker compose config` (production) and `docker compose -f docker-compose.dev.yml config` (development)
Expected: Both should output valid YAML without errors.

- [ ] **Step 6: Commit Docker Compose files**

```bash
git add docker-compose.yml docker-compose.dev.yml Dockerfile.dev .dockerignore
git commit -m "feat: add Docker Compose for development and production"
```

### Task 6.3: Create Nginx Configuration

**Files:**
- Create: `nginx/nginx.conf`

- [ ] **Step 1: Create nginx directory**

```bash
mkdir -p nginx
```

- [ ] **Step 2: Create nginx.conf**

```nginx
events {
    worker_connections 1024;
}

http {
    upstream nextjs {
        server app:3000;
    }

    server {
        listen 80;
        server_name _;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;

        # Gzip
        gzip on;
        gzip_vary on;
        gzip_proxied any;
        gzip_comp_level 6;
        gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

        # Static files
        location /_next/static/ {
            proxy_pass http://nextjs;
            proxy_cache_valid 200 365d;
            add_header Cache-Control "public, max-age=31536000, immutable";
        }

        # All other requests
        location / {
            proxy_pass http://nextjs;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
```

- [ ] **Step 3: Verify Nginx configuration syntax**

Run: `docker run --rm -v $(pwd)/nginx/nginx.conf:/etc/nginx/nginx.conf:ro nginx:alpine nginx -t`
Expected: "syntax is ok" and "test is successful"

- [ ] **Step 4: Commit Nginx configuration**

```bash
git add nginx/
git commit -m "feat: add Nginx reverse proxy configuration"
```

### Task 7.1: Create GitHub Actions Workflow

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Create .github/workflows directory**

```bash
mkdir -p .github/workflows
```

- [ ] **Step 2: Create deploy.yml workflow**

```yaml
name: Deploy to VPS

on:
  push:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata (tags, labels) for Docker
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=sha
            type=ref,event=branch

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest

    steps:
      - name: Deploy to VPS
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /opt/technical-vibe
            docker compose pull
            docker compose up -d --remove-orphans
            docker system prune -f
```

- [ ] **Step 3: Verify YAML syntax**

Run: `yamllint .github/workflows/deploy.yml` (if yamllint installed) or use online validator.
Expected: No syntax errors.

- [ ] **Step 4: Commit GitHub Actions workflow**

```bash
git add .github/
git commit -m "feat: add GitHub Actions CI/CD pipeline for VPS deployment"
```

### Task: Update .env.example

**Files:**
- Modify: `.env.example`

- [ ] **Step 1: Add VPS deployment variables to .env.example**

Add the following lines at the end of the file:

```env
# VPS Deployment (GitHub Actions)
VPS_HOST=""
VPS_USER=""
VPS_SSH_KEY=""
```

- [ ] **Step 2: Commit updated .env.example**

```bash
git add .env.example
git commit -m "docs: add VPS deployment variables to .env.example"
```

### Final Verification

- [ ] **Step 1: Run linting**

Run: `npm run lint`
Expected: No linting errors.

- [ ] **Step 2: Run type checking**

Run: `npm run build` (or `tsc --noEmit`)
Expected: No TypeScript errors.

- [ ] **Step 3: Verify all files exist**

Check that the following files are present:
- Dockerfile
- docker-compose.yml
- docker-compose.dev.yml
- Dockerfile.dev
- .dockerignore
- nginx/nginx.conf
- .github/workflows/deploy.yml
- .env.example (updated)

- [ ] **Step 4: Final commit (if any uncommitted changes)**

```bash
git status
git add .
git commit -m "chore: finalize Docker, Nginx, and CI/CD setup"
```

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-06-06-docker-nginx-cicd.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?