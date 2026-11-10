# Unideals — mobile app (Expo)

Native Android/iOS client for Unideals. It talks to the **same backend as the website**
(`E:\Unideals\backend`) — no separate server.

Stack: Expo SDK 58 · React Native 0.88 · expo-router · TanStack Query · Zustand · socket.io-client · TypeScript.

## Run it

```bash
npm install
cp .env.sample .env        # set EXPO_PUBLIC_API_BASE_URL (+ ImageKit public key)
npx expo start             # scan the QR with Expo Go (Android/iOS)
```

On a phone, `localhost` means the phone itself — point `EXPO_PUBLIC_API_BASE_URL` at your
deployed Render API, or your PC's LAN IP (e.g. `http://192.168.1.20:5000`) for local dev.

Checks: `npm run typecheck` · `npx expo-doctor`

## Backend requirement (already added in the Unideals repo)

The website authenticates with HttpOnly cookies, which React Native can't use reliably.
The backend now has an opt-in **mobile mode**: requests with `x-client-type: mobile` and
**no browser `Origin`** get `accessToken`/`refreshToken` in the JSON body (no cookies);
refresh/logout read the token from the body. Web behaviour is unchanged.
Tests: `cd backend && npm run test:auth-mobile`. **Deploy that backend change before
using the app against production.**

## What works in Expo Go vs. a dev build

| Feature | Expo Go | Dev/store build |
| --- | --- | --- |
| Browse, search, product pages, wishlist, chat (live), offers & deals, orders, listing with photos, settings, plans | ✅ | ✅ |
| Razorpay checkout (runs Razorpay's checkout.js in a WebView) | ✅ | ✅ |
| Google sign-in | ❌ (Google blocks Expo Go) | ✅ needs the client IDs below |

Google sign-in: create Android + iOS OAuth clients in the website's Google Cloud project, put
them in `.env`, and add them to the backend env `GOOGLE_MOBILE_CLIENT_IDS` (comma-separated).
The button stays hidden until the IDs are set.

## Layout

```
app/                      expo-router screens (file = route)
  (tabs)/                 Home · Explore · Sell · Chats · Profile
  (auth)/                 login, signup, forgot/reset password, check/verify email
  product/[id]  chat/[id]  category/[slug]  edit-listing/[id]
  search  campus  my-listings  wishlist  orders  notifications
  achievements  settings  pickup-spots  subscription  contact
src/api/                  one module per backend area, same endpoints as frontend/*Api.js
src/store/                auth session (SecureStore refresh token) + device prefs
src/hooks/                campus, wishlist, realtime (socket), Google sign-in
src/components/           ui kit, product, chat, listing wizard, payments
src/constants, utils/     categories/conditions/rules ported from the website
```

## Before a store release

- Add `assets/icon.png` (1024×1024) + adaptive icon and uncomment them in `app.config.ts`.
- `eas build` (set `EAS_PROJECT_ID`); use a production `EXPO_PUBLIC_API_BASE_URL`.
