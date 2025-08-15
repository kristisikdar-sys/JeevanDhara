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

### Demo Script (step-by-step)

- Start services (3 terminals):
  - Terminal A (Mongo + Backend):
    - cd backend
    - npm run dev
  - Terminal B (ML service):
    - cd ml && source .venv/bin/activate
    - python predict_service.py
  - Terminal C (Firebase emulator, optional):
    - cd infra/firebase
    - firebase emulators:start --project demo-project

- Seed data (once):
  - cd backend && npm run seed

- Test APIs via cURL (replace TOKEN after login):
  - Register:
    - curl -s -X POST http://localhost:4000/api/auth/register -H 'Content-Type: application/json' -d '{"email":"user@example.com","phone":"9999999999","password":"secret12","role":"donor","consent":true}'
  - Login (note accessToken):
    - curl -s -X POST http://localhost:4000/api/auth/login -H 'Content-Type: application/json' -d '{"identifier":"user@example.com","password":"secret12"}'
  - Nearby donors:
    - curl -s -H "Authorization: Bearer TOKEN" "http://localhost:4000/api/donors/nearby?lat=17.39&lng=78.48&radius=10"
  - Create blood request:
    - curl -s -X POST http://localhost:4000/api/requests -H 'Content-Type: application/json' -H "Authorization: Bearer TOKEN" -d '{"blood_group":"A+","units_needed":2,"location":{"lat":17.39,"lng":78.48,"address":"Hyderabad"}}'
  - Predict donor availability (ML):
    - curl -s -X POST http://localhost:4000/api/predict -H 'Content-Type: application/json' -H "Authorization: Bearer TOKEN" -d '{"donor_id":"D1","blood_group":"A+","last_donation_days":120,"avg_donations_per_year":2,"engagement_score":0.7,"area_demand_index":0.5}'

- Mobile app demo:
  - Login in app
  - Home screen shows heat circles around Hyderabad based on seeded donors
  - Create blood request via form; backend matches donors and writes to Firestore (if emulator configured)
  - Schedule a donation to see a local notification

### Postman

- Import `backend/src/postman/JeevanDhara.postman_collection.json`

### Docker (optional)

- cd infra && docker-compose up --build
- Exposes backend on 4000, Mongo on 27017, ML on 5001

### CI

- Basic GitHub Actions workflow under `.github/workflows` runs backend tests

### Configs

- Replace placeholders: Google Maps key `KEY_PLACEHOLDER`, Firebase `FIREBASE_PROJECT_ID`
- Backend env sample in `backend/.env.example`
