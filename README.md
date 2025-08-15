## JeevanDhara — Hackathon MVP

### Folders

- backend: Node/Express REST API
- mobile: Flutter app
- ml: Python ML pipeline + predict service
- infra: Docker, Firebase emulators and functions
- docs: Additional docs

### Quickstart (Local)

- Backend
  - cd backend && cp .env.example .env
  - npm install
  - Start MongoDB (local or via docker-compose)
  - npm run seed
  - npm run dev

- ML microservice
  - cd ml
  - python3 -m venv .venv && source .venv/bin/activate
  - pip install -r requirements.txt
  - python generate_synthetic_data.py
  - python train_model.py
  - python predict_service.py

- Firebase Emulator (optional)
  - cd infra/firebase
  - Install Firebase CLI and run: `firebase emulators:start --project demo-project`

- Mobile app
  - cd mobile
  - flutter pub get
  - flutter run
  - Set backend base URL to emulator host: `10.0.2.2:4000`

### Demo Script

- Register/login in app (or use Postman)
- On Home, see heatmap around Hyderabad using seeded donors
- Create a blood request in Request form -> backend matches donors -> Firestore written
- ML: call /api/predict in Postman to see probability
- Schedule a donation and see local notification

### Postman

- Import `backend/src/postman/JeevanDhara.postman_collection.json`

### Docker

- cd infra && docker-compose up --build

### CI

- Basic GitHub Actions workflow under `.github/workflows` will run backend tests

### Configs

- Replace placeholders: Google Maps key `KEY_PLACEHOLDER`, Firebase `FIREBASE_PROJECT_ID`
