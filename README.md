# YeEnat Weg — የእናት ወግ

**The Way of the Mother.** An AI-powered Ethiopian nutrition & lifestyle app: personalized weekly meal plans built from real Ethiopian ingredients, daily nutrition and water tracking, blood-sugar / blood-pressure logging, and health-aware targets for people managing conditions like diabetes and hypertension.

This repository contains the **mobile/web client** (Expo / React Native) wired to a deployed REST API. The UI is bilingual-aware (Amharic + English) and styled around a calm green wellness theme.

> Originally designed in Figma: https://www.figma.com/design/DvZwYw41KkfL6SP4kigUeB/Green-Themed-Design

---

## Tech stack

| Layer | Technology |
|---|---|
| Client | Expo SDK 54, React Native 0.81, React 19, `react-native-web` |
| Navigation | Lightweight in-app routing (single-file screens) |
| Storage | `@react-native-async-storage/async-storage` (JWT tokens) |
| Backend | Node.js, Express 5, PostgreSQL, JWT auth, Google Gemini (meal-plan generation) |
| API base | `https://enateweg.onrender.com/v1` |
| API Documentation | `https://enateweg.onrender.com/v1/docs` |
| Backend Repo | `https://github.com/Simon-Geletaw/EnateWeg` |

---

## Project structure

```
.
├── src/
│   ├── main.tsx                 # Expo entry — registers App
│   └── app/
│       ├── App.tsx              # The entire client: screens, navigation, session
│       └── api/                 # API layer (talks to the deployed backend)
│           ├── config.ts        # Base URL + demo OTP constant
│           ├── storage.ts       # Token persistence (AsyncStorage)
│           ├── client.ts        # apiFetch: auth header, token refresh, ApiError
│           ├── types.ts         # Response/request types
│           └── index.ts         # Typed endpoints (auth/profile/mealPlans/logs/readings/ingredients)
├── EnateWeg/server/             # Backend source (Express + Postgres + Gemini)
├── app.json                     # Expo config
├── eas.json                     # EAS Build profiles (APK / AAB)
└── vite.config.ts               # Web bundling helpers
```

The app is a single self-contained component tree in [`src/app/App.tsx`](src/app/App.tsx) with these screens: **Splash** (onboarding), **Auth** (phone + OTP + health profile), **Home**, **Meal Plan**, **Tracker**, and **Profile**.

---

## How it works

### Authentication
Phone-number + OTP flow. The deployed backend mocks OTP delivery — **any phone number with code `123456` authenticates** (see `MVP_OTP` in [`src/app/api/config.ts`](src/app/api/config.ts)). On success a JWT access/refresh pair is stored via AsyncStorage; the access token is auto-refreshed on expiry by [`client.ts`](src/app/api/client.ts).

### Data flow
All screens read live data through the API layer:

| Screen | Endpoints used |
|---|---|
| Auth | `POST /auth/otp/send`, `POST /auth/otp/verify`, `PUT /users/me/health-profile` |
| Home | `GET /users/me`, `GET /logs/daily/:date`, `GET /meal-plans/current/weekly` |
| Meal Plan | `GET /meal-plans/current/weekly`, `POST /meal-plans/generate`, `GET /ingredients/:id`, `POST /logs/daily/:date/meals` |
| Tracker | `GET /logs/daily/:date`, `GET/POST /health-readings`, `POST /logs/daily/:date/water` |
| Profile | `GET/PUT /users/me/health-profile`, `PATCH /users/me`, `POST /auth/logout` |

---

## Getting started

```bash
npm install        # install dependencies
npm run dev        # start the Expo dev server
```

Then choose a target:

- `npm run android` — Android (device/emulator)
- `npm run ios` — iOS (simulator)
- `npm run web` — web preview in the browser
- `npm run typecheck` — validate TypeScript
- `npm run build` — export the production web bundle (`dist/`)

To sign in on first run, use any phone number and the OTP **`123456`**.

---

## Building an Android APK

This is a managed Expo project, so APKs are produced via **EAS Build** (cloud — no local Android SDK required). Build profiles are defined in [`eas.json`](eas.json): `preview` and `development` produce an **APK**, `production` produces an **AAB** for the Play Store.

```bash
npx eas-cli login                              # log in with your Expo account
npx eas-cli build -p android --profile preview # build an installable APK
```

On the first build, accept the offer to auto-generate an Android keystore. EAS returns a download URL for the `.apk`.

**Local build alternative** (requires Android Studio + JDK 17 installed):

```bash
npx expo prebuild --platform android
cd android && ./gradlew assembleRelease        # APK → android/app/build/outputs/apk/release/
```

---

## Known backend limitations

The client is fully wired, but the deployed backend currently has gaps that affect what some screens can show (these are server-side, not client bugs):

1. **Meal-plan generation is disabled** on the hosted server (no `GEMINI_API_KEY`). Saving a health profile returns `plan_generation_status: "failed"`, so the Meals tab shows an empty **"Generate plan"** state.
2. **The ingredients table is empty** on the hosted database, so per-ingredient macros in the meal detail view show `—`.
3. **No coach/chat or activity-tracking endpoints** exist; those UI elements were intentionally omitted.

Configuring `GEMINI_API_KEY` and seeding ingredients on the server resolves 1 and 2 with no client changes.

---

## License

Internal project — see repository owner for usage terms.
