# AI STUDIO - Project Codebase Backup & Source Files

This directory contains a full copy of the application code:

- `src/`: Complete React components, hooks, styles, and asset models.
  - `src/components/`:
    - `CycloneStructureVisualizer.tsx`: 3D and 2D radar/satellite cyclone structure diagnostics
    - `LiveTelemetryPanel.tsx`: Real-time sensor & meteorological telemetry
    - `CasualtyImpactDashboard.tsx`: Population risk & casualty impact projections
    - `EvacuationCorridorPlanner.tsx`: Real-time evacuation corridor routing
    - `EmergencyAlertSystem.tsx`: Multi-channel broadcast alerts & audio alert synthesis
    - `SearchEngineTab.tsx`: Grounded cyclone research & knowledge engine
    - `HistoricalCycloneArchive.tsx`: Historical comparison and analog search
  - `src/App.tsx`: Main dashboard and tab container
  - `src/main.tsx`: Entry point rendering React DOM
  - `src/index.css`: Tailwind CSS styling definitions
- `server.ts`: Express backend serving Gemini API integrations with resilient offline fallbacks
- `index.html`: Web entry point
- `package.json`: Project dependencies and scripts
- `tsconfig.json`: TypeScript configuration
- `vite.config.ts`: Vite build and dev configuration
- `metadata.json`: Application metadata
