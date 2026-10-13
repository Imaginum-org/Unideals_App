# New session - 2026-10-13T15:39:47.647Z

**Session ID:** ses_eca1483c0ffeSZ2qyQOgp1Et1d
**Created:** 10/13/2026, 9:09:47 PM
**Updated:** 10/13/2026, 9:33:19 PM

---

## User

So now this is the entire code base of our unideals website so now we are planning to make a App for unideals where we can use react native and expo. So can we use the same backend for the website and APp tell me first that honestly and is it a scalable option or not?? 

---

## Assistant (Plan · Muse Spark 1.3 Free · 6.8s)

_Thinking:_



Honest backend reuse check — inspecting your stack for Expo fit and scaling risks.

**Tool: read**

**Input:**
```json
{
  "filePath": "E:\\Unideals"
}
```

**Output:**
```
<path>E:\Unideals</path>
<type>directory</type>
<entries>
.git/
backend/
fix.md
frontend/
Gamification_plan.md
Girl_Corner_feature.md
Notification_architecture.md
Readme.md
Subscription_plan.md

(9 entries)
</entries>
```

---

## Assistant (Plan · Muse Spark 1.3 Free · 3.5s)

_Thinking:_



**Tool: read**

**Input:**
```json
{
  "filePath": "E:\\Unideals\\backend"
}
```

**Output:**
```
<path>E:\Unideals\backend</path>
<type>directory</type>
<entries>
.env
.env.sample
.gitignore
node_modules/
package-lock.json
package.json
scripts/
server.js
src/

(9 entries)
</entries>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "E:\\Unideals\\frontend"
}
```

**Output:**
```
<path>E:\Unideals\frontend</path>
<type>directory</type>
<entries>
.env
.env.sample
.gitignore
dist/
eslint.config.js
index.html
node_modules/
package-lock.json
package.json
postcss.config.js
public/
src/
tailwind.config.js
vercel.json
vite.config.js

(15 entries)
</entries>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "E:\\Unideals\\Readme.md"
}
```

