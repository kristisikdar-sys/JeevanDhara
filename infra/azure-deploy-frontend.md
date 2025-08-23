### Deploy Vite React Frontend to Azure Static Web Apps

This guide shows how to build the Vite React app, deploy it to Azure Static Web Apps (SWA), and configure it to call your backend API.

### Prerequisites
- Node.js and npm installed
- Azure CLI installed and logged in
- Optional: GitHub account (for GitHub Actions-based deployment)

### 1) Build the Vite app
From the repository root or the `frontend` folder:
```bash
cd frontend
npm install
# For local dev pointing to localhost backend (default in src/api.js):
npm run build
# If you want to embed your Azure backend URL at build time:
# VITE_API_BASE_URL="https://<your-backend>.azurewebsites.net" npm run build
```
The build output will be in `frontend/dist`.

### 2) Create the Static Web App
You can deploy using GitHub Actions (recommended) or upload pre-built assets.

- Recommended (GitHub Actions, SWA-managed build):
  1. Push your code to GitHub.
  2. In the Azure Portal, create a new Static Web App:
     - Source: GitHub
     - Build presets: Vite
     - App location: `frontend`
     - Output location: `dist`
  3. Azure will create a GitHub Actions workflow that builds and deploys on push to your chosen branch.

- CLI alternative (upload pre-built `dist`):
```bash
# Create the SWA resource
az staticwebapp create \
  -n <SWA_NAME> \
  -g <RESOURCE_GROUP> \
  -s . \
  --location <REGION>

# Upload the built assets (run from repo root or provide absolute path)
az staticwebapp upload \
  -n <SWA_NAME> \
  -g <RESOURCE_GROUP> \
  --source ./frontend/dist
```

### 3) Link frontend to the backend API URL
Your `frontend/src/api.js` defaults to `http://localhost:8000`. For production, set a Vite env variable at build time so the frontend calls the Azure backend.

- Update the API helper to use an env var (recommended):
```javascript
// frontend/src/api.js
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
```

- If using SWA-managed build (GitHub Actions or Portal build): set the `VITE_API_BASE_URL` app setting so the build picks it up:
```bash
az staticwebapp appsettings set \
  -n <SWA_NAME> \
  -g <RESOURCE_GROUP> \
  --setting-names VITE_API_BASE_URL="https://<your-backend>.azurewebsites.net"
```
Re-run the deployment (push to the tracked branch) so the new value is embedded during build.

- If uploading pre-built assets: build locally with the env set, then upload:
```bash
cd frontend
VITE_API_BASE_URL="https://<your-backend>.azurewebsites.net" npm run build
cd ..
az staticwebapp upload -n <SWA_NAME> -g <RESOURCE_GROUP> --source ./frontend/dist
```

### 4) Optional: SPA fallback routing
Ensure client-side routing works by serving `index.html` for unknown paths. Add `frontend/staticwebapp.config.json`:
```json
{
  "routes": [
    { "route": "/index.html", "allowedRoles": ["anonymous"] },
    { "route": "/*", "rewrite": "/index.html" }
  ]
}
```
This file will be included in the build output and picked up by SWA.

### 5) Verify
- Visit your Static Web App URL from the Azure Portal
- Use the UI buttons to Load Data and Run Analysis
- If requests fail due to CORS, ensure the backend is configured to allow origins in Azure (the provided backend enables wide-open CORS when `ENVIRONMENT=azure`).
