Project: JeevanDhara — Hackathon MVP (deliver a runnable full-stack prototype)

Goal:
Build a demoable, production-style MVP of JeevanDhara — an AI-powered, multilingual mobile app for blood donation coordination (focus: Thalassemia). Deliverables must be runnable locally (or in containers) and include code, README, Postman collection, sample data, and minimal tests. Prioritize functionality for a 9-day hackathon: core mobile flows, REST API, DB models, a basic ML model for donor availability, and real-time notifications.

TECH STACK (required)
- Mobile frontend: Flutter (Dart) for Android & iOS
- Backend: Node.js + Express.js (REST)
- Primary DB: MongoDB Atlas (use local Mongo for dev)
- Real-time features & storage: Firebase Firestore (for donation requests and live updates)
- Auth: JWT (access + refresh tokens)
- ML: Python (TensorFlow + Keras)
- Cloud functions: Firebase Cloud Functions for scheduled reminders and push triggers
- Maps: Google Maps API (use KEY_PLACEHOLDER in code)
- Tools: Postman collection, Dockerfiles, GitHub actions (simple CI), Figma link placeholder

MVP FEATURE LIST (deliver first — must be implemented)
1. Auth:
   - /api/auth/register, /api/auth/login (email + phone + password), JWT tokens.
   - Role field: donor / recipient / admin.
   - Consent flag recording.

2. Donor profile & availability:
   - Create/update donor: blood_group, last_donation_date, location {lat, lng}, languages[], engagement_score.
   - Endpoint: /api/donors (CRUD) and /api/donors/nearby?lat=&lng=&radius=

3. Blood requests & matching:
   - /api/requests POST (recipient creates request), GET (nearby), status updates.
   - Matching logic: find donors by blood group + proximity + availability filtering (>= 90 days since last donation for eligible donors).
   - When request created, write to Firestore (for real-time) and trigger push to nearest donors.

4. Mobile app (Flutter) — screens and features:
   - Auth screens (register, login)
   - Home: Google Map with donor density heatmap and active drives
   - Request Blood: create request form
   - Donate: schedule donation flows with calendar picker and reminders
   - Notifications & Reminders screen
   - Profile & history
   - Gamification: milestone progress UI (e.g., badges after 1st, 3rd, 5th donation)
   - Multilingual support: English + Hindi + one southern language (use arb files strings_en.arb, strings_hi.arb, strings_te.arb with example translations)
   - Use Provider or Riverpod for state management (choose Provider for simplicity)

5. ML: Donor Availability Prediction
   - Provide ml/ folder with:
     - generate_synthetic_data.py — create synthetic donor history CSV (10000 rows) with fields: donor_id, blood_group, last_donation_days, avg_donations_per_year, engagement_score, area_demand_index, label (1=donated_within_30days_else0)
     - train_model.py — trains a small Keras model, saves donor_predictor.h5
     - predict_service.py — Flask (or fastapi) microservice exposing /predict that accepts donor features and returns probability
   - Also include a simple Node endpoint /api/predict that proxies to the Python microservice (or runs inference via saved model using tensorflow.js/node if simpler)

6. Geo-clustering & hotspot suggestion
   - Backend route /api/drives/suggest that:
     - Accepts city or bounding box
     - Runs a simple density clustering (DBSCAN or grid heatmap) on donors and requests and returns top 3 hotspot coords
   - Provide a deterministic algorithm using Haversine and simple spatial binning for speed in hackathon.

7. Integrations (simulated)
   - Simulated e-RaktKosh and Blood-Bridge endpoints under /api/integrations/eraktkosh and /api/integrations/bloodbridge returning realistic mock data. Include a wrapper service that normalizes these responses.

8. Notifications & Reminders
   - Firebase Cloud Function sample to send reminders for scheduled donations (use Firestore triggers).
   - Provide instructions for configuring Firebase and a local emulator option.

9. Security & Privacy
   - JWT auth middleware for protected routes
   - Encryption placeholders for data-at-rest (explain how to enable with Mongo Vault or MongoDB Atlas)
   - Consent recording when user registers and when data is shared with NGOs
   - Sanitize inputs and rate-limit critical endpoints (simple express-rate-limit config)

