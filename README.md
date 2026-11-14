# 🚀 ORBITAL: Mission Control

### Design. Launch. Operate. Discover.

ORBITAL is an interactive browser-based 3D space mission engineering and management game developed for the **2026 NASA Space Apps Challenge**.

Players become space mission engineers and collaborate to design, configure, launch and operate scientific spacecraft while balancing limited engineering resources.

The game combines interactive 3D environments, spacecraft configuration, simplified engineering calculations, orbital planning, mission events and cooperative multiplayer gameplay.

## Project Overview

| Property | Description |
|---|---|
| Project | ORBITAL: Mission Control |
| Platform | Web application / browser-based game |
| Frontend | React + Vite + TypeScript |
| 3D engine | Three.js + React Three Fiber |
| Backend | Node.js + Express |
| Multiplayer | Socket.IO |
| Database | PostgreSQL |
| Local database | PGlite |
| Production database | Supabase PostgreSQL |
| ORM | Drizzle ORM |
| Package manager | pnpm |
| Team size | 5 developers |
| Player capacity | Up to 4 participants per mission |

---

# 1. Core Features

### Mission Hub
- Select scientific mission scenarios.
- Review mission objectives and requirements.
- Understand constraints and difficulty.
- Start single-player or cooperative missions.

### Spacecraft Design Lab
- Select and configure spacecraft components.
- Select scientific instruments.
- Monitor total mass and power.
- Manage development budget and data generation.
- Understand engineering trade-offs.

### Orbit and Launch Studio
- Explore Earth in 3D.
- Select orbital profiles.
- Configure launch vehicles.
- Validate spacecraft compatibility.
- Visualize orbital paths and launch operations.

### Mission Operations Center
- Monitor spacecraft telemetry.
- Track resources and component health.
- Respond to unexpected mission events.
- Manage communication and power failures.
- Evaluate scientific outcomes.

### Multiplayer Collaboration
- Create and join mission rooms.
- Support up to four players.
- Assign engineering responsibilities.
- Synchronize spacecraft configurations.
- Collaborate on mission decisions.

---

# 2. Technology Stack

## Frontend

- React
- Vite
- TypeScript
- Tailwind CSS
- React Router
- Zustand

## 3D Graphics

- Three.js
- React Three Fiber
- React Three Drei
- GSAP

## Backend

- Node.js
- Express
- TypeScript
- Socket.IO
- Zod

## Database

- PostgreSQL
- PGlite for local development
- Supabase PostgreSQL for production
- Drizzle ORM

## Development Tools

- Git
- GitHub
- pnpm
- Vitest
- ESLint
- Prettier

---

# 3. System Architecture

```text
                 PLAYER BROWSER
                       |
                       v
              REACT APPLICATION
                       |
           +-----------+-----------+
           |           |           |
           v           v           v
       MISSION     SPACECRAFT     ORBIT &
        HUB          DESIGN       LAUNCH
           |           |           |
           +-----------+-----------+
                       |
                       v
               SHARED CONTRACTS
                       |
                       v
              SIMULATION ENGINE
                       |
                       v
             EXPRESS + SOCKET.IO
                       |
                       v
                DATABASE LAYER
                       |
             +---------+---------+
             |                   |
             v                   v
           PGLITE             SUPABASE
        LOCAL DEVELOPMENT    PRODUCTION
```

The simulation engine is independent of the frontend rendering system.

The backend manages persistent application state and multiplayer synchronization.

The 3D renderer visualizes the state produced by the application and simulation engine.

---

# 4. Prerequisites

All developers should have the following installed.

| Software | Requirement |
|---|---|
| Operating System | Windows 11 recommended |
| Node.js | Version 22 or newer |
| Git | Latest stable version |
| pnpm | Version 10 or compatible stable release |
| Code editor | VS Code or another TypeScript-compatible IDE |
| Browser | Latest Chrome, Edge or Firefox |

Recommended VS Code extensions:

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- ES7+ React/Redux/React-Native snippets
- Three.js Editor Tools (optional)

**Important:** You do not need to install PostgreSQL or Docker for normal local development.