**Output:**
```
<path>E:\Unideals\Readme.md</path>
<type>file</type>
<content>
1: <div align="center">
2: 
3: <img src="https://res.cloudinary.com/dmkoxabbt/image/upload/v1766757687/linkedinbannerim_1_ghq9pt.png" alt="Unideals banner" />
4: 
5: # Unideals
6: 
7: **A full-stack student marketplace for buying, selling, and discovering products within a campus community.**
8: 
9: <p>
10:   <img src="https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB" alt="React" />
11:   <img src="https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
12:   <img src="https://img.shields.io/badge/Tailwind_CSS-0F172A?style=flat-square&logo=tailwind-css&logoColor=38BDF8" alt="Tailwind CSS" />
13:   <img src="https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white" alt="Express" />
14:   <img src="https://img.shields.io/badge/MongoDB-1F2937?style=flat-square&logo=mongodb&logoColor=4DB33D" alt="MongoDB" />
15:   <img src="https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white" alt="JWT" />
16: </p>
17: <p>
18:   <img src="https://img.shields.io/badge/License-ISC-blue?style=flat-square" alt="License" />
19:   <img src="https://img.shields.io/badge/Status-Active-success?style=flat-square" alt="Status" />
20:   <img src="https://img.shields.io/badge/Node-%3E%3D18.0.0-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node version" />
21: </p>
22: 
23: </div>
24: 
25: ---
26: 
27: ## Table of Contents
28: 
29: - [Overview](#overview)
30: - [Tech Stack](#tech-stack)
31: - [Project Structure](#project-structure)
32: - [System Architecture](#system-architecture)
33: - [API Reference](#api-reference)
34: - [Frontend Routes](#frontend-routes)
35: - [Configuration](#configuration)
36: - [Getting Started](#getting-started)
37: - [Security](#security)
38: - [License](#license)
39: 
40: ---
41: 
42: ## Overview
43: 
44: Unideals connects students in a campus marketplace. Users can register, verify their email, list products, browse and search listings, save favourites, manage campus pickup spots, report listings or users, and boost product visibility. Paid tiers (Pro / Pro+) and one-time boost add-ons are sold through Razorpay, with listing, wishlist, and boost quotas enforced per plan.
45: 
46: **Highlights**
47: 
48: | Area | Description |
49: |---|---|
50: | Authentication | Short-lived (15 min) JWT access tokens with HttpOnly refresh cookies, session revocation, email verification, password reset, and Google OAuth2 + One-Tap |
51: | Product lifecycle | Multi-step listing flow, drafts, search, category/price/condition filters, unlist/relist, soft delete, and boosted listings |
52: | Wishlist & pickup spots | Save favourite products (plan-capped) and manage up to 3 campus pickup spots; listings snapshot the chosen spot |
53: | Payments & plans | Razorpay checkout for Pro / Pro+ Founder lifetime plans and one-time 3-day / 7-day boost add-ons; HMAC-verified payments with idempotent activation and webhooks |
54: | Reporting | Flag inappropriate products or users |
55: | Media | Signed ImageKit upload tokens on the backend; client-side image upload (JPG/PNG/WEBP) and compression |
56: | Admin console | Separate admin authentication and moderation endpoints for users and products |
57: | Security | Helmet, CORS, deep XSS filtering, NoSQL injection guards, and rate limiting on auth, product creation, and payments |
58: 
59: ---
60: 
61: ## Tech Stack
62: 
63: **Frontend** (`frontend/` — React 18 + Vite 6)
64: 
65: | Technology | Purpose |
66: |---|---|
67: | React 18 | UI framework |
68: | Vite 6 | Dev server and production bundler |
69: | React Router v7 | Client-side routing (public / protected / auth-only layouts) |
70: | Tailwind CSS 3 | Utility-first styling with class-based dark mode |
71: | Axios | HTTP client with cookie-based auth and silent token refresh |
72: | React Context | User, theme, and wishlist state (no external store) |
73: | ImageKit JS SDK | Client-side image uploads |
74: | browser-image-compression | Image compression before upload |
75: | Razorpay Checkout.js (lazy-loaded) | Pro / Pro+ upgrades and boost add-on purchases |
76: | react-qr-code | Phone-handoff QR rendering (listing flow) |
77: | EmailJS | Contact form email delivery |
78: | Framer Motion | Animations and transitions |
79: | Swiper | Image carousels |
80: | Radix UI | Accessible dialogs and primitives |
81: | Lucide / react-icons / Heroicons | Icon sets |
82: | react-hot-toast, react-toastify | Toast notifications |
83: | react-select, react-slider, react-datepicker, react-burger-menu | Form and navigation widgets |
84: | date-fns, clsx, canvas-confetti, lenis | Dates, classnames, celebrations, smooth scroll |
85: 
86: **Backend** (`backend/` — Node.js 22 + Express 5, ESM)
87: 
88: | Technology | Purpose |
89: |---|---|
90: | Express.js 5 | REST API server |
91: | MongoDB + Mongoose 9 | Document database and ODM (incl. TTL indexes) |
92: | JWT + refresh tokens | 15-min access + 7-day rotating refresh tokens over HttpOnly cookies, with versioned revocation |
93: | bcrypt | Password hashing |
94: | Zod 4 | Request body validation |
95: | Razorpay SDK 2.x | Plan and boost add-on orders, signature verification, webhooks |
96: | ImageKit SDK 6 | Image storage, delivery, signed tokens, server-side upload/deletion |
97: | Multer | Phone-handoff multipart uploads (memory storage) |
98: | nanoid | Receipts, pairing codes, product slugs |
99: | slugify | SEO-friendly product slugs |
100: | Resend | Transactional email (verification, password reset) |
101: | Google Auth Library | Google OAuth2 + One-Tap sign-in |
102: | cookie-parser, CORS | Cookies and cross-origin policy |
103: | Helmet | Secure HTTP response headers |
104: | express-rate-limit | Per-endpoint abuse protection |
105: | xss | Deep XSS sanitization |
106: | morgan | Request logging (secrets redacted) |
107: | node-cron | Scheduled jobs (boost expiry, deleted-product cleanup, subscription expiry) |
108: | dotenv | Environment configuration |
109: 
110: **Infrastructure & Services**
111: 
112: | Technology | Purpose |
113: |---|---|
114: | Vercel | Frontend hosting (`app.unideals.in`) |
115: | Render | Backend hosting (`api.unideals.in`) |
116: | MongoDB Atlas | Managed database |
117: | ImageKit CDN | Image storage, optimization, and delivery |
118: | Razorpay (Test Mode) | Payment gateway: orders, Checkout, webhooks |
119: | Resend + EmailJS | Backend transactional email + frontend contact form |
120: 
121: ---
122: 
123: ## Project Structure
124: 
125: ```
126: Unideals/
127: ├── frontend/                    React + Vite client
128: │   ├── src/
129: │   │   ├── app/                 App entry, routes
130: │   │   ├── features/            Feature modules
131: │   │   │   ├── auth/            Login, signup, password reset, Google OAuth
132: │   │   │   ├── product/         Home, listing, product detail, categories, pricing
133: │   │   │   ├── user/            Profile, settings, wishlist, subscription, contact
134: │   │   │   ├── payment/         Razorpay checkout hook and billing API client
135: │   │   │   ├── search/          Search results and dropdown suggestions
136: │   │   │   ├── chat/            Chat page UI
137: │   │   │   ├── notification/    Notifications page UI
138: │   │   │   └── legal/           Privacy policy
139: │   │   ├── Components/          Shared layout and UI components
140: │   │   ├── Layouts/             MainLayout, ProtectedLayout
141: │   │   ├── context/             User, theme, and wishlist state
142: │   │   ├── services/            Axios instance and auth interceptor
143: │   │   ├── styles/               Global CSS
144: │   │   └── utils/                Image upload helpers
145: │   └── public/
146: │
147: ├── backend/                     Express + MongoDB API
148: │   ├── src/
149: │   │   ├── config/               DB, constants, email, subscription and boost plans
150: │   │   ├── controllers/          Route handlers
151: │   │   ├── models/                Mongoose schemas (User, Product, Payment, Subscription, ...)
152: │   │   ├── routes/                API route definitions
153: │   │   ├── middlewares/           Auth, roles, tiers, validation, errors
154: │   │   ├── services/              Business logic (auth, product, payments, subscriptions, ...)
155: │   │   ├── validations/           Zod schemas
156: │   │   ├── jobs/                   Cron jobs (boosts, product cleanup, subscriptions)
157: │   │   ├── seeds/                  Plan catalog self-check script
158: │   │   └── utils/                  Tokens, ImageKit, Razorpay, email templates
159: │   └── server.js
160: │
161: ├── Subscription_plan.md           Plan pricing and monetization spec
162: ├── fix.md                         Security and feature fix log
163: └── README.md
164: ```
165: 
166: ---
167: 
168: ## System Architecture
169: 
170: ```mermaid
171: flowchart TB
172:     subgraph Client ["Frontend — React + Vite"]
173:         UI[Pages & Components]
174:         Axios[Axios HTTP Client]
175:         UserCtx[User Context]
176:     end
177: 
178:     subgraph Server ["Backend — Express API"]
179:         Router[API Router]
180:         MW["Middlewares
181: Helmet · CORS · XSS · NoSQL Guard"]
182:         Controllers[Controllers]
183:         Services[Service Layer]
184:         Jobs["Cron Jobs
185: Boost Expiry · Product Cleanup · Subscription Expiry"]
186:     end
187: 
188:     subgraph Data ["Data & Media"]
189:         MongoDB[(MongoDB
190: Mongoose ODM)]
191:         ImageKit[ImageKit
192: Media Storage & CDN]
193:     end
194: 
195:     subgraph External ["External Services"]
196:         JWT[JWT + Refresh Tokens]
197:         Google[Google OAuth2]
198:         Razorpay[Razorpay
199: Orders · Verify · Webhooks]
200:         Resend[Resend
201: Email Service]
202:         EmailJS[EmailJS
203: Contact Form]
204:     end
205: 
206:     UI --> Axios
207:     Axios -->|HTTPS + HttpOnly Cookies| Router
208:     Router --> MW --> Controllers --> Services
209:     Services --> MongoDB
210:     Services --> ImageKit
211:     Services --> Resend
212:     Services --> Razorpay
213:     Jobs --> MongoDB
214:     UserCtx --> Google
215:     UserCtx --> JWT
216:     UI --> ImageKit
217:     UI --> EmailJS
218: ```
219: 
220: ---
221: 
222: ## API Reference
223: 
224: All routes are prefixed with the base URL configured via `VITE_API_BASE_URL`.
225: 
226: ### Auth — `/api/auth`
227: 
228: | Method | Endpoint | Description | Access |
229: |---|---|---|---|
230: | POST | `/register` | Create new account | Public |
231: | POST | `/login` | Local login | Public |
232: | POST | `/logoutUser` | Clear auth cookies and invalidate refresh token (GET kept for legacy clients) | Protected (GET: Public, revokes via cookie) |
233: | POST | `/refresh-token` | Rotate access token using refresh cookie | Public |
234: | POST | `/verify-email` | Verify email address | Public |
235: | GET | `/check-verification` | Check email verification status | Public |
236: | POST | `/resend-verification` | Resend verification email | Public |
237: | POST | `/forgot-password` | Send password reset email | Public |
238: | GET | `/reset-password/:token` | Validate reset token before form submit | Public |
239: | POST | `/reset-password/:token` | Reset user password | Public |
240: | GET | `/google` | Initiate Google OAuth redirect | Public |
241: | GET | `/google/callback` | OAuth callback handler | Public |
242: | POST | `/google/exchange` | Exchange OAuth code for session | Public |
243: | POST | `/google/one-tap` | Google One-Tap sign-in | Public |
244: 
245: ### User — `/api/user` (Protected)
246: 
247: | Method | Endpoint | Description |
248: |---|---|---|
249: | GET | `/userProfile` | Get authenticated user profile |
250: | PUT | `/updateProfile` | Update profile details (mobile, gender) |
251: | PUT | `/updateAvatar` | Update profile photo (ImageKit URL + fileId) |
252: | DELETE | `/removeAvatar` | Remove profile photo |
253: | DELETE | `/deleteAccount` | Deactivate account (listings unlisted, sessions revoked) |
254: 
255: ### Product — `/api/product`
256: 
257: | Method | Endpoint | Description | Access |
258: |---|---|---|---|
259: | GET | `/` | List products (`page`, `limit`, `search`, `category`, `condition`, `min_price`, `max_price`, `sort`) | Public |
260: | GET | `/boosted` | List currently boosted products | Public |
261: | GET | `/search` | Full-text product search (`q`) | Public |
262: | GET | `/search-suggestions` | Autocomplete suggestions (`q`, min 2 chars) | Public |
263: | GET | `/:id` | Get product by ID | Public |
264: | POST | `/` | Create product listing or draft | Protected |
265: | DELETE | `/:id` | Soft-delete a listing | Protected |
266: | PATCH | `/:id/unlist` | Unlist a product | Protected |
267: | PATCH | `/:id/relist` | Relist a product | Protected |
268: | GET | `/user/my-products` | Get current user's listed products | Protected |
269: | GET | `/user/drafts` | Get current user's draft products | Protected |
270: 
271: ### Wishlist — `/api/wishlist` (Protected)
272: 
273: | Method | Endpoint | Description |
274: |---|---|---|
275: | GET | `/` | Get user's wishlist |
276: | POST | `/add` | Add product to wishlist |
277: | POST | `/remove` | Remove product from wishlist |
278: | POST | `/toggle` | Toggle wishlist state |
279: | GET | `/check/:productId` | Check if product is in wishlist |
280: 
281: ### Pickup Spots — `/api/pickup-spots` (Protected)
282: 
283: Campus meetup spots (max 3 per user). Listings snapshot the selected spot, so no street address is needed.
284: 
285: | Method | Endpoint | Description |
286: |---|---|---|
287: | POST | `/` | Create pickup spot |
288: | GET | `/` | List user pickup spots |
289: | PUT | `/:pickupSpotId` | Update pickup spot |
290: | DELETE | `/:pickupSpotId` | Delete pickup spot |
291: | PATCH | `/:pickupSpotId/primary` | Set default pickup spot |
292: 
293: ### Report — `/api/report` (Protected)
294: 
295: | Method | Endpoint | Description |
296: |---|---|---|
297: | POST | `/product/:productId` | Report a product |
298: | POST | `/user/:userId` | Report a user |
299: 
300: ### Boost — `/api/boost` (Protected)
301: 
302: Quota boosts follow the active plan (Free 0, Pro 2 × 3 days, Pro+ 5 × 7 days per month).
303: 
304: | Method | Endpoint | Description |
305: |---|---|---|
306: | GET | `/me/summary` | Get current user's boost usage summary |
307: | POST | `/products/:productId` | Boost a product listing (quota) |
308: 
309: ### Payments — `/api/payments`
310: 
311: Razorpay checkout for Founder lifetime plans (Pro ₹99, Pro+ ₹199) and one-time boost add-ons (3-day ₹29, 7-day ₹49, any tier). Amounts are always computed server-side from the plan catalog.
312: 
313: | Method | Endpoint | Description | Access |
314: |---|---|---|---|
315: | POST | `/orders` | Create order (`plan`, plus `productId` for boost add-ons); reuses a fresh unpaid order | Protected |
316: | POST | `/verify` | Verify HMAC signature and activate plan / apply boost | Protected |
317: | GET | `/me` | Current tier, plan, live usage, and payment history (powers the Subscription tab) | Protected |
318: | POST | `/webhook` | Razorpay event webhook (`payment.captured`, `payment.failed`); HMAC over raw body, no auth | Public (signature-verified) |
319: 
320: ### ImageKit — `/api/imagekit` (Protected)
321: 
322: | Method | Endpoint | Description |
323: |---|---|---|
324: | GET | `/auth` | Get signed upload parameters |
325: 
326: ### Admin — `/api/admin`
327: 
328: | Method | Endpoint | Description | Access |
329: |---|---|---|---|
330: | POST | `/auth/login` | Admin login | Public |
331: | POST | `/auth/refresh-token` | Refresh admin session | Public |
332: | GET | `/auth/me` | Get current admin user | Admin / Support |
333: | POST | `/auth/logout` | Admin logout | Admin / Support |
334: | GET | `/users` | List users | Admin / Support |
335: | PATCH | `/users/:id/status` | Update user status | Admin / Support |
336: | GET | `/products` | List products for moderation | Admin / Support |
337: | PATCH | `/products/:id/status` | Update product status | Admin / Support |
338: | PATCH | `/products/:id/soft-delete` | Soft-delete a product | Admin only |
339: | DELETE | `/products/:id` | Hard-delete a product | Admin only |
340: 
341: ### Health
342: 
343: | Method | Endpoint | Description |
344: |---|---|---|
345: | GET | `/health` | Server health check |
346: 
347: ---
348: 
349: ## Frontend Routes
350: 
351: **Auth (no header, logged-in users are redirected home)**
352: 
353: ```
354: /login                     Sign in
355: /signup                    Create account
356: /forgot-password           Request password reset
357: /reset-password/:token     Set new password
358: /verify-email              Email verification
359: /checkEmail                Post-signup email confirmation prompt
360: ```
361: 
362: **Public (with header)**
363: 
364: ```
365: /                          Home / product feed
366: /search                    Search results
367: /product/:id               Product detail page
368: /category/:categoryName    Category browser (includes boosted products)
369: /price                     Plans & pricing (Pro / Pro+ checkout)
370: /termscondition            Terms & conditions
371: /privacy-policy            Privacy policy
372: ```
373: 
374: **Protected (with header)**
375: 
376: ```
377: /profile                   User profile overview
378: /settings                  Account settings (incl. pickup spots)
379: /subscription              Subscription status, usage, and billing
380: /wishlist                  Saved listings
381: /myorders                  Order history
382: /chat                      Messaging
383: /notification              Activity notifications
384: /upload                    Create a new listing (multi-step)
385: /productlisted             My listings dashboard (incl. boost / buy extra boost)
386: /contact                   Contact support
387: ```
388: 
389: Legacy redirects: `/profileoverview` → `/profile`, `/setting` → `/settings`. Unknown paths redirect to `/`.
390: 
391: ---
392: 
393: ## Configuration
394: 
395: Both services are configured via environment variables. Copy `.env.sample` to `.env` in each directory and populate the values before running the app. **Never commit `.env` files.**
396: 
397: **Backend (`backend/.env`)**
398: 
399: | Variable | Description |
400: |---|---|
401: | `PORT` | API server port |
402: | `NODE_ENV` | Runtime environment |
403: | `FRONTEND_URL` | Allowed origin for the main client |
404: | `ADMIN_FRONTEND_URL` | Allowed origin for the admin client |
405: | `MONGO_URL` | MongoDB connection string |
406: | `SECRET_KEY_ACCESS_TOKEN` | JWT access token signing secret |
407: | `SECRET_KEY_REFRESH_TOKEN` | JWT refresh token signing secret |
408: | `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth2 credentials |
409: | `GOOGLE_REDIRECT_URI` | OAuth callback URL |
410: | `IMAGEKIT_PUBLIC_KEY` / `IMAGEKIT_PRIVATE_KEY` / `IMAGEKIT_URL_ENDPOINT` | ImageKit credentials |
411: | `RESEND_API_KEY` | Transactional email provider key |
412: | `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Razorpay API credentials (use Test Mode keys for local dev) |
413: | `RAZORPAY_WEBHOOK_SECRET` | Webhook signing secret from the Razorpay dashboard |
414: 
415: **Frontend (`frontend/.env`)**
416: 
417: | Variable | Description |
418: |---|---|
419: | `VITE_API_BASE_URL` | Backend API base URL |
420: | `VITE_GOOGLE_CLIENT_ID` | Google One-Tap client ID |
421: | `VITE_RAZORPAY_KEY_ID` | Razorpay public key ID (Test Mode key for local dev; never the secret) |
422: | `VITE_IMAGEKIT_PUBLIC_KEY` / `VITE_IMAGEKIT_URL_ENDPOINT` | ImageKit client config |
423: | `VITE_EMAILJS_SERVICE_ID` / `VITE_EMAILJS_TEMPLATE_ID` / `VITE_EMAILJS_PUBLIC_KEY` | EmailJS contact form config |
424: 
425: ---
426: 
427: ## Getting Started
428: 
429: **Prerequisites:** Node.js ≥ 18, npm ≥ 9, a MongoDB instance, and accounts for ImageKit, Resend, Google Cloud Console, EmailJS, and Razorpay (Test Mode is enough for local setup).
430: 
431: ```bash
432: # 1. Clone
433: git clone https://github.com/Imaginum-org/Unideals.git
434: cd Unideals
435: 
436: # 2. Backend
437: cd backend
438: cp .env.sample .env        # fill in your values (see Configuration)
439: npm install
440: node src/seeds/plans.seed.js   # sanity-check the plan catalog
441: npm run dev                # http://localhost:5000
442: 
443: # 3. Frontend (new terminal, from repo root)
444: cd frontend
445: cp .env.sample .env        # fill in your values (see Configuration)
446: npm install
447: npm run dev                # http://localhost:5173
448: ```
449: 
450: Verify the API is running at `http://localhost:5000/health`.
451: 
452: **Testing payments locally:** keep Razorpay in Test Mode, use the test keys in both `.env` files, and point a webhook at your machine with a tunnel (e.g. `ngrok http 5000` → webhook URL `https://<tunnel>/api/payments/webhook` with `payment.captured` + `payment.failed` events). Pay with test card `4111 1111 1111 1111` (any future expiry/CVV) or test UPI `success@razorpay` / `failure@razorpay`. No real money moves in Test Mode.
453: 
454: **Plan reference:** `Subscription_plan.md` in the repo root is the source of truth for plan prices, limits, and boost rules. Switch Founder → semester billing later by setting `ACTIVE_SUBSCRIPTION_TYPE = semester` in `backend/src/config/subscriptionPlans.js`.
455: 
456: ---
457: 
458: ## Security
459: 
460: | Layer | Implementation |
461: |---|---|
462: | Transport | CORS restricted to configured frontend and admin origins |
463: | Authentication | 15-minute JWT access tokens (HttpOnly cookies; Bearer accepted); rotating 7-day refresh tokens with reuse detection and instant revocation on logout, password reset, or suspension |
464: | Authorization | Auth middleware on protected routes; role middleware for admin endpoints; tier guard helper for paid features |
465: | Input validation | Strict Zod schemas on request bodies; server-side amounts for all payments (client can never set a price) |
466: | Payments | HMAC-SHA256 signature verification, server-to-server order confirmation, atomic single-activation per order, idempotent webhooks |
467: | XSS protection | Deep sanitization on nested body, params, and query strings |
468: | NoSQL injection | Deep body/param/query/cookie key sanitization against `$` and `.` operators |
469: | Rate limiting | Per-IP throttling on auth, product creation, boost, report, ImageKit auth, and payment endpoints |
470: | Error handling | No stack or internal leakage to clients; correct status codes (404/409/400 mapped, 5xx masked) |
471: | HTTP hardening | Helmet secure response headers; security headers on the frontend deployment |
472: | Media | Signed ImageKit upload tokens; JPG/PNG/WEBP allowlist with size caps; private keys kept server-side only |
473: 
474: ---
475: 
476: ## License
477: 
478: Distributed under the **ISC License**. See `package.json` in `backend/` and `frontend/`.
479: 
480: <div align="center">
481: 
482: <br/>
483: 
484: Built by **[Team Imaginum](https://imaginumorg.vercel.app/)**
485: 
486: </div>

(End of file - total 486 lines)
</content>
```

---

## Assistant (Plan · Muse Spark 1.3 Free · 3.6s)

_Thinking:_



**Tool: read**

**Input:**
```json
{
  "filePath": "E:\\Unideals\\backend\\server.js"
}
```

**Output:**
```
<path>E:\Unideals\backend\server.js</path>
<type>file</type>
<content>
1: import dotenv from "dotenv";
2: dotenv.config();
3: 
4: if (!process.env.SECRET_KEY_ACCESS_TOKEN || !process.env.SECRET_KEY_REFRESH_TOKEN) {
5:   console.error("Missing JWT secrets (SECRET_KEY_ACCESS_TOKEN / SECRET_KEY_REFRESH_TOKEN)");
6:   process.exit(1);
7: }
8: 
9: import http from "http";
10: import app from "./src/app.js";
11: import { connectDB } from "./src/config/db.js";
12: import { scheduleCleanupDeletedProducts } from "./src/jobs/cleanupDeletedProducts.job.js";
13: import { scheduleExpireBoosts } from "./src/jobs/expireBoosts.job.js";
14: import { scheduleExpireSubscriptions } from "./src/jobs/expireSubscriptions.job.js";
15: import { scheduleDispatchNotifications } from "./src/jobs/dispatchScheduledNotifications.job.js";
16: import { initSockets } from "./src/sockets/index.js";
17: 
18: const PORT = process.env.PORT || 5000;
19: 
20: const startServer = async () => {
21:   try {
22:     await connectDB();
23: 
24:     scheduleCleanupDeletedProducts();
25:     scheduleExpireBoosts();
26:     scheduleExpireSubscriptions();
27:     scheduleDispatchNotifications();
28: 
29:     const httpServer = http.createServer(app);
30:     initSockets(httpServer);
31: 
32:     httpServer.listen(PORT, () => {
33:       console.log(`Server running on port ${PORT}`);
34:     });
35:   } catch (error) {
36:     console.error("Failed to start server:", error.message);
37:     process.exit(1);
38:   }
39: };
40: 
41: startServer();

(End of file - total 41 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "E:\\Unideals\\backend\\src"
}
```

**Output:**
```
<path>E:\Unideals\backend\src</path>
<type>directory</type>
<entries>
app.js
config/
controllers/
jobs/
middlewares/
models/
routes/
seeds/
services/
sockets/
utils/
validations/

(12 entries)
</entries>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "E:\\Unideals\\backend\\package.json"
}
```

**Output:**
```
<path>E:\Unideals\backend\package.json</path>
<type>file</type>
<content>
1: {
2:   "name": "unideals-backend",
3:   "version": "1.0.0",
4:   "description": "Backend API for Unideals - a marketplace platform",
5:   "main": "server.js",
6:   "type": "module",
7:   "scripts": {
8:     "dev": "nodemon server.js",
9:     "start": "node server.js",
10:     "prod": "NODE_ENV=production node server.js",
11:     "seed:campuses": "node src/seeds/campuses.seed.js",
12:     "lint": "echo \"Add ESLint here\"",
13:     "format": "echo \"Add Prettier here\""
14:   },
15:   "keywords": [
16:     "nodejs",
17:     "express",
18:     "mongodb",
19:     "marketplace",
20:     "backend",
21:     "api"
22:   ],
23:   "author": "Imaginum team",
24:   "license": "ISC",
25:   "engines": {
26:     "node": "22.x"
27:   },
28:   "dependencies": {
29:     "bcrypt": "^6.0.0",
30:     "compression": "^1.8.2",
31:     "cookie-parser": "^1.4.7",
32:     "cors": "^2.8.6",
33:     "crypto": "^1.0.1",
34:     "dotenv": "^17.2.4",
35:     "express": "^5.2.1",
36:     "express-rate-limit": "^8.3.2",
37:     "google-auth-library": "^10.6.2",
38:     "helmet": "^8.1.0",
39:     "imagekit": "^6.0.0",
40:     "jsonwebtoken": "^9.0.3",
41:     "mongoose": "^9.2.0",
42:     "morgan": "^1.10.1",
43:     "multer": "^2.4.0",
44:     "nanoid": "^5.1.9",
45:     "node-cron": "^3.0.3",
46:     "razorpay": "^2.9.8",
47:     "resend": "^6.9.4",
48:     "slugify": "^1.6.9",
49:     "socket.io": "^4.8.3",
50:     "socket.io-client": "^4.8.3",
51:     "xss": "^1.0.15",
52:     "zod": "^4.3.6"
53:   },
54:   "devDependencies": {
55:     "nodemon": "^3.1.11"
56:   }
57: }

(End of file - total 57 lines)
</content>
```

---

## Assistant (Plan · Muse Spark 1.3 Free · 2.4s)

**Tool: read**

**Input:**
```json
{
  "filePath": "E:\\Unideals\\backend\\src\\app.js"
}
```

**Output:**
```
<path>E:\Unideals\backend\src\app.js</path>
<type>file</type>
<content>
1: import express from "express";
2: import cors from "cors";
3: import compression from "compression";
4: import cookieParser from "cookie-parser";
5: import morgan from "morgan";
6: import helmet from "helmet";
7: 
8: import xss from "xss";
9: import rateLimit from "express-rate-limit";
10: 
11: import authRouter from "./routes/auth.routes.js";
12: import userRouter from "./routes/user.routes.js";
13: import productRouter from "./routes/product.routes.js";
14: import reportRouter from "./routes/report.routes.js";
15: import pickupSpotRouter from "./routes/pickupSpot.routes.js";
16: import imagekitRouter from "./routes/imagekit.routes.js";
17: import wishlistRouter from "./routes/wishlist.routes.js";
18: import campusRouter from "./routes/campus.routes.js";
19: import adminRouter from "./routes/admin.routes.js";
20: import boostRouter from "./routes/boost.routes.js";
21: import paymentRouter, { paymentWebhookHandler } from "./routes/payment.routes.js";
22: import badgeRouter from "./routes/badgeRoutes.js";
23: import rewardRouter from "./routes/rewardRoutes.js";
24: import handoffRouter from "./routes/handoff.routes.js";
25: import conversationRouter from "./routes/conversation.route.js";
26: import dealRouter from "./routes/deal.route.js";
27: import orderRouter from "./routes/order.routes.js";
28: import notificationRouter from "./routes/notification.routes.js";
29: import { verifyOrigin } from "./middlewares/csrf.middleware.js";
30: 
31: // import errorMiddleware from "./middlewares/error.middleware.js";
32: const app = express();
33: 
34: // Behind Render/ELB the client IP comes from X-Forwarded-For — required
35: // for express-rate-limit to key per client instead of per proxy.
36: app.set("trust proxy", 1);
37: 
38: const allowedOrigins = [
39:   process.env.FRONTEND_URL,
40:   process.env.ADMIN_FRONTEND_URL,
41: ]
42:   .filter(Boolean)
43:   .flatMap((origin) => origin.split(","))
44:   .map((origin) => origin.trim())
45:   .filter(Boolean);
46: 
47: // In non-production, allow local dev origins alongside configured ones.
48: const isProduction = process.env.NODE_ENV === "production";
49: const devOrigins = isProduction
50:   ? []
51:   : ["http://localhost:5173", "http://127.0.0.1:5173"];
52: 
53: // Protection against XSS attacks, clickjacking, malicious headers
54: app.use(
55:   helmet({
56:     crossOriginResourcePolicy: false,
57:   }),
58: );
59: 
60: 
61: // Prevent NoSQL injection - deep sanitize body, params, query, cookies
62: app.use((req, res, next) => {
63:   const sanitize = (obj, seen = new WeakSet()) => {
64:     if (!obj || typeof obj !== "object" || seen.has(obj)) return;
65:     seen.add(obj);
66: 
67:     for (const key of Object.keys(obj)) {
68:       if (key.includes("$") || key.includes(".")) {
69:         delete obj[key];
70:         continue;
71:       }
72:       const val = obj[key];
73:       if (typeof val === "object" && val !== null) {
74:         sanitize(val, seen);
75:       }
76:     }
77:   };
78: 
79:   sanitize(req.body);
80:   sanitize(req.params);
81:   // req.query is a getter in Express 5 - sanitize in place when possible,
82:   // otherwise replace with a cleaned copy.
83:   try {
84:     if (req.query && typeof req.query === "object") {
85:       sanitize(req.query);
86:     }
87:   } catch {
88:     // ignore - query validation happens downstream
89:   }
90:   if (req.cookies && typeof req.cookies === "object") {
91:     sanitize(req.cookies);
92:   }
93: 
94:   next();
95: });
96: 
97: // Prevent XSS attacks - deep sanitize strings in body/params/query
98: app.use((req, res, next) => {
99:   const sanitizeStrings = (obj, seen = new WeakSet()) => {
100:     if (!obj || typeof obj !== "object" || seen.has(obj)) return;
101:     seen.add(obj);
102:     for (const key of Object.keys(obj)) {
103:       const val = obj[key];
104:       if (typeof val === "string") {
105:         obj[key] = xss(val);
106:       } else if (Array.isArray(val)) {
107:         for (let i = 0; i < val.length; i++) {
108:           if (typeof val[i] === "string") val[i] = xss(val[i]);
109:           else if (typeof val[i] === "object" && val[i] !== null)
110:             sanitizeStrings(val[i], seen);
111:         }
112:       } else if (typeof val === "object" && val !== null) {
113:         sanitizeStrings(val, seen);
114:       }
115:     }
116:   };
117: 
118:   if (req.body) sanitizeStrings(req.body);
119:   if (req.params) sanitizeStrings(req.params);
120:   try {
121:     if (req.query) sanitizeStrings(req.query);
122:   } catch {
123:     // ignore
124:   }
125: 
126:   next();
127: });
128: 
129: app.use(
130:   cors({
131:     origin: (origin, callback) => {
132:       // Non-browser clients (curl, Postman, health checks) send no Origin.
133:       // Allow them without credentials risk since CSRF requires a browser Origin.
134:       if (!origin) {
135:         return callback(null, true);
136:       }
137:       if (
138:         allowedOrigins.includes(origin) ||
139:         devOrigins.includes(origin)
140:       ) {
141:         return callback(null, true);
142:       }
143: 
144:       return callback(new Error("Not allowed by CORS"));
145:     },
146:     credentials: true, // allows cookies
147:     methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
148:   }),
149: );
150: 
151: // Additive route guards (no behavior change to existing handlers):
152: // - Razorpay retries legitimately burst, so the webhook gets a high 100/min
153: //   ceiling that only blocks floods.
154: // - Admin reads across all /api/admin GETs get a shared 60/min ceiling
155: //   (writes/mutations untouched).
156: const paymentWebhookLimiter = rateLimit({
157:   windowMs: 60 * 1000,
158:   max: 100,
159:   standardHeaders: "draft-7",
160:   legacyHeaders: false,
161:   message: { success: false, message: "Too many webhook deliveries, try later" },
162: });
163: 
164: const adminReadLimiter = rateLimit({
165:   windowMs: 60 * 1000,
166:   max: 60,
167:   standardHeaders: "draft-7",
168:   legacyHeaders: false,
169:   message: { success: false, message: "Too many requests, try later" },
170: });
171: 
172: // Razorpay webhook needs the RAW body for HMAC verification. It MUST be
173: // registered BEFORE express.json(): json() would otherwise consume the
174: // request stream, leaving express.raw with an empty body and every
175: // legitimate webhook failing signature check. Sanitizers above safely skip
176: // the unparsed body (req.body is undefined at that point).
177: // (POST /api/payments/webhook, no auth — the HMAC signature is the auth.)
178: app.post(
179:   "/api/payments/webhook",
180:   paymentWebhookLimiter,
181:   express.raw({ type: "application/json", limit: "1mb" }),
182:   paymentWebhookHandler,
183: );
184: 
185: app.use(express.json({ limit: "10kb" })); // To prevent large payload attacks
186: app.use(express.urlencoded({ extended: true, limit: "10kb" })); // Handles form data from frontend
187: app.use(cookieParser());
188: 
189: // Logging in Development mode only - redact secrets from URLs
190: if (process.env.NODE_ENV !== "production") {
191:   morgan.token("redacted-url", (req) => {
192:     try {
193:       const url = req.originalUrl || req.url || "";
194:       return url
195:         .replace(/(oauth_code|code|token)=[^&]*/gi, "$1=[REDACTED]")
196:         .replace(/([?&]k=)[^&]*/gi, "$1[REDACTED]")
197:         .replace(/\/reset-password\/[^/\s?]+/gi, "/reset-password/[REDACTED]");
198:     } catch {
199:       return req.url;
200:     }
201:   });
202:   app.use(morgan(":method :redacted-url :status :response-time ms"));
203: }
204: 
205: // Health check route (minimal — no uptime/internals for fingerprinting)
206: app.get("/health", (req, res) => {
207:   res.status(200).json({ status: "OK" });
208: });
209: 
210: // Gzip JSON + thumbs metadata (threshold keeps tiny auth payloads fast).
211: app.use(compression({ threshold: 1024 }));
212: 
213: // Routes
214: app.use(verifyOrigin);
215: app.use("/api/auth", authRouter);
216: app.use("/api/user", userRouter);
217: app.use("/api/product", productRouter);
218: app.use("/api/report", reportRouter);
219: app.use("/api/pickup-spots", pickupSpotRouter);
220: app.use("/api/imagekit", imagekitRouter);
221: app.use("/api/wishlist", wishlistRouter);
222: app.use("/api/campuses", campusRouter);
223: app.use(
224:   "/api/admin",
225:   (req, res, next) =>
226:     req.method === "GET" ? adminReadLimiter(req, res, next) : next(),
227:   adminRouter,
228: );
229: app.use("/api/boost", boostRouter);
230: app.use("/api/payments", paymentRouter);
231: app.use("/api/badges", badgeRouter);
232: app.use("/api/rewards", rewardRouter);
233: app.use("/api/handoff", handoffRouter);
234: app.use("/api/conversations", conversationRouter);
235: app.use("/api/deals", dealRouter);
236: app.use("/api/orders", orderRouter);
237: app.use("/api/notifications", notificationRouter);
238: 
239: // If no route matches
240: app.use((req, res) => {
241:   res.status(404).json({
242:     success: false,
243:     message: "Route not found",
244:   });
245: });
246: 
247: // Global error handler - never leak internals, preserve status codes
248: app.use((err, req, res, next) => {
249:   // CORS origin rejection: blocked before any route logic — no stack needed.
250:   if (err && /not allowed by cors/i.test(err.message || "")) {
251:     return res.status(403).json({ success: false, message: "Origin not allowed" });
252:   }
253: 
254:   const statusCode = err.statusCode || err.status || 500;
255: 
256:   // Log full error server-side only
257:   console.error(err);
258: 
259:   // Map known DB/driver errors to safe messages without leaking details
260:   let message = err.message || "Something went wrong";
261:   if (err.name === "CastError") {
262:     return res.status(400).json({ success: false, message: "Invalid ID format" });
263:   }
264:   if (err.code === 11000) {
265:     return res.status(409).json({ success: false, message: "Duplicate entry" });
266:   }
267:   if (err.name === "ValidationError") {
268:     return res.status(400).json({ success: false, message: "Validation failed" });
269:   }
270:   // Don't expose 5xx internals to clients
271:   if (statusCode >= 500) {
272:     message = "Internal server error";
273:   }
274: 
275:   return res.status(statusCode).json({
276:     success: false,
277:     message,
278:     ...(err.code ? { code: err.code } : {}),
279:     ...(typeof err.retryAfterMs === "number"
280:       ? { retryAfterMs: err.retryAfterMs }
281:       : {}),
282:   });
283: });
284: 
285: export default app;

(End of file - total 285 lines)
</content>
```

**Tool: glob**

**Input:**
```json
{
  "path": "E:\\Unideals\\backend\\src\\middlewares",
  "pattern": "*.js"
}
```

**Output:**
```
E:\Unideals\backend\src\middlewares\validation.middleware.js
E:\Unideals\backend\src\middlewares\role.middleware.js
E:\Unideals\backend\src\middlewares\plan.middleware.js
E:\Unideals\backend\src\middlewares\error.middleware.js
E:\Unideals\backend\src\middlewares\csrf.middleware.js
E:\Unideals\backend\src\middlewares\auth.middleware.js
```

**Tool: glob**

**Input:**
```json
{
  "path": "E:\\Unideals\\frontend\\src\\services",
  "pattern": "*"
}
```

**Output:**
```
E:\Unideals\frontend\src\services\axiosInstance.js
E:\Unideals\frontend\src\services\authInterceptor.js
```

---

## Assistant (Plan · Muse Spark 1.3 Free · 2.7s)

**Tool: read**

**Input:**
```json
{
  "filePath": "E:\\Unideals\\backend\\src\\middlewares\\auth.middleware.js"
}
```

**Output:**
```
<path>E:\Unideals\backend\src\middlewares\auth.middleware.js</path>
<type>file</type>
<content>
1: import jwt from "jsonwebtoken";
2: import User from "../models/User.model.js";
3: import { USER_STATUS } from "../config/constants.js";
4: 
5: const auth = async (req, res, next) => {
6:   try {
7:     let token;
8: 
9:     // Get token from cookies or header
10:     if (req.cookies?.accessToken) {
11:       token = req.cookies.accessToken;
12:     } else if (req.headers.authorization?.startsWith("Bearer ")) {
13:       token = req.headers.authorization.split(" ")[1];
14:     }
15: 
16:     if (!token) {
17:       return res.status(401).json({
18:         message: "Access token required",
19:         success: false,
20:         error: true,
21:       });
22:     }
23: 
24:     const decoded = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN, {
25:       algorithms: ["HS256"],
26:     });
27: 
28:     const user = await User.findById(decoded.id)
29:       .select("-password -refresh_token")
30:       .lean();
31: 
32:     if (!user) {
33:       return res.status(401).json({
34:         message: "User not found",
35:         success: false,
36:         error: true,
37:       });
38:     }
39: 
40:     // Reject legacy pre-v tokens (no numeric v → force one re-login).
41:     if (typeof decoded.v !== "number") {
42:       return res.status(401).json({
43:         message: "Session revoked. Please log in again.",
44:         success: false,
45:         error: true,
46:       });
47:     }
48: 
49:     // Token version check - sessions revoked on logout/password reset/suspend
50:     if (
51:       typeof user.tokenVersion === "number" &&
52:       decoded.v !== user.tokenVersion
53:     ) {
54:       return res.status(401).json({
55:         message: "Session revoked. Please log in again.",
56:         success: false,
57:         error: true,
58:       });
59:     }
60: 
61:     // Block inactive/suspended users
62:     if (user.status !== USER_STATUS.ACTIVE) {
63:       const statusLabel =
64:         user.status === USER_STATUS.SUSPENDED ? "suspended" : "inactive";
65: 
66:       return res.status(403).json({
67:         message: `Your account is ${statusLabel}. Please contact support.`,
68:         success: false,
69:         error: true,
70:         accountBlocked: true,
71:         accountStatus: user.status,
72:       });
73:     }
74: 
75:     // Defense-in-depth verified gate for mutations (public GETs use
76:     // optionalAuth so unaffected; login/verify routes don't use auth()).
77:     if (!user.is_email_verified) {
78:       return res.status(403).json({
79:         message: "Email verification required.",
80:         success: false,
81:         error: true,
82:       });
83:     }
84: 
85:     req.userId = user._id;
86:     req.user = user;
87: 
88:     next();
89:   } catch (err) {
90:     return res.status(401).json({
91:       message: "Invalid or expired token",
92:       success: false,
93:       error: true,
94:     });
95:   }
96: };
97: 
98: // Optional auth for public routes: attaches req.user when a valid session
99: // cookie is present, never rejects. Lets campus-scoped public endpoints
100: // (feed, search, detail) use the profile campus for logged-in users while
101: // staying open to guests (who scope via campus_slug instead).
102: export const optionalAuth = async (req, res, next) => {
103:   try {
104:     let token;
105: 
106:     if (req.cookies?.accessToken) {
107:       token = req.cookies.accessToken;
108:     } else if (req.headers.authorization?.startsWith("Bearer ")) {
109:       token = req.headers.authorization.split(" ")[1];
110:     }
111: 
112:     if (!token) return next();
113: 
114:     const decoded = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN, {
115:       algorithms: ["HS256"],
116:     });
117: 
118:     const user = await User.findById(decoded.id)
119:       .select("-password -refresh_token")
120:       .lean();
121: 
122:     if (!user) return next();
123: 
124:     // Legacy pre-v tokens carry no session version — treat as guest.
125:     if (typeof decoded.v !== "number") return next();
126: 
127:     if (
128:       typeof user.tokenVersion === "number" &&
129:       decoded.v !== user.tokenVersion
130:     ) {
131:       return next();
132:     }
133: 
134:     if (user.status !== USER_STATUS.ACTIVE) return next();
135: 
136:     req.userId = user._id;
137:     req.user = user;
138:   } catch {
139:     // Expired/invalid session on a public route: fall through as guest.
140:   }
141: 
142:   next();
143: };
144: 
145: export default auth;

