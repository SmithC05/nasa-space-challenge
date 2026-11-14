# ORBITAL: Mission Control — Orbit Catalog & Shared Data (Phase 1)

## 1. Overview & Disclaimer

The ORBITAL Orbit Catalog provides the foundational, data-driven astrodynamics profiles for the **Orbit & Launch Studio (M03)**.

> [!IMPORTANT]
> **Educational Astrodynamics Assumptions:**
> Orbital trajectories in ORBITAL use **simplified predefined geometry** rather than a full numerical N-body or 6-DOF astrodynamics integration engine. Orbit geometries are modeled as simplified circular or Keplerian ellipses with fixed inclination angles. Perturbations such as atmospheric drag decay, non-spherical Earth gravity (J2 oblateness), solar radiation pressure, and third-body lunar-solar gravitational forces are represented parametrically for educational and gameplay clarity, rather than continuous operational flight software integration.

---

## 2. Available Orbital Profiles

The catalog implements four primary orbital regimes:

| Profile | ID | Type | Altitude (km) | Inclination | Period | Delta-V (m/s) | Earth Sentinel Suitability |
|---|---|---|---|---|---|---|---|
| **Low Earth Orbit (LEO)** | `orbit-leo` | LEO | 410 × 420 | 51.6° | 92.8 min | 9,400 | Suitable initial candidate (inhabited & mid-latitude focus) |
| **Sun-Synchronous Orbit (SSO)** | `orbit-sso` | SSO | 705 × 705 | 98.2° | 98.8 min | 9,750 | **Prime recommended candidate** (polar ice caps + constant solar angle) |
| **Polar Orbit** | `orbit-polar` | LEO | 800 × 800 | 90.0° | 100.8 min | 9,650 | Suitable candidate (direct pole crossing; drifts across solar time) |
| **Geostationary Orbit (GEO)** | `orbit-geo` | GEO | 35,786 × 35,786 | 0.0° | 1,436.1 min | 12,500 | **Not suitable** (zero polar coverage; excessive delta-V) |

---

## 3. Detailed Profile Descriptions

### A. Low Earth Orbit (LEO)
- **ID:** `orbit-leo` (alias: `orbit-leo-iss`)
- **Category:** `LEO`
- **Altitude:** 410 × 420 km
- **Inclination:** 51.6°
- **Orbital Period:** 92.8 min (~15.5 orbits/day)
- **Eclipse Fraction:** 0.38 (~35 minutes per orbit)
- **Coverage Characteristics:**
  - Latitudinal coverage: 51.6°S to 51.6°N.
  - Ground track pattern: 22.5° westward shift per orbit.
  - Revisit time: ~24 hours for mid-latitude sites.
  - Polar coverage: **None** (cannot observe latitudes > 51.6°).
- **Mission Suitability:**
  - Primary applications: ISS cargo/crew transfer, mid-latitude agricultural and urban observation, microgravity science.
  - Earth Sentinel Status: Highlighted as a viable initial candidate for temperate/tropical greenhouse gas tracking, though SSO remains superior for cryosphere ice-cap monitoring.
- **Key Tradeoffs:**
  - *Advantages:* Lowest launch delta-V (~9,400 m/s); low communication latency (5–10 ms); benign inner magnetospheric radiation.
  - *Disadvantages:* Atmospheric drag requires periodic reboosts; frequent eclipses demand high battery cycling; cannot view polar regions.
- **Configuration Restrictions:**
  - Minimum battery endurance: 40 min.
  - Minimum delta-V allowance: 150 m/s (drag makeup).
  - Thermal control: 15+ cycles/day between +120°C and -65°C.

---

### B. Sun-Synchronous Orbit (SSO)
- **ID:** `orbit-sso` (alias: `orbit-sso-polar`)
- **Category:** `SSO`
- **Altitude:** 705 × 705 km (circular)
- **Inclination:** 98.2° (retrograde)
- **Orbital Period:** 98.8 min (~14.5 orbits/day)
- **Eclipse Fraction:** 0.32 (~31 minutes per orbit)
- **Coverage Characteristics:**
  - Latitudinal coverage: 90°S to 90°N (100% global planetary access).
  - Ground track pattern: Constant 10:30 AM local solar time crossing at descending node.
  - Revisit time: ~48 hours; repeat cycle 16 days.
  - Polar coverage: **Complete** (both geographic poles).
- **Mission Suitability:**
  - Primary applications: High-resolution Earth observation, polar ice thickness monitoring (SAR/LiDAR), climate change tracking.
  - Earth Sentinel Status: **Prime Recommended Candidate**. Provides critical polar cryosphere observation and consistent shadow angles for multispectral/radar payloads.
- **Key Tradeoffs:**
  - *Advantages:* Constant sun angle preserves lighting consistency in optical imagery; predictable solar power generation; complete global coverage.
  - *Disadvantages:* Higher launch delta-V penalty (~9,750 m/s) due to retrograde launch; higher debris density in 700–800 km band.
- **Configuration Restrictions:**
  - Minimum battery endurance: 45 min.
  - Minimum delta-V allowance: 200 m/s.
  - Radiation protection: MEDIUM (exposure to polar horns and auroral zones).

---

### C. Polar Orbit
- **ID:** `orbit-polar`
- **Category:** `POLAR`
- **Altitude:** 800 × 800 km (circular)
- **Inclination:** 90.0° (orthogonal)
- **Orbital Period:** 100.8 min (~14.3 orbits/day)
- **Eclipse Fraction:** 0.35
- **Coverage Characteristics:**
  - Latitudinal coverage: 90°S to 90°N (100% surface access).
  - Ground track pattern: Direct meridional north-south longitudinal slicing (25.2° displacement per orbit).
  - Revisit time: ~36 hours; repeat cycle 14 days.
  - Polar coverage: **Complete** (direct zenith passes every ~50 minutes).