PGlite provides a local PostgreSQL-compatible environment directly inside the Node.js application.

---

# 5. Clone the Repository

Open PowerShell or the VS Code terminal.

```powershell
git clone <GITHUB_REPOSITORY_URL>

cd orbital-mission-control
```

Replace the repository URL with the actual team's GitHub repository.

Install pnpm if it is not already available:

```powershell
npm install --global pnpm
```

Verify the installations:

```powershell
node --version

npm --version

pnpm --version

git --version
```

---

# 6. Install Dependencies

From the repository root:

```powershell
pnpm install
```

This installs all workspace dependencies for:

- Web application.
- API server.
- Shared contracts.
- Database package.
- Simulation engine.
- Game data.

All developers should use pnpm and should not mix npm or Yarn lockfiles with the project's pnpm lockfile.

---

# 7. Environment Configuration

The repository provides separate example environment files for frontend and backend development.

Copy the templates.

PowerShell:

```powershell
Copy-Item apps/api/.env.example apps/api/.env

Copy-Item apps/web/.env.example apps/web/.env.local
```

## Backend environment

File:

`apps/api/.env`

Example:

```env
NODE_ENV=development

PORT=4000

CLIENT_ORIGIN=http://localhost:5173

DATABASE_PROVIDER=pglite

PGLITE_DATA_DIR=.local/pglite
```

The PGlite database will be stored locally inside the API application's development directory.

## Frontend environment

File:

`apps/web/.env.local`

Example:

```env
VITE_API_URL=http://localhost:4000

VITE_SOCKET_URL=http://localhost:4000
```

The frontend uses these URLs to connect to the API and multiplayer server.

Never expose backend database credentials through variables prefixed with `VITE_`.

---

# 8. Local Database Setup

ORBITAL uses PGlite for local development.

PGlite is an embedded PostgreSQL implementation.

Advantages:

- No separate PostgreSQL installation.
- No Docker requirement.
- Persistent local database storage.
- Independent database for every developer.
- PostgreSQL-oriented schema.
- Compatible with Drizzle ORM.

Database location:

```text
apps/
  api/
    .local/
      pglite/
```

The database is created automatically during the setup process.

## Initialize the database

Run:

```powershell
pnpm db:setup
```

This command should:

1. Initialize the local PGlite database.
2. Apply database migrations.
3. Create the required tables.
4. Insert the initial development seed data.

## Database commands

```powershell
# Initialize or prepare the database
pnpm db:setup

# Generate migration files after schema changes
pnpm db:generate

# Apply migrations
pnpm db:migrate

# Insert development seed data
pnpm db:seed

# Reset local database and restore seed data
pnpm db:reset
```

Database reset is destructive. It should only affect the current developer's local database.

## Important database rules

- All developers must use the common schema.
- Database migrations must be committed to Git.
- Seed scripts must be repeatable.
- Do not commit local database files.
- Do not create different table definitions in feature modules.
- Do not access the database directly from browser code.

Production uses Supabase PostgreSQL with the same shared PostgreSQL schema and migrations.

---

# 9. Start the Application

Once dependencies and environment variables are ready:

```powershell
pnpm dev
```

The command starts the frontend and backend together.

## Local URLs

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:4000 |
| API health | http://localhost:4000/health |

Open the frontend URL in your browser.

The API health endpoint should return a healthy response.

## Start services independently

Frontend:

```powershell
pnpm --filter @orbital/web dev
```

Backend:

```powershell
pnpm --filter @orbital/api dev
```

This is useful when working on a specific module or debugging an individual service.

---

# 10. Project Folder Structure

