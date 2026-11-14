# Proposal: Dedicated Component Categories for Onboard Computer and Data Storage

## Problem

The `ComponentDefinition` contract in `packages/contracts` defines `category` as one of:
`bus`, `power`, `propulsion`, `communications`, `instruments`, `thermal_aocs`.

Stage A added two new subsystem families that do not fit any existing category:

1. **Onboard computers** (`comp-flight-primary`, `comp-flight-redundant`) — avionics / flight computers.
   - Currently mapped to category `bus` with subCategory `Onboard Computer`.
   - This is a workaround: onboard computers are not bus/structure hardware.

2. **Data storage** (`storage-solid-state-recorder`, `storage-high-density-recorder`) — solid-state mass memory for science data buffering.
   - Currently mapped to category `power` with subCategory `Data Storage`.
   - This is a workaround: data storage is not power hardware.

Both workarounds pollute category-level aggregation. For example, counting `power` entries to enforce "3 power systems" now also counts data-storage entries unless filtered by subCategory, and counting `bus` entries to enforce "3 structures" now counts avionics computers.

## Proposed Change

Add two new values to the `ComponentCategorySchema` enum in `packages/contracts/src/index.ts`:

- `avionics` — onboard computers, flight software hosts, avionics units.
- `storage` — solid-state data recorders / mass memory for science and telemetry buffering.

Updated enum:

```ts
export const ComponentCategorySchema = z.enum([
  'bus',
  'power',
  'propulsion',
  'communications',
  'instruments',
  'thermal_aocs',
  'avionics',
  'storage'
]);
```

## Migration of Existing Data

In `packages/game-data` (`SPACECRAFT_COMPONENTS`), re-categorize without changing any other field:

| id | old category | new category | subCategory (unchanged) |
|---|---|---|---|
| comp-flight-primary | bus | avionics | Onboard Computer |
| comp-flight-redundant | bus | avionics | Onboard Computer |
| storage-solid-state-recorder | power | storage | Data Storage |
| storage-high-density-recorder | power | storage | Data Storage |

All `subCategory` values remain the same. No existing entries are removed or renamed. No field names change.

## Why

1. **Deterministic aggregation.** Category counts (used by validation and UI catalog tabs) reflect real subsystems instead of accidental groupings.
2. **No subCategory filtering hacks.** Stage A tests currently count by subCategory precisely because no dedicated categories exist. Dedicated categories make category-level counts correct by default.
3. **Future-proofing.** Simulation-engine resource math and validation can key off `category === 'avionics'` / `category === 'storage'` without guessing subCategory strings.

## Constraints Honored

- `packages/contracts` is **not edited** in this proposal. This document is the proposal only; an integration lead must approve before any contract edit.
- All values are fictional game specs, not NASA values.
- No new contract type is created; only enum values are added to the existing `ComponentCategorySchema`.

## Open Question

Whether `avionics` and `storage` should also expose dedicated `visualModel.shape` values, or whether existing shapes (`box`) suffice. Proposed: keep `box` for now; add shapes only if the 3D canvas needs distinct geometry.
