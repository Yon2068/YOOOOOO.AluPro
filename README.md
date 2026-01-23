# YOOOOOO.AluPro & SU-Plug-Comm Integration Project

This repository contains the integrated source code for both the backend daemon and the frontend UI.

## Project Structure

- `daemon/api/`: Backend API services (based on .NET Core)
  - Solution: `YOOOOOO.AluPro.sln`
- `ui/su-plug-comm/`: Frontend User Interface (based on React + Vite)

## Getting Started

### Prerequisites

- **Backend**: .NET 8.0 SDK (or compatible version)
- **Frontend**: Node.js (v18+) and Yarn/Npm

### Running the Backend

```bash
cd daemon/api
dotnet restore
dotnet run --project YOOOOOO.AluPro.Api
```

### Running the Frontend

```bash
cd ui/su-plug-comm
yarn install
yarn dev
```

## Notes

- Please ensure configuration files (like `appsettings.json` or `.env`) are properly set up before running.
- This is a monorepo structure; please manage dependencies for each sub-project independently.