(End of file - total 145 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "E:\\Unideals\\backend\\src\\middlewares\\csrf.middleware.js"
}
```

**Output:**
```
<path>E:\Unideals\backend\src\middlewares\csrf.middleware.js</path>
<type>file</type>
<content>
1: // Origin check against CSRF on cookie-authenticated mutating endpoints.
2: // CORS allowlists do NOT stop simple cross-site form POSTs (cookies attach
3: // automatically), so state-changing routes need an explicit Origin/Referer
4: // gate. Safe methods, server-to-server webhooks, and non-browser clients
5: // (no Origin) always pass through.
6: const EXEMPT_PREFIXES = ["/api/payments/webhook"];
7: 
8: const normalize = (origin) => String(origin || "").trim().replace(/\/+$/, "");
9: 
10: const configuredOrigins = () =>
11:   [process.env.FRONTEND_URL, process.env.ADMIN_FRONTEND_URL]
12:     .filter(Boolean)
13:     .flatMap((value) => String(value).split(","))
14:     .map(normalize)
15:     .filter(Boolean);
16: 
17: export const verifyOrigin = (req, res, next) => {
18:   if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) return next();
19:   if (EXEMPT_PREFIXES.some((p) => req.path === p || req.originalUrl.startsWith(p))) {
20:     return next();
21:   }
22: 
23:   const origin = normalize(req.headers.origin);
24:   const referer = String(req.headers.referer || "");
25: 
26:   // Non-browser clients send neither — no CSRF possible.
27:   if (!origin && !referer) return next();
28: 
29:   // Same-origin requests are always legitimate.
30:   if (origin) {
31:     try {
32:       if (new URL(origin).host === String(req.headers.host || "").split(",")[0].trim()) {
33:         return next();
34:       }
35:     } catch {
36:       // fall through to allowlist check
37:     }
38:   }
39: 
40:   const allowed = configuredOrigins();
41:   // Fail open when no origins are configured (local dev) rather than
42:   // bricking every mutation.
43:   if (allowed.length === 0) return next();
44: 
45:   const ok =
46:     (origin && allowed.includes(origin)) ||
47:     allowed.some((a) => origin === a || (referer && referer.startsWith(a)));
48: 
49:   if (!ok) {
50:     return res.status(403).json({
51:       success: false,
52:       message: "Request origin not allowed",
53:     });
54:   }
55: 
56:   next();
57: };

(End of file - total 57 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "E:\\Unideals\\frontend\\src\\services\\axiosInstance.js"
}
```

**Output:**
```
<path>E:\Unideals\frontend\src\services\axiosInstance.js</path>
<type>file</type>
<content>
1: import axios from "axios";
2: 
3: const baseURL = import.meta.env.VITE_API_BASE_URL;
4: if (!baseURL) {
5:   console.warn("VITE_API_BASE_URL is not set - API calls will fail");
6: }
7: 
8: const instance = axios.create({
9:   baseURL,
10:   withCredentials: true,
11:   timeout: 30000,
12: });
13: 
14: export default instance;

