# ORBITAL: Mission Control — Module Ownership

## Module Distribution

The system is partitioned into five distinct modules, each assigned to a primary developer:

| Module | Identifier | Owner | Core Responsibilities |
|---|---|---|---|
| **Mission Hub** | M01 | Developer 01 | Campaign briefing, scenario selection, objectives display, multiplayer room creation. |
| **Spacecraft Design Lab** | M02 | Developer 02 | Subsystem component selection (bus, power, instruments, comms, AOCS), resource validation. |
| **Orbit & Launch Studio** | M03 | Developer 03 | Orbital profile catalog, launch vehicle pairing, compatibility validation, 3D orbit visualization. |
| **Mission Operations Center** | M04 | Developer 04 | Real-time mission clock, telemetry display, crisis events resolution, post-mission debrief reports. |
| **Multiplayer Infrastructure** | M05 | Developer 05 | Express REST API, Socket.IO real-time synchronization, database persistence with PGlite & Supabase. |

## Module Boundaries for Developer 03 (Orbit & Launch Studio)

### Developer 03 Owns:
- Orbit Catalog & Data (`packages/game-data/src/orbit-profiles/`)
- Launch Studio View (`apps/web/src/features/orbit-launch/`)
- 3D Earth Orbit Visualization (`apps/web/src/three/EarthOrbitCanvas.tsx`)
- Launch validation coordination and orbital selection store state.

### Developer 03 Must NOT Modify:
- M01 Mission Hub components or scenarios
- M02 Spacecraft Builder internal state or component catalog
- M04 Mission Operations telemetry or event resolution engine
- M05 Socket event handlers or database migrations
- Shared contracts in `packages/contracts` without explicit integration lead approval.
