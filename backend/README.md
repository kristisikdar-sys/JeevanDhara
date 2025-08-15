# JeevanDhara Backend

Quickstart

- Copy `.env.example` to `.env` and adjust values
- Install deps: `npm ci`
- Start Mongo (local or docker)
- Seed data: `npm run seed`
- Start server: `npm run dev`

Endpoints

- POST /api/auth/register
- POST /api/auth/login
- GET /api/donors/nearby?lat=&lng=&radius=
- POST /api/requests
- GET /api/drives/suggest?city=
- POST /api/predict