DELIVERABLE FORMAT (explicitly ask Cursor to produce)
- A Git repo structure with folders: /mobile, /backend, /ml, /infra (Dockerfiles), /docs
- Run scripts and README that include:
  1. Local development quickstart (how to run services, required env vars, how to seed DB with mock data)
  2. Postman collection JSON and instructions to run API tests
  3. Flutter run instructions and how to set Google Maps key (KEY_PLACEHOLDER)
  4. How to run ML training and start prediction microservice
  5. How to start Firebase emulator and Cloud Functions locally
- Provide sample .env.example files with all environment variables needed.
- Provide unit tests: at least basic Jest tests for 3 backend endpoints and one Flutter widget test.
- Provide a minimal GitHub Actions workflow to run backend tests on push.

SPECIFIC IMPLEMENTATION / CODE REQUESTS (be explicit)
- Backend (Node/Express)
  - Use Mongoose for schemas: User, Donor, Request, Drive, IntegrationLog
  - Controllers for each resource + validation using Joi or express-validator
  - Auth middleware: auth.js (JWT verify), roles.js (role guard)
  - Route examples (full code): 
    - POST /api/auth/register
    - POST /api/auth/login
    - GET /api/donors/nearby?lat=&lng=&radius=
    - POST /api/requests
    - GET /api/drives/suggest?city=
    - POST /api/predict
  - Dockerfile and docker-compose for backend + local Mongo

- Flutter
  - Provide full code for:
    - main.dart (localization setup)
    - auth screens (register/login)
    - home_screen.dart with GoogleMap widget + heatmap overlay (use google_maps_flutter)
    - request_form.dart
    - schedule_donation.dart (with local notifications scheduling using flutter_local_notifications)
    - profile.dart
  - Include sample provider or Riverpod setup and API client with example API calls
  - Provide ARB files for translations with at least English + Hindi strings for each UI label

- ML (Python)
  - Provide deterministic synthetic data generator
  - Provide training script with model summary printed and saved model
  - Provide simple evaluation (accuracy, ROC AUC)
  - Provide inference example and Node.js proxy integration

- Firestore & Cloud Functions
  - Provide Firestore rules sample (consent-based access)
  - Provide a sample Firebase Cloud Function sendReminder triggered by Firestore scheduled reminders

- Mock Data
  - Provide seed/ scripts for seeding Mongo with 500 donors across lat/lng in a sample city, with mixed blood groups and last_donation_dates.
  - Provide sample requests and sample Postman collection to exercise flows.

- Extras (if time permits)
  - Admin web dashboard (React minimal) to view hotspots and trigger drives
  - CI deploy to Heroku/Render for backend and Firebase hosting for static web admin
  - Dockerized ML microservice with GPU note (optional)

QUALITY & STYLE
- Write clean, commented, production-style code (clear folder structure).
- Add README docs and inline comments where non-trivial logic exists (matching logic, geo-clustering).
- Use environment variables and keep keys out of code.
- Put placeholders for secret keys and instruct how to set them.

TEST & DEMO INSTRUCTIONS (must be included)
- A step-by-step script I can follow in the README to:
  1. Start backend + seed DB
  2. Start Python predict service
  3. Start Firebase emulator
  4. Run the Flutter app (Android emulator)
  5. Create a blood request and show donor matching and notification flow
- Provide screenshots or sample cURL/Postman requests demonstrating the main flows.

PRIORITIZE
1. End-to-end flow: create request in mobile -> backend matches donors -> Firestore update -> push notification/reminder scheduled.
2. ML pipeline producing a saved model + /api/predict endpoint.
3. Simple hotspot heatmap on mobile using seeded data.

FINAL NOTES FOR YOU (Cursor)
- Keep the code runnable with minimal config; use local emulators where cloud creds are required and include placeholders.
- Aim for a 9-day hackathon deliverable: produce a working demo, not a fully hardened production system.
- Wherever third-party keys are required (Google Maps, Firebase), use KEY_PLACEHOLDER and document where to paste real keys.
- Return: zip or repo skeleton containing the files, and a single top-level README with run instructions.

---

Output expectations (exact):
1. A repo tree listing (files + key files summarized).
2. Backend: full code for the requested routes plus Dockerfile and basic tests.
3. Mobile: main.dart + key screens + localization files and instructions to run.
4. ML: synthetic data generator + training + saved model + inference service.
5. Postman collection JSON and .env.example files.
6. README with step-by-step run instructions and demo script.

---

After this skeleton is created and committed, I will ask you to implement the backend, mobile, ML, and Firebase features in separate steps.