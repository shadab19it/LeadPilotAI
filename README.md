# 🚀 LeadPilot AI — Lead Intelligence & Automated Outreach Platform

**LeadPilot AI** is an AI-powered multi-source lead discovery, intelligence scoring, and automated outreach generation platform tailored for software agencies, IT service providers, and freelancers.

---

## 📑 Table of Contents

- [Overview \& Core Features](#-overview--core-features)
- [Prerequisites](#-prerequisites)
- [Project Architecture](#-project-architecture)
- [Environment Variables Setup](#-environment-variables-setup)
- [Option 1: Quick Start with Docker (Recommended)](#option-1-quick-start-with-docker-recommended)
- [Option 2: Local Development Setup](#option-2-local-development-setup)
- [Project Scripts Reference](#-project-scripts-reference)
- [API Endpoints Overview](#-api-endpoints-overview)
- [AI & Scraping Architecture](#-ai--scraping-architecture)

---

## 🎯 Overview & Core Features

1. **Multi-Source Discovery Scrapers**: Automatically extract company leads from Clutch.co, GoodFirms, GitHub Orgs, Product Hunt, Y Combinator Directory, and Google Search.
2. **AI Technology Detection**: Regex & pattern matching engine detecting 30+ frameworks, databases, cloud platforms, and DevOps tools.
3. **Multi-Factor Lead Scoring Algorithm (0–100)**:
   - **Team Size** (20%)
   - **Tech Stack Depth** (30%)
   - **Growth Signals** (20%)
   - **Hiring Status** (20%)
   - **Activity & Presence** (10%)
4. **9-Dimensional AI Analysis**: Summarizes business models, target audience, outsourcing likelihood, growth signals, hiring signals, and recommended outreach angle (works out of the box with zero setup using built-in mock fallbacks or live OpenAI API).
5. **Multi-Channel Outreach Generator**: Generates tailored drafts for:
   - LinkedIn Connection Requests (with 300-char limit counter)
   - LinkedIn Follow-up Messages
   - Cold Emails (Subject + Body)
   - Email Follow-ups
   - Contact Form Submissions
   - Discovery Call Scripts
6. **CRM Drag-and-Drop Pipeline**: 8-stage interactive Kanban board with optimistic status updates.
7. **CSV & JSON Exports**: Export filtered leads for external CRM import.
8. **Automated Cron Discovery**: Background daily discovery scheduler built into the API.

---

## 📋 Prerequisites

Before starting, make sure you have installed:

- **Node.js**: `v20.x` or higher
- **npm**: `v10.x` or higher
- **MongoDB**: Local MongoDB instance running on port `27017` **OR** a MongoDB Atlas URI (Only required if running locally without Docker)
- **Docker & Docker Compose** *(Optional, recommended for instant deployment)*

---

## 🏗️ Project Architecture

Built using an **npm Workspaces Monorepo**:

```
LeadPilotAI/
├── apps/
│   ├── api/                   # Express.js REST API & Cron Scheduler (Port 4000)
│   └── web/                   # Next.js 15 Dark-Mode Web App (Port 3000)
├── packages/
│   ├── types/                 # Shared TypeScript interfaces
│   ├── lib/                   # Shared utilities (logger, rate-limiter)
│   ├── database/              # Mongoose connection & Lead schema
│   ├── ai/                    # AI analysis & scoring engines
│   └── playwright/            # Scrapers & discovery orchestrator
├── docker-compose.yml         # Container setup for API, Web & MongoDB
├── Dockerfile.api             # API container build definition
├── Dockerfile.web             # Web container build definition
├── .env.example               # Template environment variables
└── README.md                  # This guide
```

---

## ⚙️ Environment Variables Setup

Create a `.env` file at the root of the project (or copy from `.env.example`):

```bash
# Windows PowerShell
Copy-Item .env.example .env

# Mac / Linux
cp .env.example .env
```

### Key `.env` Settings:

```env
# Node environment
NODE_ENV=development

# Server Ports
PORT=4000
WEB_PORT=3000

# MongoDB Connection
# Use mongodb://localhost:27017/leadpilot for local installation
# Use mongodb://mongodb:27017/leadpilot for Docker Compose
MONGODB_URI=mongodb://localhost:27017/leadpilot

# OpenAI API Key (Optional)
# If left blank, the app gracefully switches to AI Mock Generators for zero-cost testing
OPENAI_API_KEY=sk-your-openai-api-key-here

# GitHub Token (Optional - increases GitHub scraper rate limits)
GITHUB_TOKEN=

# Scraper Rate Limits
SCRAPER_RPS=1

# Daily Discovery Cron Expression (UTC)
DISCOVERY_CRON=0 6 * * *
```

> 💡 **Note**: You do **not** need an OpenAI key to run and test LeadPilot AI. If `OPENAI_API_KEY` is not provided, the application automatically activates intelligent mock fallback generators.

---

## 🐳 Option 1: Quick Start with Docker (Recommended)

Docker sets up MongoDB, the API service, and the Web UI in isolated containers automatically.

### 1. Build and Start Containers

From the root directory (`LeadPilotAI/`), run:

```bash
docker-compose up -d --build
```

### 2. Access the Application

- **Web Dashboard**: [http://localhost:3000](http://localhost:3000)
- **API Server**: [http://localhost:4000](http://localhost:4000)
- **API Health Endpoint**: [http://localhost:4000/health](http://localhost:4000/health)

### 3. View Logs & Stop

```bash
# View live logs
docker-compose logs -f

# Stop containers
docker-compose down
```

---

## 💻 Option 2: Local Development Setup

If you prefer running Node.js directly on your host machine:

### Step 1: Start MongoDB

Ensure your local MongoDB server is running:

```bash
# Windows (if installed as service, it runs automatically)
net start MongoDB

# Linux / Mac
sudo systemctl start mongod
# or
brew services start mongodb-community
```

### Step 2: Install Dependencies

From the root directory:

```bash
npm install
```

### Step 3: Run Typecheck (Optional Verification)

```bash
npm run typecheck
```

### Step 4: Launch API and Web Apps Concurrently

```bash
npm run dev
```

This starts:
- **API Server** at `http://localhost:4000`
- **Web App** at `http://localhost:3000`

---

## 📜 Project Scripts Reference

Run these commands from the root directory:

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts both API and Web servers concurrently in dev mode |
| `npm run dev:api` | Starts only the Express API server (`apps/api`) |
| `npm run dev:web` | Starts only the Next.js Web app (`apps/web`) |
| `npm run build` | Builds all packages and production bundles |
| `npm run typecheck` | Runs TypeScript type verification across all workspaces |
| `npm run install:playwright` | Installs Playwright Chromium browser binaries |

---

## 🔌 API Endpoints Overview

The Express API exposes the following endpoints:

### Lead Management
- `GET /api/leads` — List leads with search, filters (score, status, source, country, technology, hiring), and pagination
- `POST /api/leads` — Create a new lead
- `GET /api/leads/:id` — Get single lead details
- `PATCH /api/leads/:id` — Update lead properties
- `PATCH /api/leads/:id/status` — Quick status update
- `DELETE /api/leads/:id` — Delete a lead

### Lead Discovery
- `POST /api/discover` — Trigger async discovery job
- `GET /api/discover/status/:jobId` — Check progress of discovery job
- `GET /api/discover/jobs` — Get history of discovery jobs

### AI Intelligence
- `POST /api/analyze/:id` — Run 9-dimensional AI analysis & re-scoring on a lead
- `POST /api/analyze/batch` — Run AI analysis on multiple lead IDs
- `POST /api/outreach/:id` — Generate 6 outreach drafts for a lead
- `PATCH /api/outreach/:id/:draftId` — Save edits to a specific draft

### Dashboard & Export
- `GET /api/dashboard/stats` — Get all metrics, chart breakdowns, and top countries
- `GET /api/export/csv` — Download filtered CSV spreadsheet
- `GET /api/export/json` — Download JSON dataset

---

## 💡 AI & Scraping Architecture

1. **Scraping Safety**: Built-in `RateLimiter` enforces customizable requests-per-second (`SCRAPER_RPS=1`) to prevent rate limits or IP blocks.
2. **Demo Mode**: The discovery orchestrator includes 10 pre-loaded high-quality mock lead profiles alongside live scrapers so you can test the system immediately without waiting.
3. **OpenAI Fallback**: If OpenAI API encounters network issues or rate limits, the system seamlessly degrades to deterministic mock analysis, ensuring zero downtime.