- **Mission Suitability:**
  - Primary applications: Planetary magnetic field surveys, global ozone profiling, space weather, auroral oval monitoring.
  - Earth Sentinel Status: Viable polar candidate, though lacks the constant local solar time lock of SSO.
- **Key Tradeoffs:**
  - *Advantages:* Exact 90° direct pole crossings; unmatched auroral cusp coverage; regular polar station passes (Svalbard, McMurdo).
  - *Disadvantages:* Local solar crossing time drifts through the 24-hour clock over the year, causing variable illumination angles.
- **Configuration Restrictions:**
  - Minimum battery endurance: 45 min.
  - Minimum delta-V allowance: 180 m/s.
  - Radiation protection: MEDIUM.

---

### D. Geostationary Orbit (GEO)
- **ID:** `orbit-geo`
- **Category:** `GEO`
- **Altitude:** 35,786 × 35,786 km (circular equatorial)
- **Inclination:** 0.0°
- **Orbital Period:** 1,436.1 min (~23.93 hours sidereal)
- **Eclipse Fraction:** 0.05 (eclipses occur only during equinoctial seasons)
- **Coverage Characteristics:**
  - Latitudinal coverage: 81°S to 81°N.
  - Ground track pattern: Stationary point on equator (0° latitude).
  - Revisit time: Continuous / 0 hours (real-time continuous observation).
  - Polar coverage: **Zero** (cannot view latitudes > 81°).
- **Mission Suitability:**
  - Primary applications: Continuous continental weather monitoring (GOES style), telecommunications relays, early warning.
  - Earth Sentinel Status: **NOT SUITABLE**. Cannot monitor polar cryosphere and requires prohibitive delta-V (~12,500 m/s).
- **Key Tradeoffs:**
  - *Advantages:* Fixed ground antennas without mechanical tracking; continuous 24/7 view of extreme weather; zero atmospheric drag decay.
  - *Disadvantages:* Massive launch delta-V penalty; complete polar blindness; high latency (~240 ms); intense outer radiation belt.
- **Configuration Restrictions:**
  - Minimum battery endurance: 75 min (equinoctial eclipse season).
  - Minimum delta-V allowance: 1,800 m/s (circularization & station-keeping).
  - Radiation protection: HIGH (hardened avionics required).

---

## 4. Catalog API & Helper Functions

All functions are exported from `@orbital/game-data`:

```typescript
import {
  getAllOrbitProfiles,
  getOrbitProfileById,
  getOrbitProfilesByCategory,
  getOrbitProfilesByMissionSuitability,
  isOrbitProfileAvailable,
  getRecommendedOrbitProfiles,
  validateOrbitProfile,
  validateOrbitCatalog
} from '@orbital/game-data';

// 1. Get all profiles
const allOrbits = getAllOrbitProfiles();

// 2. Lookup by ID or alias
const sso = getOrbitProfileById('orbit-sso');
const legacyLeo = getOrbitProfileById('orbit-leo-iss'); // Resolves orbit-leo

// 3. Filter by mission suitability
const climateOrbits = getOrbitProfilesByMissionSuitability('Climate & Cryosphere');

// 4. Filter by category
const polarOrbits = getOrbitProfilesByCategory('POLAR');

// 5. Availability check
const available = isOrbitProfileAvailable('orbit-geo'); // true

// 6. Get ranked recommendations for a scenario
const recommendations = getRecommendedOrbitProfiles('scenario-earth-sentinel');
// Returns [SSO (prime), LEO, Polar] — excludes GEO
```

---

## 5. Three.js Visualization Parameters

Each profile includes pre-configured parameters prepared for the Three.js Earth Orbit Canvas:

```typescript
interface OrbitVisualizationParameters {
  orbitRadiusReference: number;       // Dimensionless unit scale where Earth radius = 2.0
  inclinationDeg: number;             // Inclination angle for 3D rotation
  orbitColor: string;                 // Hex color for orbit path line
  orbitPathVisibility: boolean;       // Initial trajectory curve visibility
  spacecraftAnimationSpeed: number;   // Relative angular speed multiplier
  referencePlane: 'EQUATORIAL' | 'ECLIPTIC';
  visualizationScale: number;         // Scale factor (e.g. 2 / 6378)
  lineWidth?: number;                 // Path line thickness in pixels
  glowIntensity?: number;             // Atmosphere/orbit glow intensity factor
}
```

Color coding:
- LEO: `#06b6d4` (Cyan)
- SSO: `#10b981` (Emerald)
- Polar: `#8b5cf6` (Purple)
- GEO: `#f59e0b` (Amber)

---

## 6. How Future Modules Consume the Orbit Catalog

1. **Spacecraft Design Lab (Developer 02 / M02):**
   Reads `configurationRestrictions` (min battery endurance, delta-V requirement) to validate whether the player's spacecraft configuration can survive the target orbit.

2. **Orbit & Launch Studio (Developer 03 / Phase 2 & 3):**
   Consumes `visualizationParameters` to render 3D orbital trajectories, calculate booster payload margins, and animate spacecraft orbital motion.

3. **Mission Operations Center (Developer 04 / M04):**
   Uses `orbitalPeriodMin`, `eclipseFraction`, and `radiationSeverity` to simulate ground station passes, battery discharge during eclipse, and radiation anomaly events.
