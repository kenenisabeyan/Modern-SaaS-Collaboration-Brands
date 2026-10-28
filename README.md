<div align="center">

# 🌐 WabiSeminar Live

### Enterprise-Grade Real-Time Collaborative Whiteboard & Seminar Platform

[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-v4.8-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)
[![TiDB Cloud](https://img.shields.io/badge/TiDB_Cloud-MySQL_Compatible-E40046?style=for-the-badge&logo=mysql&logoColor=white)](https://tidbcloud.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

<p align="center">
  A high-performance, cloud-synchronized virtual whiteboard and seminar ecosystem designed for remote education, interactive team brainstorming, and live interactive webinars with ultra-low latency.
</p>

[Explore Features](#-core-features) • [System Architecture](#-system-architecture) • [Tech Stack](#-technology-stack) • [Quick Start](#-getting-started) • [API & Sockets](#-real-time-event-specifications) • [Deployment](#-production-deployment)

</div>

---

## ⚡ Executive Summary

**WabiSeminar Live** is an end-to-end distributed collaboration platform bridging the gap between interactive visual brainstorming and virtual seminar management. Built with **React 19**, **Node.js/Express**, and **Socket.IO**, backed by **TiDB Cloud Serverless SQL**, it empowers educators, teams, and seminar leaders to host real-time interactive rooms with instant drawing replication, live participant tracking, in-session messaging, and resilient OAuth authentication.

---

## 🚀 Core Features

### 🎨 Real-Time Collaborative Canvas
* **Multi-User Synchronized Drawing**: Smooth vector-like stroke interpolation with real-time multi-client broadcast.
* **Live Cursor Telemetry**: Real-time cursor coordinates and participant badge tracking across active viewports.
* **Intuitive Tooling**: Freehand pen, geometric shapes, brush thickness, dynamic palettes, eraser, and instant canvas clearing.
* **Undo / Redo History Stack**: Non-destructive local and room-wide stroke state management.

### 🏛️ Dynamic Room & Session Management
* **Deterministic Room Codes**: Short, shareable, collision-resistant room codes (`/room/:id`).
* **Session Lifecycle Control**: Configurable participant limits, room states, host permissions, and persistent room metadata.
* **Graceful Reconnection**: Socket session recovery upon brief disconnects or network fluctuations.

### 💬 In-Session Communication & Presence
* **Integrated Live Chat**: Fast, in-room messaging stream persisted directly in TiDB database.
* **Participant Presence**: Real-time user join/leave announcements, active user lists, and network status indicators.
* **System Broadcasts**: Automated state broadcasts for room events and administrative actions.

### 🔐 Security & Identity Infrastructure
* **Dual-Mode Authentication**:
  * **Google OAuth 2.0**: One-click social sign-in with preserved return-to-room URL routing.
  * **Local JWT Auth**: Standard email/password registration with salted `bcryptjs` hashing.
* **Granular Session Tokenization**: Short-lived, secure JWT tokens for REST endpoints and WebSocket handshake validation.
* **CORS & Rate Protection**: Strict origin verification for APIs and bidirectional socket handshakes.

---

## 🏗️ Advanced System Architecture

### 🧠 The Architecture in Plain English: The "3-Highway" Model

To deliver **sub-50ms collaboration** without crashing or slowing down, WabiSeminar separates data into **three distinct speed lanes**:

```
 ┌────────────────────────────────────────────────────────────────────────┐
 │                      THE 3-HIGHWAY DATA MODEL                         │
 ├──────────────────┬───────────────────────┬─────────────────────────────┤
 │ 🏎️ The Fast Lane │ 🚙 The Secure Lane    │ 🏛️ The Durable Vault        │
 │ (WebSockets/RAM) │ (HTTPS / REST)        │ (TiDB Cloud Distributed SQL)│
 ├──────────────────┼───────────────────────┼─────────────────────────────┤
 │ • Pen strokes    │ • User registration   │ • User profiles & avatars   │
 │ • Cursor coords  │ • Google OAuth login  │ • Persistent room metadata  │
 │ • Live presence  │ • Room create / join  │ • Chat history & transcripts│
 │ • Canvas resets  │ • JWT token issuance  │ • Additive migrations       │
 └──────────────────┴───────────────────────┴─────────────────────────────┘
```

1. **🏎️ The Real-Time Fast Lane (Sub-50ms)**: Drawing strokes and cursor movements bypass database writes entirely. They travel over binary/JSON WebSocket streams, processed in-memory by Node.js, and broadcast instantly only to users in that specific room.
2. **🚙 The Secure REST Lane**: Authentication and room configurations use standard, predictable HTTPS requests protected by signed JSON Web Tokens (JWT) and Passport.js.
3. **🏛️ The Durable Storage Vault**: Messages, user records, and room states are stored in **TiDB Cloud Serverless**—a distributed MySQL-compatible database that scales compute and storage automatically with zero downtime.

---

### 📐 Comprehensive Multi-Tier Architecture Diagram

```mermaid
flowchart TB
    %% Client Tier
    subgraph ClientTier["🌐 CLIENT TIER (Edge & Browser - React 19 + Vite)"]
        direction TB
        UI["🎨 Glassmorphic Interface\n(Tailwind v4 + Framer Motion)"]
        CanvasEngine["🖌️ HTML5 Canvas Vector Engine\n(Optimistic Render + Undo/Redo)"]
        Telemetry["📍 Live Telemetry\n(Cursor Tracker + User Presence)"]
        SocketClient["⚡ Socket.IO Client\n(Auto-Reconnect + Event Debouncer)"]
        RestClient["🔒 Axios REST Client\n(JWT Interceptor + Error Boundary)"]
    end

    %% Network & Edge
    subgraph EdgeRouting["⚡ EDGE & CDN LAYER"]
        VercelCDN["Vercel Global Edge CDN\n(Static Asset Caching + SPA Rewrites)"]
    end

    %% Application Server Tier
    subgraph AppTier["🚀 APPLICATION SERVER TIER (Render / Node.js 18+)"]
        direction TB
        ReverseProxy["🌐 CORS & HTTP Header Security\n(Helmet + Origin Whitelist)"]
        
        subgraph RealTimeCluster["⚡ Real-Time Engine (Socket.IO)"]
            SocketAuth["Handshake Auth Guard\n(JWT Verification)"]
            RoomManager["In-Memory Room Hub\n(Isolated Room Namespaces)"]
            StrokeBroadcaster["Stroke & Cursor Dispatcher\n(Low-Latency Fanout)"]
        end

        subgraph RestServices["💼 RESTful Micro-Services"]
            AuthService["Identity & OAuth Pipeline\n(Passport.js + Google OAuth 2.0)"]
            RoomService["Room Lifecycle Controller\n(Validation & Capacity Checks)"]
            StatsService["Platform Metrics Engine\n(Live Counter & Telemetry API)"]
        end

        SequelizePool["🛡️ Sequelize ORM Layer\n(Connection Pooling + Additive Migrations)"]
    end

    %% Database Tier
    subgraph DataTier["🏛️ DISTRIBUTED CLOUD PERSISTENCE (TiDB Cloud)"]
        direction TB
        TiDBServerless["TiDB Cloud Serverless Cluster\n(Distributed MySQL Engine + Auto-Scaling)"]
        UserTable[("👤 Users Table\n(UUID, Passwords, GoogleId)")]
        RoomTable[("🚪 Rooms Table\n(Code, Host, Constraints)")]
        MessageTable[("💬 Messages Table\n(RoomId, Sender, Body, Timestamp)")]
    end

    %% Connections
    ClientTier -->|Serves Static Bundle| VercelCDN
    
    %% Realtime Flow
    CanvasEngine -->|High-Frequency Draw Events| SocketClient
    Telemetry -->|Cursor Coordinates| SocketClient
    SocketClient <===>|Bi-directional WSS (WebSocket)| SocketAuth
    SocketAuth --> RoomManager
    RoomManager --> StrokeBroadcaster
    StrokeBroadcaster -.->|Persists Chat Only| SequelizePool

    %% REST Flow
    UI -->|Auth & Room Operations| RestClient
    RestClient ===>|HTTPS Encrypted API Calls| ReverseProxy
    ReverseProxy --> AuthService
    ReverseProxy --> RoomService
    ReverseProxy --> StatsService
    AuthService --> SequelizePool
    RoomService --> SequelizePool
    StatsService --> SequelizePool

    %% DB Connections
    SequelizePool <===>|TLS 1.3 / MySQL Port 4000| TiDBServerless
    TiDBServerless --- UserTable
    TiDBServerless --- RoomTable
    TiDBServerless --- MessageTable

    %% Class Styling
    classDef client fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#f8fafc;
    classDef server fill:#1e1b4b,stroke:#818cf8,stroke-width:2px,color:#f8fafc;
    classDef db fill:#31101e,stroke:#f43f5e,stroke-width:2px,color:#f8fafc;
    classDef edge fill:#064e3b,stroke:#34d399,stroke-width:2px,color:#f8fafc;

    class ClientTier,UI,CanvasEngine,Telemetry,SocketClient,RestClient client;
    class AppTier,ReverseProxy,RealTimeCluster,SocketAuth,RoomManager,StrokeBroadcaster,RestServices,AuthService,RoomService,StatsService,SequelizePool server;
    class DataTier,TiDBServerless,UserTable,RoomTable,MessageTable db;
    class EdgeRouting,VercelCDN edge;
```

---

### 🔄 End-to-End Data Journeys (How It Actually Works)

#### 1. ✏️ The Life of a Drawing Stroke (Sub-50ms)
```
[User drags cursor on Canvas]
  │
  ├─► 1. Local Optimistic Render: Stroke draws on sender's screen INSTANTLY (0ms latency).
  ├─► 2. Event Throttling: Coordinates are packaged into a compact vector payload.
  ├─► 3. WebSocket Transit: Dispatched via Socket.IO directly to the Node.js server.
  ├─► 4. Room Isolation: Server verifies room membership and fans out only to peers in `room_123`.
  └─► 5. Peer Canvas Interpolation: Other attendees see the stroke drawn in real time (< 50ms total).
```

#### 2. 🔐 The Life of a Deep-Linked Seminar Join
```
[User clicks invite: https://app.com/room/dev-team-sync]
  │
  ├─► 1. SPA Route Interception: App detects unauthenticated user and caches `/room/dev-team-sync`.
  ├─► 2. Google OAuth 2.0: Redirects to Google; Google authenticates and signs authorization code.
  ├─► 3. Backend Exchange: Server creates/retrieves user in TiDB and issues signed JWT.
  ├─► 4. Preserved Return: User is redirected seamlessly back to `/room/dev-team-sync`.
  └─► 5. Auto-Handshake: Socket.IO connects, room presence increments, and canvas syncs instantly.
```

---

### 🛡️ Core Architectural Principles

| Principle | How We Implement It | Why It Matters |
| :--- | :--- | :--- |
| **Optimistic UI** | Local canvas paints before socket emits | Users never feel network latency or lag while drawing |
| **Room Sandboxing** | In-memory socket namespaces per room ID | Zero data leakage between private seminar sessions |
| **Zero-Downtime DB** | Non-blocking additive migrations (`ADD COLUMN IF NOT EXISTS`) | Schema upgrades happen without kicking live attendees off |
| **Stateless Scalability**| JWT-secured requests with zero server session locks | Backend can easily scale horizontally across multiple instances |
| **Deep-Link State Guard**| Query parameter preservation across OAuth redirects | Invited guests land directly in the seminar room after signing in |

---

## 🛠️ Technology Stack

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | **React** | `19.x` | Modern reactive UI architecture with Concurrent Mode |
| **Build Tool** | **Vite** | `8.x` | Lightning-fast HMR and optimized production bundling |
| **Styling & Motion** | **TailwindCSS** + **Framer Motion** | `4.x` / `12.x` | High-polish dark-mode UI, glassmorphic surfaces & fluid transitions |
| **Icons & Visuals** | **Lucide React** | `1.x` | Clean, modern feather-style iconography |
| **Real-Time Transport** | **Socket.IO** | `4.8.x` | WebSocket protocol with HTTP long-polling fallback |
| **Backend Runtime** | **Node.js** + **Express** | `18+` | RESTful API server and event-driven gateway |
| **ORM & Database** | **Sequelize** + **TiDB Cloud** | `6.x` | Distributed MySQL-compatible relational schema with safety migrations |
| **Authentication** | **Passport.js** + **JWT** | `0.7.x` | Google OAuth 2.0 integration & stateless token sessions |
| **Cloud Hosting** | **Render** & **Vercel** | — | CI/CD auto-deployments, SPA rewrites & serverless database hosting |

---

## 📁 Repository Structure

```
Wabiskills-Seminar/
├── backend/                       # Express & Socket.IO server
│   ├── config/                    # Database and environment configurations
│   ├── src/
│   │   ├── controllers/           # REST Route business logic (auth, rooms)
│   │   ├── database/              # Sequelize connection, models, additive migrations
│   │   ├── middleware/            # JWT authentication, error handling, CORS
│   │   ├── models/                # User, Room, and Message schemas
│   │   ├── routes/                # Express API endpoints (/auth, /rooms, /stats)
│   │   ├── sockets/               # WebSocket event handlers (draw, chat, room)
│   │   └── utils/                 # Public URL resolvers, logger, helpers
│   ├── server.js                  # Application entry point
│   └── package.json
│
├── frontend/                      # React 19 single-page application
│   ├── public/                    # Static assets & SPA redirect configs (_redirects)
│   ├── src/
│   │   ├── assets/                # Logos, SVG icons, visuals
│   │   ├── components/            # Main views (MeetingRoom, Dashboard, Auth, etc.)
│   │   │   └── ui/                # Atomic UI primitives (Buttons, Cards, Header, Footer)
│   │   ├── services/              # Axios REST client & API interceptors
│   │   ├── socket.js              # Socket.IO client instance and listener registry
│   │   ├── index.css              # Design tokens and Tailwind CSS rules
│   │   └── main.jsx               # React entry point
│   ├── tailwind.config.js         # Theme color definitions & extensions
│   ├── vite.config.js             # Vite configuration with proxy rules
│   └── package.json
│
├── .gitignore                     # Production-grade ignore rules
├── render.yaml                    # Infrastructure-as-code for Render deployment
├── vercel.json                    # Edge routing and SPA configuration for Vercel
└── README.md                      # Project documentation
```

---

## 🏁 Getting Started

### Prerequisites
* **Node.js**: `v18.0.0` or higher
* **npm**: `v9.0.0` or higher
* **MySQL** or **TiDB Cloud** instance

---

### 1. Clone & Environment Setup

```bash
git clone <YOUR_NEW_REPOSITORY_URL>
cd Wabiskills-Seminar
```

#### Backend Setup:
```bash
cd backend
npm install
cp .env.example .env
```

Configure your `backend/.env`:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
PUBLIC_APP_URL=http://localhost:5173
JWT_SECRET=your_super_secret_jwt_key_here
CORS_ORIGIN=http://localhost:5173

# TiDB Cloud / MySQL Configuration
DB_HOST=gateway01.us-east-1.prod.aws.tidbcloud.com
DB_PORT=4000
DB_USER=your_tidb_username
DB_PASSWORD=your_tidb_password
DB_NAME=wabiskills_db
DB_SSL=true

# Google OAuth Credentials (Optional for local dev)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

#### Frontend Setup:
```bash
cd ../frontend
npm install
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

---

### 2. Database Migration & Initialization

Run the automated additive migration script to establish all tables:

```bash
cd ../backend
node scripts/init-database.js
```

---

### 3. Launch Development Servers

#### Terminal 1 (Backend):
```bash
cd backend
npm run dev
# Server running at: http://localhost:5000
```

#### Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
# Vite client running at: http://localhost:5173
```

---

## 📡 Real-Time Event Specifications

The Socket.IO engine synchronizes collaboration rooms via the following events:

| Event Name | Direction | Payload | Description |
| :--- | :--- | :--- | :--- |
| `join-room` | Client ➔ Server | `{ roomId, user }` | Joins a designated meeting room namespace |
| `user-joined` | Server ➔ Room | `{ user, participants }` | Notifies room members of a new attendee |
| `draw-line` | Client ➔ Server | `{ roomId, strokeData }` | Broadcasts active drawing coordinates |
| `canvas-clear` | Client ➔ Server | `{ roomId }` | Emits canvas reset signal to all members |
| `send-message` | Client ➔ Server | `{ roomId, message, user }` | Dispatches in-room chat text |
| `receive-message` | Server ➔ Room | `{ message, sender, timestamp }` | Receives and renders chat update |
| `cursor-move` | Client ➔ Server | `{ roomId, x, y, user }` | Transmits live pointer telemetry |
| `user-left` | Server ➔ Room | `{ userId, participants }` | Updates active room attendance count |

---

## 🌐 Production Deployment

### Backend (Render / Railway / AWS)
1. Deploy `backend` as a **Node.js Web Service**.
2. Set Build Command: `npm install`
3. Set Start Command: `npm start`
4. Set required Environment Variables (`DB_*`, `JWT_SECRET`, `CORS_ORIGIN`, `PUBLIC_APP_URL`).
5. Health Check Path: `/api/health`

### Frontend (Vercel / Render Static)
1. Deploy `frontend` as a **Static Site**.
2. Set Root Directory: `frontend`
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Ensure SPA rewrites are enabled (configured out-of-the-box in [vercel.json](file:///c:/Users/kenenisa/Wabiskills-Seminar/vercel.json) and [frontend/public/_redirects](file:///c:/Users/kenenisa/Wabiskills-Seminar/frontend/public/_redirects)).

---

## 🛡️ Security & Reliability Features

* **Parameterized Queries**: All database interactions pass through Sequelize ORM to prevent SQL injection.
* **Token Expiration & Refresh**: Secure JWT lifecycle to mitigate session hijacking.
* **Stateful OAuth Return Path**: Preserves user's deep-link room destination across third-party Google authentication redirects.
* **Defensive Error Boundaries**: UI-level graceful fallbacks prevent complete canvas crashes during unexpected socket drops.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

<div align="center">
  <sub>Engineered with precision for modern visual collaboration and distributed seminars.</sub>
</div>