(End of file - total 14 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "E:\\Unideals\\backend\\src\\sockets/index.js"
}
```

**Output:**
```
<path>E:\Unideals\backend\src\sockets\index.js</path>
<type>file</type>
<content>
1: import { Server } from "socket.io";
2: import jwt from "jsonwebtoken";
3: import mongoose from "mongoose";
4: import Conversation from "../models/conversation.model.js";
5: import User from "../models/User.model.js";
6: import { USER_STATUS } from "../config/constants.js";
7: import { setIO } from "../utils/socket.js";
8: 
9: const parseCookies = (header) => {
10:   const out = {};
11:   if (!header) return out;
12:   header.split(";").forEach((part) => {
13:     const [k, ...rest] = part.trim().split("=");
14:     if (k) out[k.trim()] = decodeURIComponent(rest.join("=") || "");
15:   });
16:   return out;
17: };
18: 
19: const authSocket = async (socket, next) => {
20:   try {
21:     // Token via auth payload (client sends from memory) or HttpOnly cookie.
22:     let token =
23:       socket.handshake.auth?.token ||
24:       socket.handshake.headers?.authorization?.replace("Bearer ", "");
25:     if (!token) {
26:       const cookies = parseCookies(socket.handshake.headers?.cookie || "");
27:       token = cookies.accessToken;
28:     }
29:     if (!token) return next(new Error("Unauthorized"));
30: 
31:     const decoded = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN, {
32:       algorithms: ["HS256"],
33:     });
34:     if (typeof decoded?.v !== "number" || !decoded?.id) {
35:       return next(new Error("Unauthorized"));
36:     }
37:     // Session + account check per connection (cheap, once per socket).
38:     // Revoked sessions and suspended users get no realtime channel.
39:     const user = await User.findById(decoded.id)
40:       .select("_id status tokenVersion campus_id")
41:       .lean();
42:     if (
43:       !user ||
44:       user.status !== USER_STATUS.ACTIVE ||
45:       user.tokenVersion !== decoded.v
46:     ) {
47:       return next(new Error("Unauthorized"));
48:     }
49:     socket.userId = String(user._id);
50:     socket.campusId = user.campus_id ? String(user.campus_id) : null;
51:     return next();
52:   } catch {
53:     return next(new Error("Unauthorized"));
54:   }
55: };
56: 
57: // Broadcast who is currently inside a conversation room so both sides can
58: // render live "Online" presence. Room-scoped: no global user tracking.
59: const emitPresence = async (io, conversationId) => {
60:   try {
61:     const room = `conversation:${conversationId}`;
62:     const sockets = await io.in(room).fetchSockets();
63:     const onlineUserIds = [
64:       ...new Set(sockets.map((s) => s.userId).filter(Boolean)),
65:     ];
66:     io.to(room).emit("presence:update", {
67:       conversationId: String(conversationId),
68:       onlineUserIds,
69:     });
70:   } catch {
71:     // presence is best-effort
72:   }
73: };
74: 
75: export const initSockets = (httpServer) => {
76:   const frontend = (process.env.FRONTEND_URL || "")
77:     .split(",")
78:     .map((s) => s.trim())
79:     .filter(Boolean);
80:   const io = new Server(httpServer, {
81:     cors: {
82:       origin: [...frontend, "http://localhost:5173", "http://127.0.0.1:5173"],
83:       credentials: true,
84:     },
85:     transports: ["websocket", "polling"],
86:   });
87: 
88:   io.use(authSocket);
89:   setIO(io);
90: 
91:   io.on("connection", (socket) => {
92:     const userId = socket.userId;
93:     socket.join(`user:${userId}`);
94:     socket.join("broadcast:all");
95:     if (socket.campusId) {
96:       socket.join(`campus:${socket.campusId}`);
97:     }
98: 
99:     // Join a conversation room after verifying participation.
100:     socket.on("join_conversation", async (conversationId, ack) => {
101:       try {
102:         if (!mongoose.Types.ObjectId.isValid(conversationId)) {
103:           ack?.({ ok: false, error: "Invalid conversation" });
104:           return;
105:         }
106:         const conv = await Conversation.findById(conversationId).select(
107:           "buyer_id seller_id",
108:         );
109:         if (
110:           !conv ||
111:           (String(conv.buyer_id) !== userId &&
112:             String(conv.seller_id) !== userId)
113:         ) {
114:           ack?.({ ok: false, error: "No access" });
115:           return;
116:         }
117:         socket.join(`conversation:${conversationId}`);
118:         ack?.({ ok: true });
119:         emitPresence(io, conversationId);
120:       } catch {
121:         ack?.({ ok: false });
122:       }
123:     });
124: 
125:     socket.on("leave_conversation", (conversationId) => {
126:       socket.leave(`conversation:${conversationId}`);
127:       emitPresence(io, conversationId);
128:     });
129: 
130:     // Ephemeral typing indicator, relayed to the room (no persistence).
131:     // Flood-guarded: "still typing" at most ~1/sec per socket, "stopped"
132:     // always passes so the indicator never sticks on.
133:     socket.on("typing", ({ conversationId, isTyping }) => {
134:       if (!mongoose.Types.ObjectId.isValid(conversationId)) return;
135:       const now = Date.now();
136:       if (isTyping && now - (socket._lastType || 0) < 900) return;
137:       socket._lastType = now;
138:       socket.to(`conversation:${conversationId}`).emit("typing", {
139:         conversationId: String(conversationId),
140:         userId,
141:         isTyping: Boolean(isTyping),
142:       });
143:     });
144: 
145:     // Capture watched threads while rooms are still visible; the actual
146:     // broadcast happens on "disconnect" (membership already removed then),
147:     // so the peer flips to offline instead of seeing a stale self-echo.
148:     socket.on("disconnecting", () => {
149:       socket._convRooms = [...socket.rooms].filter((room) =>
150:         room.startsWith("conversation:"),
151:       );
152:     });
153: 
154:     socket.on("disconnect", () => {
155:       for (const room of socket._convRooms || []) {
156:         emitPresence(io, room.replace("conversation:", ""));
157:       }
158:     });
159:   });
160: 
161:   return io;
162: };

(End of file - total 162 lines)
</content>
```

---

## Assistant (Plan · Muse Spark 1.3 Free · 4.6s)

_Thinking:_



Found cookie-based auth and web-specific integrations — checking the remaining mobile blockers.

**Tool: grep**

**Input:**
```json
{
  "include": "*.js",
  "path": "E:\\Unideals\\frontend\\src",
  "pattern": "Razorpay|Checkout|Google|One-Tap|ImageKit|SecureStore|AsyncStorage|expo"
}
```

**Output:**
```
Found 100 matches (more matches available)
E:\Unideals\frontend\src\services\axiosInstance.js:
  Line 14: export default instance;


