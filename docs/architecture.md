# ORBITAL: Mission Control — System Architecture

## 1. Architectural Overview

ORBITAL is an interactive browser-based 3D space mission engineering and management platform developed for the 2026 NASA Space Apps Challenge. The system follows a decoupled, data-driven architecture where visual representation is strictly separated from simulation state and engineering calculations.

```text
                 PLAYER BROWSER
                       |
                       v
               REACT APPLICATION (apps/web)
                       |
            +----------+----------+
            |          |          |
            v          v          v
        MISSION    SPACECRAFT   ORBIT &
         HUB         DESIGN     LAUNCH (M03)
            |          |          |
            +----------+----------+
                       |
                       v
            SHARED CONTRACTS (packages/contracts)
                       |
                       v
            SIMULATION ENGINE (packages/simulation-engine)
                       |
                       v
         EXPRESS + SOCKET.IO SERVER (apps/api)
                       |
                       v
            DATABASE LAYER (packages/database)
                       |
            +----------+----------+
            |                     |
            v                     v
          PGLITE               SUPABASE
       (Local Dev)           (Production)
```

## 2. Workspace Structure

The project is structured as a pnpm monorepo:

| Directory | Name | Role |
|---|---|---|
| `apps/web` | `@orbital/web` | React + Vite + Tailwind CSS frontend application |
| `apps/api` | `@orbital/api` | Express + Socket.IO multiplayer API server |
| `packages/contracts` | `@orbital/contracts` | Shared TypeScript interfaces and Zod validation schemas |
| `packages/game-data` | `@orbital/game-data` | Static game configuration, component and orbit catalogs |
| `packages/simulation-engine` | `@orbital/simulation-engine` | Astrodynamics, power/battery balance, and validation math |
| `packages/database` | `@orbital/database` | Drizzle ORM schema, client, and migration scripts |

## 3. Layer Separation Rules

1. **Contracts (`packages/contracts`)**: Pure schemas (Zod) and TypeScript types. Zero dependencies on UI, database, or DOM.
2. **Game Data (`packages/game-data`)**: Static catalogs, configuration data, and query utilities. Pure data and validation.
3. **Simulation Engine (`packages/simulation-engine`)**: Deterministic calculations (delta-V, orbital period, solar power, battery endurance). Independent of rendering engines.
4. **UI & 3D Visualization (`apps/web`)**: Renders views and 3D scenes (Three.js / React Three Fiber) using state produced by the simulation engine and catalogs.