```text
orbital-mission-control/

├── apps/
│   │
│   ├── web/
│   │   └── src/
│   │       ├── app/
│   │       ├── components/
│   │       ├── layouts/
│   │       ├── features/
│   │       │   ├── mission-hub/
│   │       │   ├── spacecraft-lab/
│   │       │   ├── orbit-launch/
│   │       │   ├── mission-operations/
│   │       │   └── multiplayer/
│   │       ├── three/
│   │       ├── store/
│   │       ├── hooks/
│   │       ├── services/
│   │       └── styles/
│   │
│   └── api/
│       └── src/
│           ├── config/
│           ├── routes/
│           ├── controllers/
│           ├── services/
│           ├── sockets/
│           ├── middleware/
│           └── database/
│
├── packages/
│   ├── contracts/
│   ├── database/
│   ├── simulation-engine/
│   └── game-data/
│
├── database/
│   ├── migrations/
│   └── seeds/
│
├── docs/
│
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── README.md
```

---

# 11. Five Module Ownership

Every developer is responsible for one complete feature module.

| Module | Owner | Main responsibility |
|---|---|---|
| M01 — Mission Hub | Developer 1 | Campaigns, selection and briefing |
| M02 — Spacecraft Lab | Developer 2 | Spacecraft configuration and resources |
| M03 — Orbit & Launch | Developer 3 | 3D orbit planning and launch |
| M04 — Mission Operations | Developer 4 | Simulation, crises and mission reports |
| M05 — Multiplayer Infrastructure | Developer 5 | APIs, team rooms, sockets and database integration |

Every module must use the shared contracts.

No developer should introduce a separate application, theme or unrelated database schema.

---

# 12. Shared Data Contracts

Important shared TypeScript types include:

- MissionScenario
- SpacecraftDesign
- ComponentDefinition
- ResourceSnapshot
- OrbitProfile
- LaunchVehicle
- LaunchConfiguration
- ValidationResult
- MissionEvent
- MissionSimulationState
- MissionReport
- TeamMember
- MissionRoom

All shared types and matching Zod validation schemas must be maintained in:

`packages/contracts/`

Changes to shared contracts should be coordinated with the integration lead.

---

# 13. Git Workflow

We use GitHub for collaboration.

## Main branches

```text
main
integration
```

Feature branches:

```text
feature/mission-hub

feature/spacecraft-lab

feature/orbit-launch

feature/mission-operations

feature/multiplayer
```

---

# 14. Integration Workflow

The overall game follows this data flow:

```text
MISSION HUB
     |
     v
MISSION SCENARIO
     |
     v
SPACECRAFT DESIGN LAB
     |
     v
SPACECRAFT CONFIGURATION
     |
     v
ORBIT & LAUNCH STUDIO
     |
     v
VALIDATED LAUNCH CONFIGURATION
     |
     v
MISSION OPERATIONS
     |
     v
SIMULATION AND CRISIS EVENTS
     |
     v
MISSION REPORT
```

---

# 15. Testing and Quality Checks

Before submitting a pull request, run:

```powershell
pnpm typecheck

pnpm lint

pnpm test

pnpm build
```

---

# 16. Useful Development Commands

| Command | Purpose |
|---|---|
| `pnpm install` | Install dependencies |
| `pnpm dev` | Start frontend and backend |
| `pnpm build` | Build all packages and applications |
| `pnpm lint` | Run linting |
| `pnpm typecheck` | Run TypeScript validation |
| `pnpm test` | Run tests |
| `pnpm db:setup` | Initialize local database and seed |
| `pnpm db:generate` | Generate schema migrations |
| `pnpm db:migrate` | Apply migrations |
| `pnpm db:seed` | Insert demo data |
| `pnpm db:reset` | Reset local database |
| `pnpm --filter @orbital/web dev` | Start frontend only |
| `pnpm --filter @orbital/api dev` | Start backend only |

---

# 17. Production Deployment

Development and production use different database providers.

## Development

```env
DATABASE_PROVIDER=pglite
PGLITE_DATA_DIR=.local/pglite
```

## Production

```env
NODE_ENV=production
DATABASE_PROVIDER=postgres
DATABASE_URL=<SUPABASE_POSTGRES_CONNECTION_STRING>
```

---

# 18. Troubleshooting

See section 18 in project documentation for troubleshooting steps for frontend, backend, database and socket connections.

---

## ORBITAL: Mission Control

**Five developers. Five modules. One integrated mission experience.**

*Design. Launch. Operate. Discover.*