E:\Unideals\frontend\src\utils\imageUpload.js:
  Line 7: export const uploadImage = async (file, folder = "Products") => {

  Line 79: export const deleteImage = async (fileId) => {


E:\Unideals\frontend\src\hooks\useSafeTimeout.js:
  Line 10: export const useSafeTimeout = () => {

  Line 31: export default useSafeTimeout;


E:\Unideals\frontend\src\services\authInterceptor.js:
  Line 170: export default instance;


E:\Unideals\frontend\src\utils\imageTransform.js:
  Line 2:  * ImageKit on-the-fly transforms. Uploads are stored full-res; every

  Line 4:  * 1600px file for a 40px thumbnail. Non-ImageKit URLs (Google avatars,

  Line 7: const isImageKitUrl = (url) =>

  Line 10: export const ik = (url, { w, h, q = 70 } = {}) => {

  Line 11:   if (!isImageKitUrl(url) || !w) return url;

  Line 20: export const ikThumb = (url, size = 200) => ik(url, { w: size, h: size, q: 60 });

  Line 23: export const ikFirstThumb = (entry, fallback = "/logo.svg", size = 200) => {

  Line 29: export const ikCard = (url) => ik(url, { w: 800, q: 70 });

  Line 32: export const ikFull = (url) => ik(url, { w: 1600, q: 80 });


E:\Unideals\frontend\src\utils\cn.js:
  Line 3: export const cn = (...inputs) => clsx(...inputs);

  Line 5: export default cn;


E:\Unideals\frontend\src\utils\badgeConfig.js:
  Line 5: export const BADGE_CATALOGUE = [

  Line 226: export const BADGE_MAP = Object.fromEntries(BADGE_CATALOGUE.map((b) => [b.id, b]));

  Line 227: export const BADGE_CATEGORIES = ["seller", "buyer", "communication", "trust", "milestone"];

  Line 230: export function getBadgeMeta(badgeId) {

  Line 236: export const TIER_STYLES = {

  Line 268: export const RANK_CONFIG = {

  Line 280: export const RANK_TIERS_GUIDE = [

  Line 398: export const XP_ACTIVITIES_GUIDE = [

  Line 412: export const LEVEL_REWARDS_GUIDE = [

  Line 426: export function computeLevel(xp = 0) {

  Line 430: export function xpForLevel(level = 1) {

  Line 434: export function xpToNextLevel(xp = 0) {

  Line 439: export function levelProgress(xp = 0) {


E:\Unideals\frontend\src\features\user\api\userApi.js:
  Line 3: export const getUserProfile = () => axios.get("/api/user/userProfile");

  Line 5: export const updateProfile = (data) =>

  Line 8: export const requestGenderChange = (requestedGender) =>

  Line 11: export const getGenderChangeStatus = () =>

  Line 14: export const updateChatSettings = (data) =>

  Line 17: export const updateAvatar = (data) => axios.put("/api/user/updateAvatar", data);

  Line 19: export const removeAvatar = () => axios.delete("/api/user/removeAvatar");

  Line 21: export const deleteAccount = (data = {}) =>

  Line 24: export const createPickupSpot = (data) => axios.post("/api/pickup-spots", data);

  Line 26: export const getUserPickupSpots = () => axios.get("/api/pickup-spots");

  Line 28: export const updatePickupSpot = (id, data) =>

  Line 31: export const deletePickupSpot = (id) => axios.delete(`/api/pickup-spots/${id}`);

  Line 33: export const setPrimaryPickupSpot = (id) =>


E:\Unideals\frontend\src\features\auth\utils\passwordStrength.js:
  Line 7: export function getPasswordChecks(password = "") {

  Line 18: export function getPasswordStrength(password) {

  Line 35: export function isPasswordStrongEnough(password) {

  Line 52: export function suggestPassword(fullName = "", email = "") {


E:\Unideals\frontend\src\features\user\api\ordersApi.js:
  Line 5: export const fetchOrders = async ({ role = "all", status = "all" } = {}) => {

  Line 18: export const cancelOrder = async (conversationId, reason = "") => {


E:\Unideals\frontend\src\features\user\api\badgeApi.js:
  Line 4: export const fetchMyBadges = () => axiosInstance.get("/api/badges/me");

  Line 7: export const recomputeBadges = () => axiosInstance.post("/api/badges/compute");

  Line 10: export const fetchLeaderboard = (limit = 20) =>

  Line 14: export const fetchMyRewards = () => axiosInstance.get("/api/rewards/me");


E:\Unideals\frontend\src\features\auth\api\authApi.js:
  Line 5: export const loginUser = (data) => {

  Line 8: export const registerUser = (data) => {

  Line 12: export const refreshToken = () => {

  Line 16: export const exchangeGoogleOAuthCode = (data) => {

  Line 20: export const loginWithGoogleOneTap = (data) => {

  Line 24: export const logoutUser = async () => {

  Line 29: export const forgotPassword = (data) =>

  Line 32: export const verifyEmail = (data) =>

  Line 35: export const checkEmailVerification = (email) =>

  Line 40: export const resendVerification = (data) =>

  Line 43: export const verifyResetPasswordToken = (token) =>

  Line 46: export const resetPassword = (token, data) =>

  Line 49: export const getRefreshTokenUrl = () =>

  Line 52: export const getGoogleAuthUrl = () =>

  Line 55: export const getGoogleAuthCallbackUrl = () =>


E:\Unideals\frontend\src\features\handoff\api\handoffApi.js:
  Line 7: export const createHandoffSession = (maxFiles) => {

  Line 12: export const getHandoffStatus = (code) => {

  Line 19: export const uploadHandoffPhotos = (code, secret, formData, onProgress) => {


E:\Unideals\frontend\src\features\search\hooks\useDebounce.js:
  Line 3: export default function useDebounce(value, delay = 300) {


E:\Unideals\frontend\src\features\campus\api\campusApi.js:
  Line 4: export const getCampuses = () => axios.get("/api/campuses");

  Line 8: export const setMyCampus = (campus_slug) =>


E:\Unideals\frontend\src\features\search\api\searchApi.js:
  Line 3: export const searchProducts = (params = {}, config = {}) => {

  Line 15: export const getSearchSuggestions = (query, signal) => {

  Line 23: export const getTrendingProducts = (params = {}) => {


E:\Unideals\frontend\src\features\chat\hooks\useChatSocket.js:
  Line 19: export const useChatSocket = ({


E:\Unideals\frontend\src\features\chat\utils\wallpapers.js:
  Line 5: export const WALLPAPERS = [

  Line 13: export const wallpaperById = (id) =>

  Line 17: export const chatSettingsOf = (user) => ({


E:\Unideals\frontend\src\features\chat\utils\chatTheme.js:
  Line 5: export const SELL_BTN =

  Line 9: export const SELL_BTN_FLAT =

  Line 13: export const INPUT_BASE =


E:\Unideals\frontend\src\features\chat\utils\display.js:
  Line 5: export const formatName = (name) => {

  Line 15: export const avatarUrl = (avatar) => {


E:\Unideals\frontend\src\components\ui\toast.js:
  Line 13: export const DEFAULT_DURATIONS = { success: 4000, error: 5200, info: 4200 };

  Line 14: export const MAX_TOASTS = 2;

  Line 38: export { dismissToast };

  Line 40: export function toast(message, opts) {

  Line 47: export function useToasts() {


E:\Unideals\frontend\src\features\chat\utils\dealStage.js:
  Line 9: export const ORDER_STEPS = [

  Line 16: export const dealStatusToStep = (status) => {

  Line 34: export const isActiveDealStatus = (status) =>

  Line 39: export const dealStatusBadge = (status) => {


E:\Unideals\frontend\src\features\chat\services\chatApi.js:
  Line 12: export const fetchConversations = async ({ role = "all", search = "", signal } = {}) => {

  Line 20: export const createConversation = async (productId) => {

  Line 25: export const fetchConversation = async (id, { signal } = {}) => {

  Line 32: export const fetchMessages = async (id, { limit = 50, before, signal } = {}) => {

  Line 40: export const sendMessage = async (id, text, { replyTo } = {}) => {


(Results truncated. Consider using a more specific path or pattern.)
```

**Tool: read**

**Input:**
```json
{
  "filePath": "E:\\Unideals\\frontend\\package.json"
}
```

**Output:**
```
<path>E:\Unideals\frontend\package.json</path>
<type>file</type>
<content>
1: {
2:   "name": "unideals-frontend",
3:   "private": true,
4:   "version": "1.0.0",
5:   "description": "Frontend for Unideals marketplace",
6:   "type": "module",
7:   "scripts": {
8:     "dev": "vite",
9:     "build": "vite build",
10:     "preview": "vite preview",
11:     "lint": "eslint .",
12:     "format": "echo \"Add Prettier here\""
13:   },
14:   "keywords": [
15:     "react",
16:     "vite",
17:     "frontend",
18:     "marketplace",
19:     "ui"
20:   ],
21:   "dependencies": {
22:     "@animateicons/react": "^0.3.3",
23:     "@emailjs/browser": "^4.4.1",
24:     "@heroicons/react": "^2.2.0",
25:     "@imagekit/javascript": "^5.3.0",
26:     "@radix-ui/colors": "^3.0.0",
27:     "@radix-ui/react-alert-dialog": "^1.1.15",
28:     "axios": "^1.14.0",
29:     "browser-image-compression": "^2.0.2",
30:     "canvas-confetti": "^1.9.4",
31:     "clsx": "^2.1.1",
32:     "framer-motion": "^12.40.0",
33:     "lucide-react": "^0.475.0",
34:     "radix-ui": "^1.1.3",
35:     "react": "^18.3.1",
36:     "react-dom": "^18.3.1",
37:     "react-icons": "^5.5.0",
38:     "react-qr-code": "^2.2.0",
39:     "react-router-dom": "^7.0.2",
40:     "react-select": "^5.10.1",
41:     "react-spinners": "^0.15.0",
42:     "react-toastify": "^11.0.3",
43:     "socket.io-client": "^4.8.4"
44:   },
45:   "devDependencies": {
46:     "@eslint/js": "^9.15.0",
47:     "@types/react": "^18.3.12",
48:     "@types/react-dom": "^18.3.1",
49:     "@vitejs/plugin-react": "^4.3.4",
50:     "autoprefixer": "^10.4.20",
51:     "eslint": "^9.15.0",
52:     "eslint-plugin-react": "^7.37.2",
53:     "eslint-plugin-react-hooks": "^5.0.0",
54:     "eslint-plugin-react-refresh": "^0.4.14",
55:     "globals": "^15.12.0",
56:     "postcss": "^8.4.49",
57:     "tailwindcss": "^3.4.16",
58:     "vite": "^6.0.1"
59:   }
60: }

(End of file - total 60 lines)
</content>
```

---

## Assistant (Plan · Muse Spark 1.3 Free · 3.9s)

_Thinking:_



Core finding is positive — your API already supports mobile auth. Verifying token delivery before final verdict.

**Tool: grep**

**Input:**
```json
{
  "include": "*.js",
  "path": "E:\\Unideals\\backend\\src\\controllers",
  "pattern": "accessToken|Set-Cookie|cookie.*access|return.*token|json.*token"
}
```

**Output:**
```
Found 9 matches
E:\Unideals\backend\src\controllers\adminAuth.controller.js:
  Line 30:     setAuthCookies(res, session.accessToken, session.refreshToken);

  Line 63:     setAuthCookies(res, session.accessToken, session.refreshToken);


E:\Unideals\backend\src\controllers\auth.controller.js:
  Line 258:     const { accessToken, refreshToken, user } = await loginWithPassword(

  Line 262:     setAuthCookies(res, accessToken, refreshToken);

  Line 434:     const accessToken = await generatedAccessToken(user._id, user.tokenVersion || 0);

  Line 437:     setAuthCookies(res, accessToken, refreshToken);

  Line 512:     const accessToken = await generatedAccessToken(freshUser._id, freshUser.tokenVersion || 0);

  Line 515:     setAuthCookies(res, accessToken, refreshToken);

  Line 666:     setAuthCookies(res, session.accessToken, session.refreshToken);

```

---

## Assistant (Plan · Muse Spark 1.3 Free · 2.5s)

**Tool: read**

**Input:**
```json
{
  "filePath": "E:\\Unideals\\backend\\src\\controllers\\auth.controller.js",
  "limit": 80,
  "offset": 250
}
```

**Output:**
```
<path>E:\Unideals\backend\src\controllers\auth.controller.js</path>
<type>file</type>
<content>
250:       error: true,
251:       success: false,
252:     });
253:   }
254: };
255: 
256: export const loginController = async (req, res) => {
257:   try {
258:     const { accessToken, refreshToken, user } = await loginWithPassword(
259:       req.body,
260:     );
261: 
262:     setAuthCookies(res, accessToken, refreshToken);
263: 
264:     // Tokens travel via HttpOnly cookies only — never in the JSON body,
265:     // where any XSS could exfiltrate the 7-day refresh token.
266:     return res.status(200).json({
267:       message: "Login successfully",
268:       success: true,
269:       error: false,
270:       data: {
271:         user,
272:       },
273:     });
274:   } catch (err) {
275:     return res.status(err.statusCode || 500).json({
276:       message: safeErrorMessage(err, "Login failed"),
277:       success: false,
278:       error: true,
279:       requiresVerification: Boolean(err.requiresVerification),
280:       accountBlocked: Boolean(err.accountBlocked),
281:       accountStatus: err.accountStatus,
282:     });
283:   }
284: };
285: 
286: export const googleAuthRedirectController = async (req, res) => {
287:   try {
288:     // OAuth state binds the callback to this browser (login-CSRF defense).
289:     const state = crypto.randomBytes(16).toString("hex");
290:     res.cookie("oauth_state", state, {
291:       httpOnly: true,
292:       secure: process.env.NODE_ENV === "production",
293:       sameSite: "Lax",
294:       maxAge: 5 * 60 * 1000,
295:       path: "/",
296:     });
297:     const authorizeUrl = oauth2Client.generateAuthUrl({
298:       access_type: "offline",
299:       scope: ["openid", "email", "profile"],
300:       prompt: "select_account",
301:       state,
302:     });
303: 
304:     return res.redirect(authorizeUrl);
305:   } catch (error) {
306:     console.error("Google auth redirect error:", error);
307:     return res.status(500).json({
308:       message: "Unable to start Google authentication",
309:       success: false,
310:       error: true,
311:     });
312:   }
313: };
314: 
315: export const googleAuthCallbackController = async (req, res) => {
316:   try {
317:     const { code, state } = req.query;
318:     if (!code) {
319:       return res.status(400).json({
320:         message: "Google authorization code is missing.",
321:         success: false,
322:         error: true,
323:       });
324:     }
325:     // State must match the cookie set at redirect time — otherwise this
326:     // login was planted by someone else (login CSRF / session fixation).
327:     if (!state || state !== req.cookies?.oauth_state) {
328:       return res.status(403).json({
329:         message: "Google login session mismatch. Please try again.",

(Showing lines 250-329 of 952. Use offset=330 to continue.)
</content>
```

**Tool: grep**

**Input:**
```json
{
  "include": "*.js",
  "path": "E:\\Unideals\\backend\\src\\utils",
  "pattern": "setAuthCookies|cookie.*httpOnly|sameSite|secure"
}
```

**Output:**
```
No files found
```

---

## Assistant (Plan · Muse Spark 1.3 Free · 2.4s)

**Tool: grep**

**Input:**
```json
{
  "include": "*.js",
  "path": "E:\\Unideals\\backend\\src",
  "pattern": "setAuthCookies"
}
```

**Output:**
```
Found 9 matches
E:\Unideals\backend\src\controllers\auth.controller.js:
  Line 19:   setAuthCookies,

  Line 262:     setAuthCookies(res, accessToken, refreshToken);

  Line 437:     setAuthCookies(res, accessToken, refreshToken);

  Line 515:     setAuthCookies(res, accessToken, refreshToken);

  Line 666:     setAuthCookies(res, session.accessToken, session.refreshToken);


E:\Unideals\backend\src\controllers\adminAuth.controller.js:
  Line 8:   setAuthCookies,

  Line 30:     setAuthCookies(res, session.accessToken, session.refreshToken);

  Line 63:     setAuthCookies(res, session.accessToken, session.refreshToken);


E:\Unideals\backend\src\services\auth.service.js:
  Line 32: export const setAuthCookies = (res, accessToken, refreshToken) => {

```

---

## Assistant (Plan · Muse Spark 1.3 Free · 2.6s)

**Tool: read**

**Input:**
```json
{
  "filePath": "E:\\Unideals\\backend\\src\\services\\auth.service.js",
  "limit": 80
}
```

**Output:**
```
<path>E:\Unideals\backend\src\services\auth.service.js</path>
<type>file</type>
<content>
1: import bcrypt from "bcrypt";
2: import jwt from "jsonwebtoken";
3: import userModel from "../models/User.model.js";
4: import { USER_STATUS } from "../config/constants.js";
5: import generatedAccessToken from "../utils/generatedAccessToken.js";
6: import generatedRefreshToken from "../utils/generatedRefreshToken.js";
7: 
8: export const getAuthCookieOptions = () => {
9:   const frontendUrl = process.env.FRONTEND_URL || "";
10:   // Secure cookies are required whenever the frontend is served over https
11:   // (cross-site None cookies are rejected without Secure). Don't rely
12:   // solely on NODE_ENV — a missing NODE_ENV=production on the host would
13:   // otherwise set Lax/non-secure cookies that browsers refuse to send
14:   // cross-site, breaking refresh and logging users out after ~15 minutes.
15:   const frontendIsHttps = frontendUrl
16:     .split(",")
17:     .map((s) => s.trim().toLowerCase())
18:     .some((s) => s.startsWith("https://"));
19:   const secure =
20:     process.env.NODE_ENV === "production" ||
21:     process.env.COOKIE_SECURE === "true" ||
22:     frontendIsHttps;
23: 
24:   return {
25:     httpOnly: true,
26:     secure,
27:     sameSite: secure ? "None" : "Lax",
28:     path: "/",
29:   };
30: };
31: 
32: export const setAuthCookies = (res, accessToken, refreshToken) => {
33:   const baseCookieOptions = getAuthCookieOptions();
34: 
35:   res.cookie("accessToken", accessToken, {
36:     ...baseCookieOptions,
37:     maxAge: 15 * 60 * 1000,
38:   });
39: 
40:   res.cookie("refreshToken", refreshToken, {
41:     ...baseCookieOptions,
42:     maxAge: 7 * 24 * 60 * 60 * 1000,
43:   });
44: };
45: 
46: export const clearAuthCookies = (res) => {
47:   const cookieOptions = getAuthCookieOptions();
48: 
49:   res.clearCookie("accessToken", cookieOptions);
50:   res.clearCookie("refreshToken", cookieOptions);
51: };
52: 
53: export const sanitizeAuthUser = (user) => ({
54:   id: user._id?.toString(),
55:   name: user.name,
56:   email: user.email,
57:   role: user.role,
58:   status: user.status,
59:   avatar: user.avatar,
60:   gender: user.gender ?? null,
61:   genderUpdatedAt: user.genderUpdatedAt ?? null,
62:   campus_id: user.campus_id ?? null,
63: });
64: 
65: // Per-account failed-login throttle (in-memory, no new deps).
66: // Complements the IP-based express-rate-limiters: slows password guessing
67: // against a single account even when spread across IPs.
68: const loginFailures = new Map(); // key: normalized email -> { count, expiresAt }
69: const LOGIN_MAX_FAILS = 5;
70: const LOGIN_WINDOW_MS = 15 * 60 * 1000;
71: 
72: const pruneLoginFailures = () => {
73:   const now = Date.now();
74:   for (const [key, entry] of loginFailures) {
75:     if (!entry || entry.expiresAt <= now) loginFailures.delete(key);
76:   }
77: };
78: 
79: const checkLoginThrottle = (normalizedEmail) => {
80:   const entry = loginFailures.get(normalizedEmail);

(Showing lines 1-80 of 337. Use offset=81 to continue.)
</content>
```

---

## Assistant (Plan · Muse Spark 1.3 Free · 10.1s)

_Thinking:_

Analyzing backend auth flow and CSRF handling, identifying mobile token and Razorpay SDK compatibility gaps.

Short honest answer: **Yes, reuse the same backend — don't build a second one. It's the right and scalable choice for you.**

Your backend is already 80% mobile-ready:

1.  It's a decoupled REST API (`frontend` only talks via `VITE_API_BASE_URL` -> `api.unideals.in`). Expo can call the same `/api/*` routes.
2.  `backend/src/middlewares/auth.middleware.js:10-14` + `optionalAuth` + `backend/src/sockets/index.js:21-24` already accept `Authorization: Bearer <token>` — not just cookies. Socket.io also accepts `auth.token`.
3.  `backend/src/middlewares/csrf.middleware.js:27` passes non-browser clients (no `Origin` = mobile), so mutations won't be blocked.
4.  Business logic — products, wishlist, pickup-spots, boost quotas, Razorpay `orders/verify/webhook`, ImageKit signed tokens, chat/conversations — is all client-agnostic.

### But 1 blocker you must fix, no way around it:

`backend/src/controllers/auth.controller.js:262-273` + `backend/src/services/auth.service.js:32-44`:

> Tokens travel via HttpOnly cookies **only — never in JSON body**.

Browsers handle that automatically (`axiosInstance.js:11 withCredentials:true`). React Native / Expo does **not** — no cookie jar, no auto-refresh.

You need a small backend addition, not a rewrite:

* `POST /api/auth/login`, `/refresh-token`, `/google/one-tap|exchange` return `{ accessToken, refreshToken }` in JSON **when** `x-client-type: mobile` header is sent (keep cookie-only for web for XSS safety).
* Mobile stores: accessToken in memory, refreshToken in `expo-secure-store`, sends `Bearer` header + auto-refresh interceptor.
* `verifyOrigin` + CORS: allow no-Origin mobile, keep web allowlist.

### 4 other web-only things that won't work as-is in Expo:

1.  **Razorpay Checkout.js** (web lazy-load) -> use `razorpay-react-native` / native SDK. Good news: your `/api/payments/orders` + `/verify` already compute amounts server-side, fully reusable.
2.  **Google One-Tap / redirect** (`/google`, `/google/callback`) -> use `expo-auth-session` + existing `/google/one-tap` exchange, or `@react-native-google-signin`.
3.  **ImageKit JS SDK + `browser-image-compression`** -> use `expo-image-picker` + `expo-image-manipulator` + backend `/api/imagekit/auth` token, upload via fetch FormData.
4.  **Push:** Web has no FCM. App will need `expo-notifications` + new `pushToken` field on User + extend existing notification system.

### Is it scalable?

Yes for your stage, with caveats:

* Stateless JWT (15min + rotating 7-day) + MongoDB Atlas + Render + CDN media = horizontally scalable pattern. One API for web + Android + iOS is *more* scalable than two backends.
* Limits to know later (not now): Socket.io is in-memory (`initSockets` in `server.js:30`) — will need Redis adapter when you run >1 Render instance. Cron jobs (`cleanupDeletedProducts`, `expireBoosts`, etc.) are in-process — will duplicate on multi-instance. Neither blocks an MVP app.

**Proposal if you say yes:** Keep `backend/` as single source of truth, add `mobile/` client-type branch for auth, add Expo app in `mobile/` (`expo-router` + axios + SecureStore + Socket.io-client + Razorpay native + expo-auth-session), zero changes to web flow.

Want me to plan for:
1. Same feature parity as web, or MVP subset (auth + feed + listing + chat + payments) first?
2. iOS + Android both, or Android first?
3. Stay on Razorpay for app, or also need Play Billing / App Store IAP (mandatory for digital goods)?


---

## User

So now i will assign some other team member from my team on the frontend work of the app. So now first tell me should a create a seperate repo for the frontend code of the app and the backend will be here in this repo only is that approach fine ??

---

## Assistant (Plan · Muse Spark 1.3 Free · 15.6s)

_Thinking:_

Evaluating monorepo versus separate repo tradeoffs for backend and Expo frontend collaboration and CI/CD setup.

Yes — that approach is fine, and for your case it's the **recommended** one:

**Keep this repo as `Unideals` (web `frontend/` + shared `backend/`), create new repo `Unideals-App` (Expo) for your teammate.**

Why separate is better here:

1.  **Different release cadence:** Web deploys via Vercel on every push. App deploys via EAS Build / OTA + Play Store review. You don't want an app UI commit triggering web redeploys and vice-versa.
2.  **Team autonomy / safety:** Your app dev only needs read access to this repo's API, write access to app repo. Zero risk they accidentally break `backend/src/services/auth.service.js` or web frontend.
3.  **Expo works cleaner standalone:** EAS wants app root at repo root (`app.json`, `eas.json`). In a monorepo you'd fight with `frontend/` paths, hooks, and CI.
4.  **Scalable:** One backend serving N clients is standard. Repo split doesn't affect runtime scalability.

Keep this in mind to avoid pain later:

* Backend stays source of truth. Never fork it for mobile. App calls same `https://api.unideals.in/api/*`.
* Freeze API contract: don't rename fields without versioning. Add `GET /health` check in app repo CI.
* In new repo, copy only: `VITE_API_BASE_URL` -> `EXPO_PUBLIC_API_BASE_URL`, axios + Bearer refresh logic (not cookie logic), Zod shapes if needed.
* Give app dev: staging backend URL, test user, Razorpay test keys, ImageKit `auth` flow doc, Socket.io `auth.token` example from `backend/src/sockets/index.js`.
* Don't share code via npm yet — overkill. Just duplicate the thin API client for now. Extract shared `api-contract` package only when you have 3+ clients breaking often.

Only choose monorepo `mobile/` folder if: team is 2-3 people, you want atomic web+app+backend PRs, and shared TypeScript types day-1. You lose that, but you gain speed and isolation — worth it when handing off to another member.

Want me to draft the `Unideals-App` repo scaffold + README + `.env.sample` + branch rules for your teammate so both repos stay in sync?

---

## User

So now first tell me the detailed tech stack for this app, so that every feature that we have made in the website should work exactly the same way as it should be working. like starting from the auth Google auth to the end everything so give me the deatiled tech stack 

---

## Assistant (Plan · Muse Spark 1.3 Free · 164.6s)

_Thinking:_



Mapping every website feature to its Expo equivalent — researching full parity stack.

**Tool: task**

**Input:**
```json
{
  "description": "Explore frontend features",
  "prompt": "Explore the frontend codebase at E:\\Unideals\\frontend\\src to list ALL user-facing features, screens, and third-party libraries used. Check: app routes (app/ or Routes), features/ folders (auth, product, user, payment, search, chat, notification, legal, handoff, campus, badges/rewards, deals/orders), context/, services/, utils/, package.json dependencies. Return: 1) full screen/route list 2) per-feature libraries used (e.g. Razorpay Checkout.js, Google One-Tap, ImageKit, Socket.io-client, react-qr-code, EmailJS, Framer Motion, Swiper, Radix, etc.) 3) auth flow details (cookies, refresh, Google OAuth/One-Tap). Be thorough, return structured list.",
  "subagent_type": "explore"
}
```

**Output:**
```
<task id="ses_eca092a58ffeAdDAHn6HgWrTWM" state="completed">
<task_result>
# Unideals Frontend Audit — `E:\Unideals\frontend\src` (151 files)

Stack: `Vite 6 + React 18.3 + react-router-dom 7 + Tailwind 3.4 + axios 1.14`. Providers in `app/main.jsx`: `BrowserRouter > ThemeProvider > GirlsModeProvider > UserProvider > CampusProvider > WishlistProvider > App`. Interceptor imported once in `main.jsx`. Lazy route-splitting with `BrandLoader` fallback in `app/routes.jsx`.

## 1) Full Screen / Route List

### Auth — `PublicOnlyRoute` (no Header, logged-in → `/`)
| Route | File | Purpose |
|---|---|---|
| `/login` | `features/auth/pages/Login.jsx` | Email+password + Google button, `?oauth_code` / `?oauth=success` callback handling |
| `/signup` | `features/auth/pages/Signup.jsx` | Name/email/password+confirm, `PasswordStrengthMeter`, `LegalAgreementModal` consent `v1.0` → `/checkEmail` |
| `/forgot-password` | `features/auth/pages/ForgotPassword.jsx` | Request reset link |
| `/reset-password/:token` | `features/auth/pages/ResetPassword.jsx` | Verify token `GET /reset-password/:token`, set new password |
| `/verify-email` | `features/auth/pages/VerifyEmail.jsx` | Token verification landing |
| `/checkEmail` | `features/auth/pages/CheckEmail.jsx` | Post-signup “check inbox”, resend, `check-verification` poll |

### Public with `MainLayout` (Header+Footer w/ exceptions)
| Route | File |
|---|---|
| `/` | `features/product/pages/Home.jsx` — hero, boosted carousel, category grid, 8+8 feed, Girls-Corner tab `?tab=girls`, One-Tap, `FirstListingCelebration` |
| `/search` | `features/search/pages/SearchResults.jsx` — filters, sort, `PriceRangeSlider`, trending empty-state |
| `/product/:id` | `features/product/pages/ProductDescription.jsx` — gallery+`ImageLightbox`, `ShareButton`, seller card, chat CTA |
| `/category/:categoryName` | `features/product/pages/ProductCategory.jsx` |
| `/explore` | `features/product/pages/Explore.jsx` — infinite full feed |
| `/price` | `features/product/pages/PricingModel.jsx` — plan comparison + Razorpay upgrade |
| `/termscondition` | `features/user/pages/Termscondition.jsx` |
| `/privacy-policy` | `features/legal/pages/PrivacyPolicy.jsx` + `features/legal/components/LegalDocuments.jsx` |
| `/contact` | `features/user/pages/ContactUs.jsx` — FAQ + contact/report/suggest forms |

### Protected with `ProtectedLayout + MainLayout` (guest → `/login` w/ `state.from`)
| Route | File |
|---|---|
| `/profile` (+ redirect `/profileoverview`→`/profile`) | `features/user/pages/ProfileOverview.jsx` — avatar, stats, listings, `BadgeMiniStrip` |
| `/subscription` | `features/user/pages/Subscription.jsx` — tier/usage/history, Razorpay checkout |
| `/settings` (+ `/setting`→`/settings`) | `features/user/pages/Settings.jsx` — profile, campus select, gender change request, avatar, pickup-spots CRUD, `SecuritySettings`, `ChatSettings`, logout, delete |
| `/wishlist` | `features/user/pages/Wishlist.jsx` |
| `/achievements` (+ `/badge`→`/achievements`) | `features/user/pages/Achievements.jsx` — `LevelCard`, `BadgeCard`, `RankGuideModal`, leaderboard, rewards wallet |
| `/myorders` | `features/user/pages/Myorders.jsx` — role/status tabs, `OrderDealCard`, socket live update |
| `/chat` (`?conversation=` deep-link) | `features/chat/pages/Chat.jsx` — list + thread, offers, deal progress, pickup, report |
| `/notification` | `features/notification/pages/Notification.jsx` |
| `/upload`, `/upload/:productId` | `features/product/pages/ProductListing.jsx` — 4-step wizard (`BasicInfoStep`, `ImagesStep`+`PhoneHandoffCard`, `PricingStep`, `PreviewStep`), drafts |
| `/productlisted` | `features/product/pages/ProductListed.jsx` — success receipt |

### Special / System
| Route | File |
|---|---|
| `/p/:code?k=&max=&used=` | `features/handoff/pages/PhoneUpload.jsx` — public, no layout, QR-secret auth |
| `*` | `components/NotFound.jsx` + `components/Seo.jsx` |
| Gates (not routes) | `features/campus/components/CampusGate.jsx`, `features/user/components/GenderGate.jsx` rendered by `MainLayout.jsx` when `needsGate` / `gender==null` |

---

## 2) Features × Libraries Used

**`package.json` deps:** `axios`, `socket.io-client 4.8`, `@imagekit/javascript 5.3`, `react-qr-code 2.2`, `@emailjs/browser 4.4`, `framer-motion 12.40`, `canvas-confetti 1.9` (lazy), `browser-image-compression 2.0` (lazy), `react-select 5.10` (lazy), `lucide-react`, `react-icons`, `@heroicons/react` (installed, ~unused), `@animateicons/react`, `radix-ui` + `@radix-ui/react-alert-dialog` + `@radix-ui/colors` (+ `@radix-ui/react-dialog` via `radix-ui` meta), `clsx`, `react-router-dom 7`, `react-toastify 11` + `react-spinners 0.15` (installed but **unused** — replaced by custom `ui/Toast.jsx`+`toast.js` and `ui/BrandLoader.jsx`). No `Swiper` dep (only leftover `.swiper-pagination` CSS in `styles/index.css`); `PriceRangeSlider` is dependency-free.

| Feature | Screens / Components | Third-party |
|---|---|---|
| **auth** | `Login/Signup/Forgot/Reset/Verify/CheckEmail`, `signinWithGoogle.jsx` (redirect `window.location.href=getGoogleAuthUrl()`), `LegalAgreementModal`, `PasswordStrengthMeter`, `utils/passwordStrength.js` | `axios`, `lucide-react`, `react-router-dom`, **Google GSI raw script** `https://accounts.google.com/gsi/client` + `window.google.accounts.id` (no `@react-oauth/google`), custom toast |
| **product / explore / category / description** | `Home/Explore/ProductCategory/ProductDescription`, `ProductCard/Category/CategoryIcon/ProductGallery/ImageLightbox/GirlsTabs/ListingLayout`, `constants/categories|listingOptions|productOptions`, `copy/girlsCorner.copy.js`, `hooks/useDebounce|useProductListing`, `context/ProductListingContext` | `axios`, `framer-motion` (hero `RevealWords`, carousels), `react-icons/fi|fa|fa6|io|io5|bs|gr|md`, `lucide-react`, `@animateicons/react`, `ImageKit URL transforms` (`utils/imageTransform.js`), custom `Seo`, `ShareButton` (Web Share API + clipboard fallback) |
| **product listing wizard** | `ProductListing + steps/BasicInfo|Images|Pricing|Preview + stepper/Stepper`, `VisibilitySelector/Unlist/Relist/DeleteProductModal`, `validations/*`, `utils/draftStorage|imageCompression|imageHelpers`, `services/uploadService.js`, `utils/imageUpload.js` | `axios`, `browser-image-compression` (pre-upload), `@imagekit/javascript: upload()` with `/api/imagekit/auth` signature, `react-select` **lazy** (`BasicInfoStep`), `react-qr-code` **lazy** (`PhoneHandoffCard`), `framer-motion`, `lucide/react-icons`, `LimitModal` upgrade prompt |
| **search** | `SearchResults`, `SearchDropdown` (header), `hooks/useDebounce`, `api/searchApi.js` (`/search`, `/search-suggestions`, `/trending`) | `axios` + `AbortSignal`, no external search lib |
| **chat + deals** | `Chat.jsx`, `ChatCard/ConversationCard/MessageBubble/DealProgress/ReportUserModal`, `hooks/useChatSocket.js`, `services/chatApi.js` (`/api/conversations`, offers/confirm/pickup/payment-confirm/item-received/cancel`), `utils/chatTheme|dealStage|display|wallpapers` | `socket.io-client` (`io(socketURL,{withCredentials:true, transports:[websocket,polling]})`, events `message:new/delivered/read`, `deal:updated`, `typing`, `presence:update`, `conversation:updated`, `join/leave_conversation`), `axios`, `lucide-react` |
| **payment / subscription / boost** | `payment/api/paymentApi.js` (`/api/payments/orders|verify|me`), `payment/hooks/useRazorpayCheckout.js`, `Subscription.jsx`, `PricingModel.jsx`, `OrderCard.jsx` boost buy | **Razorpay Checkout.js** `https://checkout.razorpay.com/v1/checkout.js` lazy-loaded (singleton `scriptPromise`, in-flight guard, `VITE_RAZORPAY_KEY_ID`, `UPI+card+netbanking` block config, `image:https://app.unideals.in/logo.svg`), `axios`, `lucide/react-icons` |
| **user / profile / settings** | `ProfileOverview/Settings/Wishlist/Myorders/Subscription/ContactUs/Termscondition`, `Profile_left_part/editbutton/Deletebutton/SecuritySettings/ChatSettings/PickupSpotModal/GenderGate`, `api/userApi.js` (`userProfile/updateProfile/genderChange/chatSettings/avatar/pickup-spots`) | `axios`, `framer-motion`, `lucide/react-icons`, `@animateicons/react/lucide+huge`, `@radix-ui/react-dialog` (`SecuritySettings` modal) + `AlertDialog` (`Deletebutton`), `ImageKit` avatar upload (`Settings.jsx`) |
| **wishlist** | `Wishlist.jsx`, `context/WishlistContext.jsx` (`GET /api/wishlist`, `POST /toggle|/remove`, optimistic + refetch rollback) | `axios`, `react-router-dom` only |
| **notification** | `Notification.jsx`, `api/notificationApi.js` (`GET /`, `PATCH /:id/read`, `PATCH /read-all`, `POST /:id/click`), `data/notifications.js`, `Header` bell | `socket.io-client` (header + page + `Myorders` realtime), `axios`, `lucide-react` (`MessageSquare/Package/Tag`) |
| **badges / rewards / orders** | `Achievements.jsx`, `BadgeCard/BadgeMiniStrip/LevelCard/RankGuideModal`, `MyOrdersCard/OrderCard/OrderDealCard/manageorderanime`, `api/badgeApi.js` (`/api/badges/me|/compute|/leaderboard`, `/api/rewards/me`), `api/ordersApi.js` (`/api/orders?role&status`, `POST /conversations/:id/cancel`), `utils/badgeConfig.js` | `axios`, `socket.io-client` (`Myorders.jsx` live), `useRazorpayCheckout` (boost from `OrderCard`), `lucide/react-icons`, `canvas-confetti` **lazy** (`FirstListingCelebration`) |
| **campus** | `CampusGate.jsx`, `api/campusApi.js` (`GET /api/campuses`, `PUT /api/user/updateProfile {campus_slug}`), `context/CampusContext.jsx` (`vit-vellore` flagship default, `unideals_guest_campus_slug`) | `axios`, `framer-motion`, `react-icons/gr`, `lucide-react` |
| **handoff (phone photos)** | `PhoneUpload.jsx`, `PhoneHandoffCard.jsx`, `api/handoffApi.js` (`POST /api/handoff`, `GET /:code`, `POST /:code/photos` multipart `photos` + `x-handoff-secret`) | `react-qr-code` **lazy** (`LazyQRCode value=session.url`), `browser-image-compression` **dynamic `import()`** on phone, `axios` + `onUploadProgress`, `react-icons/md` |
| **legal** | `PrivacyPolicy.jsx`, `LegalDocuments.jsx`, `auth/.../LegalAgreementModal.jsx` | `react-icons/fi`, no legal lib |
| **support / contact** | `ContactUs.jsx` FAQ + 3 forms | `@emailjs/browser` **dynamic `import()`** (`emailjs.send(SERVICE_ID,TEMPLATE_ID,params,PUBLIC_KEY)` via `VITE_EMAILJS_*`, 30s `sessionStorage` rate-limit) + `axios POST /api/report/support` (admin queue), `framer-motion`, `lucide-react` |
| **shell / UX** | `layouts/MainLayout|ProtectedLayout|PublicOnlyRoute`, `layout/Header|Footer`, `ui/ThemeToggle|GirlsToggle|Wordmark|Toast|StatsPanel|LimitModal|PriceRangeSlider|BrandLoader`, `common/Avatar|ShareButton`, `context/Theme|GirlsMode|useUser|Wishlist|Campus`, `services/axiosInstance|authInterceptor`, `hooks/useSafeTimeout`, `utils/cn|imageTransform|imageUpload`, `styles/index.css` | `framer-motion` (all reveals, View-Transitions circular reveal `startViewTransition+flushSync`), `clsx` (`cn.js`), `axios`, `tailwindcss`; `Toast`/`BrandLoader` custom (not `react-toastify`/`react-spinners`) |

## 3) Auth Flow Details

* **Cookie-first, no Bearer:** `services/axiosInstance.js` → `axios.create({baseURL:VITE_API_BASE_URL, withCredentials:true, timeout:30s})`. Request interceptor sets nothing. `useUserContext.jsx` migrates/deletes legacy `localStorage.accessToken`. Only `isAuthenticated==="true"` flag + `cachedUserDetails` (non-sensitive profile cache) in `localStorage`.
* **Endpoints (`features/auth/api/authApi.js`, base `/api/auth`):** `POST /login`, `POST /register` (+`acceptedLegal/legalVersion/legalAcceptedAt`), `POST /refresh-token`, `POST /google/exchange {code}`, `POST /google/one-tap {credential}`, `POST /logoutUser` (POST-only anti-CSRF), `POST /forgot-password|/verify-email|/resend-verification`, `GET /check-verification?email=`, `GET|POST /reset-password/:token`.
* **Google OAuth (redirect):** `signinWithGoogle.jsx → getGoogleAuthUrl() (${BASE}/api/auth/google) → window.location.href`. Return handled in `Login.jsx`: `?oauth_code=` → `exchangeGoogleOAuthCode()`; `?oauth=success|?auth=success` → `fetchUserProfile({force:true})`. URL params stripped via `history.replaceState`. Sets `isAuthenticated`, `fetchUserProfile`, `navigate(returnTo)`.
* **Google One-Tap (guests, `Home.jsx`):** Only when `!isLoggedIn && !userLoading && VITE_GOOGLE_CLIENT_ID`, once per session (`sessionStorage.homeGoogleLoginTriggered`). Injects `https://accounts.google.com/gsi/client` (`google-identity-services-script`), `google.accounts.id.initialize({client_id, callback, context:signin, cancel_on_tap_outside, itp_support})` → `prompt()`. Callback → `loginWithGoogleOneTap({credential})` → cookies → `isAuthenticated` → `fetchUserProfile({force:true})`. `cancel()` on unmount.
* **Session bootstrap:** `UserProvider` hydrates cache synchronously, then one `_silentProbe: GET /api/user/userProfile` (cookie-only, recovers after cache clear). `loading` gates `ProtectedLayout/PublicOnlyRoute`. Cross-tab `storage` listener clears all tabs on logout. Keep-alive: when `isLoggedIn`, `setTimeout(keepAlive,14min)` (~1min before 15min access expiry) calls `refreshToken()`; activity/focus resets; failures swallowed.
* **Refresh (`services/authInterceptor.js`, single-flight):** On `401` (not `_retry`): skip if `isAuthEndpoint(/login|register|refresh-token|google|verify-email|forgot-password|reset-password|resend-verification|check-verification)` (wrong-password ≠ dead session), skip if `x-handoff-secret` present (QR capability, phone has no cookies), skip if no `response` / `429`. Else queue subscribers, `axios.post(getRefreshTokenUrl(),{},{withCredentials:true})` → replay. `403+accountBlocked` → `clearStoredAuth()` + `unideals:account-blocked`. Refresh `401` → `clearStoredAuth()` + `unideals:session-expired` unless `_silentProbe`. Only refresh-`401` kills session; `429/5xx`/network keeps cache for retry.
* **App-level (`app/App.jsx`):** Listens `unideals:account-blocked` → `clearUserData()+toast+navigate(/login)`; `unideals:session-expired` → `clearUserData()`, silent for never-logged-in guests, toast+redirect only if `PROTECTED_PREFIXES` (`/profile,/subscription,/settings,/wishlist,/achievements,/badge,/myorders,/chat,/notification,/upload,/productlisted`).
* **Guards:** `ProtectedLayout` requires `isLoggedIn && userDetails._id` else `<Navigate to=/login state={{from:location}}>`. `Login/Signup` honor `location.state.from` (`getReturnTo()`). `PublicOnlyRoute` bounces authed users `/login|/signup|...` → `/`. `MainLayout` then enforces `CampusGate` (logged-in `campus_id==null`, guests browse `vit-vellore` free) → `GenderGate` (`gender==null/""`), footer hidden on `/chat,/profile,/notification,/myorders,/productlisted,/settings,/contact,/wishlist,/termscondition,/subscription,/achievements`.

</task_result>
</task>
```

**Tool: task**

**Input:**
```json
{
  "description": "Explore backend APIs",
  "prompt": "Explore the backend codebase at E:\\Unideals\\backend\\src to list ALL API domains, auth mechanism, realtime, payments, media, jobs. Check: src/routes/*.js, src/controllers/*.js, src/services/auth.service.js (cookie vs Bearer), src/middlewares/auth.middleware.js + csrf.middleware.js, src/sockets/index.js, src/jobs/, package.json. Return: 1) all route prefixes and key endpoints 2) how auth tokens are issued/validated (cookie-only? Bearer supported?) 3) Socket.io auth method 4) Razorpay/ImageKit/Google/Resend/Email usage 5) cron jobs. Structured list, concise.",
  "subagent_type": "explore"
}
```

**Output:**
```
<task id="ses_eca092a1bffea7vlOfE4DMPWSg" state="completed">
<task_result>
**Backend: `E:\Unideals\backend\src` — Express5 ESM + `package.json`: `express,cors,cookie-parser,helmet,rate-limit,mongoose,jsonwebtoken,bcrypt,socket.io,socket.io-client,razorpay,imagekit,google-auth-library,resend,node-cron,multer,nanoid,zod,xss,compression`**

### 1) All Route Prefixes (`src/app.js` + `src/routes/*.js`)

| Prefix | File | Key endpoints |
|---|---|---|
| `GET /health` | `app.js` | `{status:OK}` |
| `/api/auth` | `auth.routes.js` | `POST /register,/login,/verify-email,/resend-verification,/forgot-password,/reset-password/:token, /refresh-token, /logoutUser[POST+optionalAuth], GET /google,/google/callback,/check-verification,/reset-password/:token, POST /google/exchange,/google/one-tap` |
| `/api/user` | `user.routes.js` | `GET /userProfile,/genderChangeStatus, PUT /updateProfile,/chatSettings[x2],/updateAvatar, POST /requestGenderChange, DELETE /removeAvatar,/deleteAccount[3/hr+pwd]` |
| `/api/product` | `product.routes.js` | `GET /[feed],/:id[detail],/boosted,/search,/search-suggestions,/trending,/user/my-products,/user/drafts (public=optionalAuth), POST /, PATCH /:id,/:id/unlist,/relist,/sold, DELETE /:id` |
| `/api/report` | `report.routes.js` | `POST /product/:productId[auth],/user/:userId[auth],/support[custom optionalAuth=Bearer-only]` |
| `/api/pickup-spots` | `pickupSpot.routes.js` | `router.use(auth): GET /,POST /,PUT /:pickupSpotId,DELETE /:pickupSpotId,PATCH /:pickupSpotId/primary` |
| `/api/imagekit` | `imagekit.routes.js` | `GET /auth[auth], DELETE /file[auth],DELETE /:fileId[auth]` |
| `/api/wishlist` | `wishlist.routes.js` | `router.use(auth): GET /,POST /add,/remove,/toggle,GET /check/:productId` |
| `/api/campuses` | `campus.routes.js` | `GET /[public, no auth]` |
| `/api/admin` | `admin.routes.js` | `POST /auth/login,/auth/refresh-token, GET /auth/me[auth+ADMIN/SUPPORT],POST /auth/logout, GET /dashboard,/moderation/queue,/users,/users/stats,/users/:id,/products,/products/:id,/orders,/orders/stats,/orders/:id,/reports,/campuses,/audit-log,/notifications/*, POST /moderation/dismiss,/resolve,/campuses,/notifications, PATCH /users/:id/status|role,/gender-requests/:id,/products/:id/status|soft-delete,/orders/:id/status,/reports/:id,/campuses/:id,/notifications/:id/cancel, DELETE /products/:id,/campuses/:id` |
| `/api/boost` | `boost.routes.js` | `GET /me/summary, POST /products/:productId` |
| `/api/payments` | `payment.routes.js` (`app.js` mounts webhook separately) | `POST /orders,/verify[auth], GET /me, POST /webhook[no-auth,raw-body+HMAC,100/min]` |
| `/api/badges` | `badgeRoutes.js` | `GET /config[public],/me[auth],/leaderboard[auth], POST /compute[auth,5/hr]` |
| `/api/rewards` | `rewardRoutes.js` | `GET /me[auth]` |
| `/api/handoff` | `handoff.routes.js` | `POST /[auth,multer memory 10MB max 3x png/jpg/webp], GET /:code[auth], POST /:code/photos[no-auth,QR-secret in controller]` |
| `/api/conversations` | `conversation.route.js` (+ stub `message.route.js` empty) | `GET /,POST /[conv], GET /:id, PATCH /:id/read, GET\|POST /:id/messages, GET /:id/deal, POST /:id/offers,/:id/offers/respond,/:id/confirm,/:id/pickup,/:id/payment-confirm,/:id/item-received,/:id/cancel` |
| `/api/deals` | `deal.route.js` | `GET /pending-followups[auth] only` |
| `/api/orders` | `order.routes.js` | `GET /[auth, Deal-backed feed]` |
| `/api/notifications` | `notification.routes.js` | `router.use(auth): GET /, PATCH /read-all,/:id/read, POST /:id/click` |
| Dead/empty | `support.routes.js,review.routes.js` (0 bytes), `message.route.js` (empty router) | No endpoints; legacy only |

Global: `verifyOrigin` before all `/api/*`, `trust proxy:1`, `CORS{credentials:true}`, `express.json 10kb`, `cookieParser`, per-route `express-rate-limit`.

### 2) Auth Tokens — Cookie-first, Bearer-supported

* Issue: `utils/generatedAccessToken.js {id,v} HS256 15m SECRET_KEY_ACCESS_TOKEN`; `utils/generatedRefreshToken.js {id,v} HS256 7d SECRET_KEY_REFRESH_TOKEN + DB store `refresh_token` + `refresh_token_prev/expires_at` (60s grace for multi-tab)`.
* Deliver: `services/auth.service.js#setAuthCookies(res,access,refresh)` → `httpOnly, Secure=(NODE_ENV=prod||COOKIE_SECURE||FRONTEND_URL https), SameSite=None| Lax, path=/, maxAge 15m/7d`. `loginController/googleOneTap/exchange/refresh` return only `{user}` — comment: never tokens in JSON (XSS). `clearAuthCookies` on 401-refresh/logout. `tokenVersion` bump on logout/reset/suspend/delete revokes all; legacy no-`v` rejected.
* Validate: `middlewares/auth.middleware.js#auth` + `optionalAuth`: `req.cookies.accessToken ?? Authorization: Bearer <t>` → `jwt.verify HS256` → `User.findById -password -refresh_token` → check `v===tokenVersion`, `status==ACTIVE`, `is_email_verified` (strict `auth` only; `optionalAuth` falls through as guest).
* CSRF: `middlewares/csrf.middleware.js#verifyOrigin`: only `POST/PUT/PATCH/DELETE`, exempt `/api/payments/webhook`, pass if no `Origin/Referer` (curl/Postman) or same-host, else must match `FRONTEND_URL,ADMIN_FRONTEND_URL` (fail-open if unconfigured).

### 3) Socket.io Auth (`sockets/index.js` + `chat/deal/location.socket.js`, `utils/socket.js`)

* `initSockets(httpServer){cors:{origin:[FRONTEND_URL,localhost:5173],credentials:true}, transports:[websocket,polling]}` + `io.use(authSocket)`.
* `authSocket`: `token = handshake.auth.token || headers.authorization.replace(Bearer ) || parseCookies(headers.cookie).accessToken` → `jwt.verify(SECRET_KEY_ACCESS_TOKEN,HS256)` → require `id+v:number` → `User{_id,status,tokenVersion,campus_id}` must be `ACTIVE + tokenVersion==v` else `Unauthorized`.
* On connect: `join(user:{userId}, broadcast:all, campus:{campusId})`; `join_conversation` verifies `buyer_id/seller_id` via Mongoose then `join(conversation:{id})` + `presence:update`; `typing` relay throttled 900ms; `disconnecting/disconnect` presence cleanup.

### 4) External Services

* **Razorpay:** `utils/razorpay.js#getRazorpay()/getRazorpayPublicKey()` (`razorpay` SDK); `services/payment.service.js#createOrder(plan,productId)` (`orders.create`, reuse unpaid 15m), `verifyPayment(orderId,paymentId,signature)` (`orders.fetch+payments.fetch` + HMAC), `verifyWebhookSignature(rawBody,x-razorpay-signature)/handleWebhookEvent`; `controllers/payment.controller.js#paymentWebhook` uses `express.raw(1mb)` in `app.js`.
* **ImageKit:** `imagekit` SDK. `controllers/imagekit.controller.js#getAuthParams[auth]` → `getAuthenticationParameters(undefined, now+5m)` + `{folder:unideals/{userId}}` (dashboard restricts to `unideals/*`); `deleteFile(fileId regex ^[A-Za-z0-9_\-/]+$)`; `utils/imagekit.js#uploadImageBuffer/deleteImage/getFileDetails` used by `handoff.service(product photos)`, `product/user/admin.product` cleanup, `jobs/cleanupDeletedProducts` (best-effort `Promise.allSettled`).
* **Google:** `google-auth-library OAuth2Client(GOOGLE_CLIENT_ID/SECRET/REDIRECT_URI)` in `controllers/auth.controller.js`: `GET /google` sets `oauth_state[Lax 5m]` → `generateAuthUrl(openid email profile)`; `GET /google/callback?code&state` verifies state, `getToken→verifyIdToken→findOrCreateGoogleUser(email_verified, lh*.googleusercontent avatar only)` → single-use `oauth_login_token[sha256,2m]` → redirect `{FRONTEND}/login?oauth_code=`; `POST /google/exchange` atomic `findOneAndUpdate` consume; `POST /google/one-tap{credential}` direct `verifyIdToken`.
* **Resend/Email:** `config/sendEmail.js: new Resend(RESEND_API_KEY).emails.send({from:Unideals <onboarding@unideals.in>, reply_to:imaginum.org@gmail.com})` used for `verifyEmailTemplate, forgotPaswordTemplate, password-changed notify`; per-email 3/hr in-memory throttle + generic 200 anti-enumeration in `auth.controller`.

### 5) Cron Jobs (`src/jobs/` via `node-cron`)

* `expireBoosts.job.js#scheduleExpireBoosts`: `*/10 * * * *` → `boost.service.expireStaleBoosts()`.
* `expireSubscriptions.job.js#scheduleExpireSubscriptions`: `0 3 * * *` → `expireDueSubscriptions()` (Free downgrade, skip lifetime); `15 3 * * *` → `Payment CREATED>24h → EXPIRED`.
* `cleanupDeletedProducts.job.js#scheduleCleanupDeletedProducts`: `0 2 * * *` → hard-delete `is_deleted` (`sold+15d` else `30d`) + ImageKit + wishlist/report cleanup + orphan (seller-gone) sweep; `30 2 * * *` → `status=draft+30d` purge.
* `dispatchScheduledNotifications.job.js#scheduleDispatchNotifications`: `* * * * *` → `dispatchDueScheduledNotifications()`.
* Non-cron helpers: `autoUnlistInvalidGirlsListings.job.js#autoUnlistInvalidGirlsListings()` (no `schedule`, called manually/nightly elsewhere — unlists `isGirlsOnly+listed` if seller `gender!=female`); `cleanupDeals.job.js` empty.

</task_result>
</task>
```

---

## Assistant (Plan · Muse Spark 1.3 Free · 16.1s)

_Thinking:_

Evaluating Expo stack options for web parity, balancing Context vs Zustand with TanStack Query and secure auth storage.

_Thinking:_

Mapping Expo library replacements for OAuth, payments, media, realtime, QR, notifications, and UI components.

For 1:1 parity with `frontend/` + `backend/src`, use this stack — same backend, no fork:

### Core

* **Expo SDK 52+ + React Native + `expo-router` (TypeScript)** — replaces `Vite + React 18 + react-router-dom 7`. File routes mirror web: `/(auth)/login,signup,forgot,reset/[token],verify-email` / `/(tabs)/home,search,upload,chat,wishlist,profile` / `/product/[id],category/[name],subscription,settings,achievements,myorders,notification,contact`.
* **NativeWind 4 (Tailwind for RN)** — reuses your `Tailwind 3` classes. `clsx` stays.
* **Data: `axios + @tanstack/react-query + zustand`** — replaces `axios + Context only`. Keep `User/Campus/Wishlist/Theme/GirlsMode` contexts as zustand stores, server lists via Query (feed, search, chat, notifications).
* **Auth storage: `expo-secure-store` (tokens) + `@react-native-async-storage/async-storage` (guest campus, cached profile, drafts)** — replaces `HttpOnly cookies + localStorage + withCredentials:true`.

### Feature-by-feature mapping

| Web today | App replacement |
|---|---|
| Auth email/pass, verify, `forgot/reset`, `check-verification` poll | Same `/api/auth/*` via axios. No cookies — needs backend to return `{accessToken,refreshToken}` on `x-client-type: mobile` (today `auth.controller.js:266` is cookie-only). Store refresh in SecureStore, access in memory, single-flight refresh interceptor like `authInterceptor.js`. Deep-link `expo-linking` for `/verify-email?token=`, `/reset-password/:token`. |
| Google redirect (`/google` -> `?oauth_code` -> `/exchange`) + GSI One-Tap script | `expo-auth-session + expo-web-browser` for redirect flow + `@react-native-google-signin/google-signin` for native One-Tap. Reuse `POST /google/exchange`, `POST /google/one-tap {credential/idToken}`. No `window.google.accounts.id`. |
| Feed, search, suggestions, trending, boosted, category, detail | Same `GET /api/product/*`, `/search-suggestions`, `/trending`, `/boosted` + `optionalAuth` Bearer. UI: `@shopify/flash-list` (replaces 8+8 feed + infinite `Explore`), `expo-image` + `utils/imageTransform.js` URL params (replaces `ProductGallery/ImageLightbox`), `react-native-image-viewing` lightbox. Share via `react-native Share` (replaces Web Share + clipboard). |
| 4-step listing wizard + drafts + `browser-image-compression` + `@imagekit/javascript` + `react-qr-code` handoff | `expo-image-picker + expo-image-manipulator` (compress) + `expo-file-system` upload with `GET /api/imagekit/auth` signature (same backend). `react-hook-form + zod` (backend already Zod). Dropdown: `react-native-element-dropdown` (replaces `react-select`). QR display: `react-native-qrcode-svg` (replaces `react-qr-code`). Keep `/p/:code` handoff upload working via in-app browser. |
| Chat + deals/offers/pickup + `socket.io-client` | Same lib `socket.io-client` works in RN. Auth via `handshake.auth.token = accessToken` (already supported in `sockets/index.js:21`). Same events: `message:new/delivered/read, deal:updated, typing, presence:update`. UI: `react-native-gifted-chat` or custom + `FlashList`. |
| Notifications bell + socket live | Same `GET/PATCH /api/notifications` + socket. Add `expo-notifications + expo-device + expo-constants` (FCM/APNs). Needs new backend: `PUT /api/user/push-token`, store Expo push token, fan-out in `dispatchScheduledNotifications.job.js`. |
| Wishlist optimistic + `WishlistContext` | Same `GET/POST /api/wishlist/*`. Keep optimistic + rollback pattern, zustand store. |
| Pickup spots (max 3), campus gate, gender gate / Girls-Corner | Same `/api/pickup-spots`, `/api/campuses`, `PUT /updateProfile {campus_slug}`. UI modals replace Radix `Dialog/AlertDialog`. |
| Pro/Pro+ + boost + **Razorpay Checkout.js** | Backend `POST /api/payments/orders|verify|me + webhook` 100% reusable. Frontend: `razorpay-react-native` (native UPI/cards) instead of `checkout.js` lazy script. Warning: Play Store digital goods may force Play Billing — keep Razorpay for physical marketplace boost, plan Play Billing separately. |
| Badges/rewards/leaderboard + `canvas-confetti` | Same `/api/badges/me|compute|leaderboard`, `/api/rewards/me`. Confetti: `react-native-confetti-cannon`. |
| Contact FAQ + `@emailjs/browser` + `POST /api/report/support` | Call same `/api/report/support` directly, drop EmailJS from client (keep key off-device). |
| Animations `framer-motion`, icons `lucide/react-icons`, toast `ui/Toast`, loader `BrandLoader` | `react-native-reanimated + react-native-gesture-handler` (replaces framer), `lucide-react-native` (replaces lucide), `@expo/vector-icons`, `react-native-toast-message` (replaces custom Toast), `expo-haptics` for feedback. Slider: `@react-native-community/slider` (replaces `PriceRangeSlider`). |
| Theme dark/light, `GirlsMode`, `ChatSettings/wallpapers` | `expo-system-ui + NativeWind darkMode:class + AsyncStorage`. Same `/chatSettings` API. |

### Backend delta (small, in this repo)

1.  Mobile token mode: if `x-client-type: mobile`, `login/refresh/google/*` also return JSON tokens (web stays HttpOnly-only).
2.  `verifyOrigin` already passes no-Origin mobile — no change. Add `trust` for `exp://`, `unideals://` deep links in OAuth redirect allowlist.
3.  Add `pushTokens` to `User.model` + send via Expo Push API in notification service.
4.  No changes to product/wishlist/chat/payments/ImageKit logic.

### Tooling

`EAS Build + EAS Update (OTA) + Sentry (expo) + expo-dev-client` for staging against `https://api.unideals.in` + tunnel for webhook tests (`ngrok http 5000` same as web).

If you confirm (1) Android+iOS or Android-first, (2) Razorpay-only or Play Billing also needed, (3) admin app needed or web-admin enough — I'll write the exact `Unideals-App` scaffold plan + backend diff file-by-file.

---

## User

Now make the entire plan from very very start to the extreme end for the app so that i will export this session in a md file and will give it to the other opencode session for starting the work

---

## Assistant (Plan · Muse Spark 1.3 Free · 33.5s)

_Thinking:_

Structuring a read-only end-to-end app plan with phases from prerequisites to release and exportable markdown format.

# Unideals App — Start to End Build Plan (for export to `UNIDEALS_APP_PLAN.md`)

> Give this file to a fresh Opencode session. It assumes: repo `Unideals` = web `frontend/` + shared `backend/` (Express 5 + MongoDB + Socket.io). New repo `Unideals-App` = Expo app. Backend is source of truth — no fork.

## 0. Locks & Assumptions (confirm or override)

1.  **Repos:** Keep `Unideals` as-is. New repo `Unideals-App` standalone at root (`app.json`, `eas.json` at root). Backend stays in `Unideals/backend`.
2.  **Targets:** Android + iOS, single codebase. Android-first beta, iOS follows.
3.  **Payments:** Razorpay-native for marketplace/boost now. Play Billing / App Store IAP deferred unless store rejects.
4.  **Admin:** Web-admin only, no admin app.
5.  **Stack lock:** Expo SDK 52+ + TypeScript + `expo-router` + NativeWind 4 + `axios + @tanstack/react-query + zustand` + `expo-secure-store` + `@react-native-async-storage/async-storage` + `socket.io-client` + `expo-image` + `@shopify/flash-list` + `react-native-reanimated + gesture-handler` + `expo-notifications` + `expo-image-picker + expo-image-manipulator + expo-file-system` + `react-native-qrcode-svg` + `react-hook-form + zod` + `razorpay-react-native` + `@react-native-google-signin/google-signin + expo-auth-session/web-browser` + `react-native-toast-message` + `Sentry-expo` + EAS Build/Update.

## 1. Phase 0 — Accounts, Access, Contract

1.  Create GitHub repo `Unideals-App` (private), branch protection `main`, `dev` branch. Grant app dev: `write` on `Unideals-App`, `read` on `Unideals`.
2.  Collect secrets: `EXPO_PUBLIC_API_BASE_URL` (prod `https://api.unideals.in`, staging Render URL), `GOOGLE_CLIENT_ID` (Android+iOS+Web IDs), `RAZORPAY_KEY_ID` (test), `IMAGEKIT_URL_ENDPOINT/PUBLIC_KEY`, `SENTRY_DSN`, EAS account, Play Console + App Store Connect, FCM/APNs keys, Expo Push projectId.
3.  Freeze API contract: app calls same `GET /health`, `/api/auth/*`, `/api/user/*`, `/api/product/*`, `/api/wishlist/*`, `/api/pickup-spots/*`, `/api/imagekit/*`, `/api/campuses`, `/api/boost/*`, `/api/payments/*`, `/api/badges/*`, `/api/rewards/*`, `/api/handoff/*`, `/api/conversations/*`, `/api/deals/pending-followups`, `/api/orders/*`, `/api/notifications/*`. No field renames without versioning. Reference: `Unideals/backend/src/app.js`, `Unideals/frontend/src/app/routes.jsx`.

## 2. Phase 1 — New Repo Scaffold (Unideals-App)

1.  `npx create-expo-app@latest . --template tabs + TypeScript`, enable `expo-router`, NativeWind 4, `eas init`.
2.  Structure: `app/(auth)/login,signup,forgot-password,reset-password/[token],verify-email,checkEmail` / `app/(tabs)/index(search/home),search,upload,chat,wishlist,profile` / `app/product/[id],category/[name],price,subscription,settings,achievements,myorders,notification,contact,p/[code]` / `src/api/,store/,hooks/,components/ui/,utils/,constants/`.
3.  Add `.env.sample`: `EXPO_PUBLIC_API_BASE_URL, GOOGLE_ANDROID_CLIENT_ID, GOOGLE_IOS_CLIENT_ID, RAZORPAY_KEY_ID, IMAGEKIT_URL_ENDPOINT, IMAGEKIT_PUBLIC_KEY, SENTRY_DSN, EAS_PROJECT_ID`.
4.  Add `eas.json` (dev/preview/production), `app.config.ts` (scheme `unideals://`, package `in.unideals.app`, deep-link intent filters, notifications plugin, SecureStore, ImagePicker permissions).
5.  DoD: `npx expo start`, `eas build --profile development`, `/health` fetch works from device.

## 3. Phase 2 — Backend Delta (in Unideals repo, small PR)

1.  **Mobile token mode:** In `src/services/auth.service.js#setAuthCookies` + `src/controllers/auth.controller.js#loginController,refreshController,googleOneTap,googleExchange`: if `req.headers['x-client-type']==='mobile'`, also return `{accessToken, refreshToken, user}` JSON. Web stays cookie-only (XSS safety). Update `POST /api/auth/login, /refresh-token, /google/one-tap, /google/exchange`.
2.  **Verify no block:** `src/middlewares/csrf.middleware.js#verifyOrigin` already passes no-Origin mobile — add regression test. CORS in `src/app.js` already allows no-Origin. Socket `src/sockets/index.js#authSocket` already accepts `handshake.auth.token` — no change, just document.
3.  **Push support:** Add `pushTokens:[{token, platform, updatedAt}]` to `src/models/User.model.js`, `PUT /api/user/push-token [auth]`, `DELETE /api/user/push-token`. Extend `src/services/notification.service.js` + `src/jobs/dispatchScheduledNotifications.job.js` to fan-out via Expo Push API (`expo-server-sdk`). Keep in-app `/api/notifications` unchanged.
4.  **OAuth allowlist:** Add `unideals://*, exp://*` to allowed redirect/origin list for `GET /api/auth/google/callback` -> `.../login?oauth_code=`. Keep `oauth_state` cookie check for web, use PKCE/state param for mobile via `expo-auth-session`.
5.  DoD: Postman with `x-client-type: mobile`, no Origin: login -> JSON tokens, Bearer works on `GET /api/user/userProfile`, socket connects with `auth:{token}`.

## 4. Phase 3 — App Foundation

1.  **Networking:** `src/api/client.ts` axios `{baseURL: EXPO_PUBLIC_API_BASE_URL, timeout:30000}`, `Authorization: Bearer` from memory, `x-client-type: mobile`. Single-flight 401 refresh like `frontend/src/services/authInterceptor.js` (skip auth endpoints, queue subscribers, SecureStore refresh, emit `session-expired/account-blocked`). React Query provider + persist cache.
2.  **Stores:** zustand `useUser (profile, isLoggedIn, campus_id, gender)`, `useCampus (default vit-vellore guest)`, `useWishlist (optimistic toggle/rollback like WishlistContext)`, `useTheme (dark/light/system)`, `useGirlsMode`.
3.  **Nav/guards:** `expo-router` groups: `(auth)` PublicOnly (bounce if logged), `(tabs)` Protected (redirect `/login?from=` if no session), `CampusGate` (if `campus_id==null` force select from `GET /api/campuses`), `GenderGate` (if `gender==null` force select). Mirrors `ProtectedLayout, MainLayout, CampusGate.jsx, GenderGate.jsx`.
4.  **UX kit:** `BrandLoader, Toast (react-native-toast-message), LimitModal, PriceRangeSlider (@react-native-community/slider), ThemeToggle, Avatar, ShareButton (RN Share), Seo->screen titles`.
5.  DoD: cold start -> cached profile hydrates -> silent `GET /userProfile` probe -> guards correct, 14-min keep-alive refresh works.

## 5. Phase 4 — Auth Parity

Implement `login (email/pass)`, `signup (+LegalAgreementModal v1.0, PasswordStrengthMeter)`, `forgot/reset/:token (GET validate then POST)`, `verify-email + checkEmail poll (GET /check-verification?email=, POST /resend-verification)`, `logout POST /logoutUser + clear SecureStore + multi-tab equivalent`, `deleteAccount`. Google: native button -> `@react-native-google-signin` idToken -> `POST /google/one-tap`; fallback `expo-auth-session` redirect -> `GET /api/auth/google` -> `?oauth_code` deep-link `unideals://login?oauth_code=` -> `POST /google/exchange`. DoD: all flows hit same backend, tokenVersion revocation (`v` mismatch -> re-login) works.

## 6. Phase 5 — Home / Search / Product Detail

`GET / (page,limit,search,category,condition,min_price,max_price,sort)`, `GET /boosted, /search?q, /search-suggestions?q, /trending`, `GET /:id`. UI: hero + boosted carousel + category grid + `FlashList` feed (replace 8+8 web), `Girls-Corner ?tab=girls` filter (`isGirlsOnly`), `useDebounce` search dropdown with AbortSignal, detail gallery (`expo-image` + `ikThumb/ikCard/ikFull` transforms from `utils/imageTransform.js`) + `react-native-image-viewing` + seller card + chat CTA + share. DoD: filters/sort/campus scoping (`optionalAuth` Bearer) match web.

## 7. Phase 6 — Listing Wizard + Handoff

4 steps `BasicInfo/Images/Pricing/Preview` (`ProductListing.jsx` + `useProductListing + ProductListingContext`): validations via `react-hook-form+zod`, category `dropdown`, visibility/unlist/relist/sold/delete, drafts (`AsyncStorage` + `GET /user/drafts`, `GET /user/my-products`). Images: `expo-image-picker` (multi) -> `expo-image-manipulator` compress -> `GET /api/imagekit/auth` -> upload via `expo-file-system`/`fetch` to ImageKit `unideals/{userId}`. Phone handoff: in-app direct upload primary; keep QR view (`react-native-qrcode-svg` value=session.url from `POST /api/handoff`) + `POST /:code/photos (x-handoff-secret)` for continuity. DoD: create draft -> publish -> boosted flag -> appears in feed; 10KB JSON limit + rate-limits handled.

## 8. Phase 7 — Wishlist / Pickup Spots / Campus / Profile / Settings

Wishlist `GET /, POST /add|/remove|/toggle, GET /check/:productId` optimistic. Pickup `GET/POST/PUT/DELETE/PATCH-primary /api/pickup-spots` (max 3). Campus `GET /api/campuses + PUT /updateProfile {campus_slug}`. Profile `GET /userProfile`, `PUT /updateProfile, /chatSettings, /updateAvatar (ImageKit), DELETE /removeAvatar`, gender `POST /requestGenderChange + GET /genderChangeStatus`, `SecuritySettings, ChatSettings (wallpapers), logout, DELETE /deleteAccount`. DoD: quota errors (`LimitModal` upgrade prompt) match web.

## 9. Phase 8 — Chat + Deals + Orders

`GET /api/conversations, POST /, GET /:id, GET|POST /:id/messages, PATCH /:id/read, deal APIs: POST /:id/offers|/respond|/confirm|/pickup|/payment-confirm|/item-received|/cancel`, `GET /api/deals/pending-followups`, `GET /api/orders?role&status`. Socket: `io(url,{auth:{token}, transports:[websocket,polling]})`, events `message:new/delivered/read, deal:updated, typing (900ms throttle), presence:update, conversation:updated, join/leave_conversation`. UI: conversation list + thread (`FlashList` inverted), offers, `DealProgress`, pickup spot select, report user (`POST /api/report/user/:id`). DoD: two devices live message/typing/presence/deal-stage sync.

## 10. Phase 9 — Payments + Subscription + Boost

`GET /api/payments/me (tier/usage/history)`, `POST /orders {plan, productId}`, `POST /verify {orderId,paymentId,signature}`, pricing screen (`PricingModel.jsx` plans Pro 99/Pro+199 lifetime, boost 3-day 29/7-day 49). Native: `razorpay-react-native` checkout with `RAZORPAY_KEY_ID`, verify via backend, webhook (`payment.captured/failed`) needs no app change. Boost: `GET /api/boost/me/summary`, `POST /api/boost/products/:productId` quota path + add-on path via payments. DoD: test UPI `success@razorpay` end-to-end in Test Mode, idempotent activation, `Subscription.jsx` usage matches web.

## 11. Phase 10 — Notifications + Badges + Misc

Notifications `GET /, PATCH /:id/read|/read-all, POST /:id/click` + socket + Expo Push (register `expo-notifications` token -> `PUT /push-token`, handle foreground/background/tap deep-link `unideals://notification|chat?conversation=`). Badges `GET /badges/me|/config|/leaderboard, POST /compute`, rewards `GET /rewards/me`, `Achievements.jsx (LevelCard/BadgeCard/RankGuide)`, `FirstListingCelebration (confetti-cannon)`. Legal `PrivacyPolicy/Terms`, Contact `POST /api/report/support` (drop EmailJS client key). Reports `POST /report/product/:id`. DoD: push tap opens correct screen, badge XP matches web.

## 12. Phase 11 — Hardening & QA

Security: SecureStore only for tokens, no tokens in logs (redact like `morgan redacted-url`), XSS/NoSQL already server-side, rate-limit 429 backoff UI, `tokenVersion` logout-all. Perf: FlashList window, `expo-image` cache, Query staleTimes (feed 60s, detail 30s), compress <1MB, paginate 20/page. Offline: cached feed/profile, queued wishlist toggle retry, upload retry. Tests: Jest (auth store, refresh interceptor, dealStage), Maestro/Detox smoke (login->search->wishlist->upload draft->chat send->boost order), Postman/Newman backend regression incl. mobile header. DoD: 0 P0, Sentry clean, 60fps lists.

## 13. Phase 12 — Release

`eas build --profile preview` -> internal QA via Expo Go/dev-client, `eas update` OTA for JS-only. Store assets (icon, splash, screenshots, privacy URL `https://app.unideals.in/privacy-policy`). `eas build --profile production --platform all` -> Play `aab` (closed track -> production) + App Store `ipa` (TestFlight -> review). Backend prod: ensure `FRONTEND_URL,ADMIN_FRONTEND_URL` unchanged, webhook `https://api.unideals.in/api/payments/webhook` still raw-body, cron single-instance until Redis. DoD: store listings live, `unideals://product/:id` + `https://app.unideals.in/product/:id` applinks both open app.

## 14. Phase 13 — Post-launch Ops

Sentry + EAS analytics, backend `morgan` + Atlas slow-query watch, boost/subscription cron verification (`*/10, 0 3, 0 2` jobs). OTA policy (no native changes via OTA). Versioned API plan (`/api/v1`) when breaking change needed. Next: Redis socket adapter + job lock when >1 instance, Play Billing spike if store flags Razorpay.

### Appendix — Parity Checklist (must all pass vs web)

Auth, Google, verify/reset, home/boosted/category/explore/search/suggestions/trending/detail/share, wizard/drafts/images/handoff, wishlist, pickup×3, campus/gender gates, chat/typing/presence/offers/deal-stages/pickup/report, orders tabs, notifications read-all/click + push, subscription/usage/history, boost quota + add-on, badges/leaderboard/rewards/confetti, profile/settings/avatar/chatSettings/security/delete, contact/support, legal, theme/girls-mode, guards/redirects (`/profileoverview->/profile`, `/setting->/settings`, `/badge->/achievements`).

### Runbook Commands

```bash
# backend (Unideals repo)
cd backend && cp .env.sample .env && npm i && npm run dev # :5000 /health
# web ref
cd frontend && cp .env.sample .env && npm i && npm run dev # :5173
# app (Unideals-App repo)
cp .env.sample .env && npx expo start --dev-client
eas build --profile development && eas build --profile preview
eas update --branch production --message "parity fix"
```


---

