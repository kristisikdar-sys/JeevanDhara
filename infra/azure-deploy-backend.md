## Deploy FastAPI Backend to Azure Web App for Containers

This guide walks you through building the Docker image, pushing it to Azure Container Registry (ACR), and deploying it to Azure App Service (Linux) as a Web App for Containers.

### Prerequisites
- Azure subscription and permissions to create resources
- Azure CLI installed and logged in
- Docker installed (if building locally; otherwise use ACR Build)
- Project structure includes:
  - `infra/Dockerfile`
  - `backend/` and `ml/` directories

### Environment Variables
Set these variables for convenience (adjust names/values):
```bash
# Azure
export RESOURCE_GROUP=rg-hackathon
export LOCATION=westeurope
export ACR_NAME=hackathonacr$RANDOM   # must be globally unique
export APP_PLAN=plan-hackathon
export WEBAPP_NAME=hackathon-backend-$RANDOM   # must be globally unique

# Container image
export IMAGE_NAME=backend
export IMAGE_TAG=v1
```

### 1) Login and Create Resource Group
```bash
az login
az account show -o table
az group create -n "$RESOURCE_GROUP" -l "$LOCATION"
```

### 2) Create Azure Container Registry (ACR)
```bash
az acr create -n "$ACR_NAME" -g "$RESOURCE_GROUP" --sku Basic
# Get the login server (e.g., hackathonacr.azurecr.io)
export ACR_LOGIN_SERVER=$(az acr show -n "$ACR_NAME" -g "$RESOURCE_GROUP" --query loginServer -o tsv)
```

### 3) Build and Push the Docker Image
You can build locally with Docker or build in ACR. Run these commands from the repository root.

#### Option A: Build with ACR (no local Docker required)
```bash
az acr build \
  --registry "$ACR_NAME" \
  --image "$IMAGE_NAME:$IMAGE_TAG" \
  --file infra/Dockerfile \
  .
```

#### Option B: Build locally and push to ACR
```bash
# Log in Docker to ACR
az acr login -n "$ACR_NAME"

# Build the image
docker build -t "$ACR_LOGIN_SERVER/$IMAGE_NAME:$IMAGE_TAG" -f infra/Dockerfile .

# Push the image
docker push "$ACR_LOGIN_SERVER/$IMAGE_NAME:$IMAGE_TAG"
```

### 4) Create App Service Plan (Linux)
```bash
az appservice plan create \
  -n "$APP_PLAN" \
  -g "$RESOURCE_GROUP" \
  --sku B1 \
  --is-linux
```

### 5) Create Web App for Containers
```bash
az webapp create \
  -g "$RESOURCE_GROUP" \
  -p "$APP_PLAN" \
  -n "$WEBAPP_NAME" \
  --deployment-container-image-name "$ACR_LOGIN_SERVER/$IMAGE_NAME:$IMAGE_TAG"
```

If the web app cannot pull from ACR automatically, set registry credentials explicitly:
```bash
export ACR_USER=$(az acr credential show -n "$ACR_NAME" --query username -o tsv)
export ACR_PASS=$(az acr credential show -n "$ACR_NAME" --query passwords[0].value -o tsv)

az webapp config container set \
  -g "$RESOURCE_GROUP" \
  -n "$WEBAPP_NAME" \
  --docker-custom-image-name "$ACR_LOGIN_SERVER/$IMAGE_NAME:$IMAGE_TAG" \
  --docker-registry-server-url "https://$ACR_LOGIN_SERVER" \
  --docker-registry-server-user "$ACR_USER" \
  --docker-registry-server-password "$ACR_PASS"
```

### 6) Configure App Settings (Environment Variables)
The backend enables wide-open CORS when `ENVIRONMENT=azure` or `ALLOW_ALL_ORIGINS=1` is set. App Service needs the port specified as `WEBSITES_PORT=8000`.

```bash
az webapp config appsettings set \
  -g "$RESOURCE_GROUP" \
  -n "$WEBAPP_NAME" \
  --settings \
  ENVIRONMENT=azure \
  WEBSITES_PORT=8000
# Optionally allow all origins explicitly (already implied by ENVIRONMENT=azure)
# az webapp config appsettings set -g "$RESOURCE_GROUP" -n "$WEBAPP_NAME" --settings ALLOW_ALL_ORIGINS=1
```

### 7) Restart and Verify
```bash
az webapp restart -g "$RESOURCE_GROUP" -n "$WEBAPP_NAME"

# Get the public URL
export HOSTNAME=$(az webapp show -g "$RESOURCE_GROUP" -n "$WEBAPP_NAME" --query defaultHostName -o tsv)
echo "https://$HOSTNAME"

# Test endpoints
curl -s https://$HOSTNAME/ | jq
curl -s https://$HOSTNAME/data | jq
curl -s -X POST https://$HOSTNAME/analyze | jq
```

### Updating the Deployment
- Build and push a new tag (update `IMAGE_TAG`)
- Point the web app to the new tag:
```bash
export NEW_TAG=v2
# Build/push NEW_TAG (use ACR build or docker build+push)
# ...
az webapp config container set \
  -g "$RESOURCE_GROUP" \
  -n "$WEBAPP_NAME" \
  --docker-custom-image-name "$ACR_LOGIN_SERVER/$IMAGE_NAME:$NEW_TAG" \
  --docker-registry-server-url "https://$ACR_LOGIN_SERVER"
az webapp restart -g "$RESOURCE_GROUP" -n "$WEBAPP_NAME"
```

### Notes
- The container listens on port 8000 (uvicorn). `WEBSITES_PORT=8000` ensures App Service routes traffic correctly.
- CORS: In dev, only `http://localhost:5173` is allowed. In Azure, setting `ENVIRONMENT=azure` enables all origins by default. Adjust in `backend/app.py` if stricter rules are needed.
- Ensure `ml/dataset.csv` is present in the image. For dynamic datasets, consider Azure Storage and update the app accordingly.
