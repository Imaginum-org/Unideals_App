# Unideals — Full Project Structure (for Opencode handoff)

> Stack: `frontend/` React 18 + Vite 6 + Tailwind 3 + React-Router v7 | `backend/` Node 22 + Express 5 ESM + Mongoose 9 + Socket.io | MongoDB Atlas, ImageKit, Razorpay Test, Resend, Google OAuth

## 0. Repo Root `E:\Unideals\`

```
Unideals/
├── backend/                  # Express API (see §1 detailed)
├── frontend/                 # React+Vite client (see §2 detailed)
├── Readme.md                 # source of truth: tech-stack, API table, routes, setup
├── Subscription_plan.md      # plan prices/limits/boost rules (Founder lifetime)
├── Gamification_plan.md      # badges/rewards spec
├── Girl_Corner_feature.md    # girls-only listings spec
├── Notification_architecture.md
├── fix.md                    # security/feature fix log
├── session-ses_eca1.md       # UNTRACKED local session note
└── .git/
```

Run:

```bash
# backend http://localhost:5000 | frontend http://localhost:5173
# backend: npm install; node src/seeds/plans.seed.js; npm run dev (server.js)
# frontend: npm install; npm run dev
# health: GET /health -> {status:"OK"}
```

---

## 1. Backend `backend/` — DETAILED

```
backend/
├── server.js                 # entry: dotenv check JWT secrets, connectDB(), schedule 4 cron jobs, http.createServer(app)+initSockets(), listen PORT
├── package.json              # type:module, deps: express@5, mongoose@9, zod@4, razorpay@2, imagekit@6, jsonwebtoken, bcrypt, socket.io@4, helmet, cors, express-rate-limit, xss, morgan, multer, nanoid, slugify, resend, google-auth-library, node-cron
├── .env / .env.sample        # PORT, FRONTEND_URL, ADMIN_FRONTEND_URL, MONGO_URL, SECRET_KEY_ACCESS_TOKEN/REFRESH_TOKEN, GOOGLE_*, IMAGEKIT_*, RESEND_API_KEY, RAZORPAY_KEY_ID/SECRET/WEBHOOK_SECRET, DEFAULT_CAMPUS_SLUG
├── .gitignore
├── scripts/ (UNTRACKED)
│   └── backfillGirlsCorner.js
└── src/
    ├── app.js                # Express app: trust proxy, helmet, NoSQL-sanitize, XSS-sanitize, CORS(credentials), raw-body webhook FIRST, json 10kb, cookieParser, morgan dev, compression, verifyOrigin, mount routers, 404, global error handler
    ├── config/ (6)
    │   ├── db.js             # connectDB()
    │   ├── constants.js
    │   ├── sendEmail.js      # Resend
    │   ├── subscriptionPlans.js # ACTIVE_SUBSCRIPTION_TYPE founder/semester, Pro ₹99 / Pro+ ₹199
    │   ├── boostPlans.js     # Free 0, Pro 2x3d, Pro+ 5x7d
    │   └── boostAddons.js    # 3-day ₹29, 7-day ₹49
    ├── routes/ (21) -> mounted in app.js as:
    │   ├── auth.routes.js → /api/auth
    │   ├── user.routes.js → /api/user
    │   ├── product.routes.js → /api/product
    │   ├── wishlist.routes.js → /api/wishlist
    │   ├── pickupSpot.routes.js → /api/pickup-spots
    │   ├── report.routes.js → /api/report
    │   ├── boost.routes.js → /api/boost
    │   ├── payment.routes.js → /api/payments (+ exports paymentWebhookHandler mounted separately at POST /api/payments/webhook with express.raw)
    │   ├── imagekit.routes.js → /api/imagekit
    │   ├── campus.routes.js → /api/campuses
    │   ├── admin.routes.js → /api/admin (GET rate-limited 60/min)
    │   ├── badgeRoutes.js → /api/badges
    │   ├── rewardRoutes.js → /api/rewards
    │   ├── handoff.routes.js → /api/handoff (phone photo upload)
    │   ├── conversation.route.js → /api/conversations
    │   ├── deal.route.js → /api/deals
    │   ├── order.routes.js → /api/orders
    │   ├── notification.routes.js → /api/notifications
    │   ├── message.route.js
    │   ├── review.routes.js
    │   └── support.routes.js
    ├── controllers/ (25 - thin, delegate to services)
    │   ├── auth.controller.js, user.controller.js, product.controller.js, wishlist.controller.js
    │   ├── pickupSpot.controller.js, report.controller.js, boost.controller.js, payment.controller.js
    │   ├── imagekit.controller.js, campus.controller.js, conversation.controller.js, deal.controller.js
    │   ├── message.controller.js, notification.controller.js, order.controller.js, handoff.controller.js
    │   ├── review.controller.js, support.controller.js, badgeController.js, rewardController.js
    │   └── admin.controller.js, adminAuth.controller.js, admin.user.controller.js, admin.product.controller.js, admin.order.controller.js
    ├── services/ (22 - business logic)
    │   ├── auth.service.js, product.service.js, payment.service.js, subscription.service.js
    │   ├── boost.service.js, conversation.service.js, deal.service.js, message.service.js
    │   ├── notification.service.js, order.service.js, handoff.service.js, campus.service.js
    │   ├── report.service.js, support.service.js, badgeService.js, rewardService.js
    │   ├── aiPreviewScore.service.js, auditLog.service.js
    │   └── admin.service.js, admin.user.service.js, admin.product.service.js, admin.order.service.js
    ├── models/ (19 Mongoose)
    │   ├── User.model.js, Product.model.js, Payment.model.js, Subscription.model.js
    │   ├── Wishlist.model.js, PickupSpot.model.js, Report.model.js, Review.model.js
    │   ├── Boost.model.js, Badge.model.js, Campus.model.js, Notification.model.js
    │   ├── conversation.model.js, message.model.js, deal.model.js, ChatCooldown.model.js
    │   ├── PhotoHandoff.model.js, SupportTicket.model.js, AuditLog.model.js
    ├── middlewares/ (6)
    │   ├── auth.middleware.js (15m access JWT + rotating 7d refresh HttpOnly cookie, revocation)
    │   ├── role.middleware.js (admin/support)
    │   ├── plan.middleware.js (tier guard)
    │   ├── validation.middleware.js (Zod)
    │   ├── csrf.middleware.js (verifyOrigin)
    │   └── error.middleware.js
    ├── validations/ (7 Zod, under src/validations/)
    │   ├── product.validation.js, payment.validation.js, report.validation.js
    │   ├── conversation.validation.js, deal.validation.js, message.validation.js, campus.validation.js
    ├── jobs/ (6 node-cron, scheduled in server.js except cleanupDeals/autoUnlist)
    │   ├── expireBoosts.job.js, expireSubscriptions.job.js, cleanupDeletedProducts.job.js
    │   ├── dispatchScheduledNotifications.job.js, cleanupDeals.job.js
    │   └── autoUnlistInvalidGirlsListings.job.js (UNTRACKED)
    ├── sockets/ (5)
    │   ├── index.js + socket.js (initSockets(httpServer))
    │   ├── chat.socket.js, deal.socket.js, location.socket.js
    ├── utils/ (11 + templates/)
    │   ├── generatedAccessToken.js, generatedRefreshToken.js, password.js (bcrypt)
    │   ├── appError.js, response.js, adminQuery.js, profanity.js
    │   ├── imagekit.js, razorpay.js, socket.js
    │   ├── girlsCorner.js (UNTRACKED)
    │   └── templates/verifyEmailTemplate.js, forgotPaswordTemplate.js
    └── seeds/ (3)
        ├── plans.seed.js (catalog self-check: node src/seeds/plans.seed.js)
        ├── campuses.seed.js (npm run seed:campuses)
        └── admin.seed.js
```

Key API (prefix `VITE_API_BASE_URL`):

* `POST /api/auth/register|login|logoutUser|refresh-token|verify-email|resend-verification|forgot-password|reset-password/:token|google[/callback|/exchange|/one-tap] + GET /check-verification`
* `GET/PUT /api/user/userProfile|updateProfile|updateAvatar|removeAvatar|deleteAccount`
* `GET /api/product/?page&search&category&condition&min_price&... |/boosted|/search|/search-suggestions|/:id|/user/my-products|/user/drafts + POST / DELETE /:id + PATCH /:id/unlist|relist`
* `GET|POST /api/wishlist/|/add|/remove|/toggle|/check/:productId`
* `POST|GET|PUT|DELETE /api/pickup-spots/ (+PATCH /:id/primary, max 3/user)`
* `POST /api/report/product/:id|/user/:id`, `GET /api/boost/me/summary + POST /products/:productId`, `POST /api/payments/orders|verify + GET /me + POST /webhook`, `GET /api/imagekit/auth`, admin `/api/admin/auth/*|users|products`

---

## 2. Frontend `frontend/`

```
frontend/
├── vite.config.js (manualChunks vendor-react/motion/icons, server.host:true)
├── tailwind.config.js, postcss.config.js, eslint.config.js, index.html, vercel.json
├── .env / .env.sample (VITE_API_BASE_URL, VITE_GOOGLE_CLIENT_ID, VITE_RAZORPAY_KEY_ID, VITE_IMAGEKIT_PUBLIC_KEY/URL_ENDPOINT, VITE_EMAILJS_*)
├── public/ (fav.svg, logo.svg, *.webp/png: auth_left, banner_bg, footer_bg, userdp, etc.)
└── src/
    ├── app/App.jsx, main.jsx, routes.jsx (lazy + Suspense BrandLoader)
    ├── layouts/MainLayout.jsx, ProtectedLayout.jsx, PublicOnlyRoute.jsx
    ├── services/axiosInstance.js, authInterceptor.js (cookie auth + silent refresh)
    ├── context/CampusContext.jsx, ThemeContext.jsx, WishlistContext.jsx, useUserContext.jsx
    │   └── GirlsModeContext.jsx (UNTRACKED)
    ├── components/layout/Header.jsx, Footer.jsx
    ├── components/common/AvatarComponent.jsx, ShareButton.jsx/.css
    ├── components/ui/BrandLoader.jsx, Toast.jsx/toast.js, ThemeToggle.jsx, LimitModal.jsx, PriceRangeSlider.jsx, StatsPanel.jsx, Wordmark.jsx, GirlsToggle.jsx (UNTRACKED)
    ├── components/Seo.jsx, NotFound.jsx, FirstListingCelebration.jsx
    ├── hooks/useSafeTimeout.js
    ├── styles/index.css, deletestyle.css
    ├── utils/cn.js, badgeConfig.js, imageUpload.js, imageTransform.js
    └── features/
        ├── auth/api/authApi.js, pages/Login|Signup|ForgotPassword|ResetPassword|VerifyEmail|CheckEmail, components/AuthBrandLogo|AuthMessageBanner|AuthMobileBanner|AuthPageRightPart|LegalAgreementModal|PasswordStrengthMeter|signinWithGoogle, utils/passwordStrength.js
        ├── product/api/productApi.js, services/uploadService.js, context/ProductListingContext.jsx, hooks/useProductListing.js|useDebounce.js, constants/categories|listingOptions|productOptions, validations/basicInfo|images|pricing|index, utils/draftStorage|imageCompression|imageHelpers|validations, components/Category|CategoryIcon|ProductCard|ProductGallery|ImageLightbox|DeleteProductModal|RelistProductModal|UnlistProductModal|listing/ListingLayout|shared/FormError|RequiredLabel|TipsCard|stepper/Stepper|stepperData + GirlsTabs|VisibilitySelector (UNTRACKED) + copy/girlsCorner.copy.js (UNTRACKED), steps/BasicInfo|Images|Pricing|PreviewStep, pages/Home|Explore|ProductDescription|ProductCategory|ProductListing (/upload)|ProductListed (/productlisted)|PricingModel (/price)
        ├── user/api/userApi|ordersApi|badgeApi, pages/ProfileOverview|Settings|Subscription|Wishlist|Myorders|Achievements|ContactUs|Termscondition, components/Profile_left_part|PickupSpotModal|SecuritySettings|ChatSettings|BadgeCard|BadgeMiniStrip|LevelCard|RankGuideModal|OrderCard|OrderDealCard|MyOrdersCard|manageorderanime|editbutton|Deletebutton + GenderGate (UNTRACKED)
        ├── payment/api/paymentApi.js, hooks/useRazorpayCheckout.js (lazy Checkout.js)
        ├── search/api/searchApi.js, hooks/useDebounce.js, components/SearchDropdown.jsx, pages/SearchResults.jsx
        ├── chat/services/chatApi.js, hooks/useChatSocket.js (socket.io-client), components/ChatCard|ConversationCard|DealProgress|MessageBubble|ReportUserModal, utils/chatTheme|dealStage|display|wallpapers, pages/Chat.jsx
        ├── notification/api/notificationApi.js, data/notifications.js, pages/Notification.jsx
        ├── campus/api/campusApi.js, components/CampusGate.jsx
        ├── handoff/api/handoffApi.js, components/PhoneHandoffCard.jsx, pages/PhoneUpload.jsx (/p/:code, secret-in-URL, no layout)
        └── legal/components/LegalDocuments.jsx, pages/PrivacyPolicy.jsx
```

Routes (`routes.jsx`):

* `PublicOnlyRoute: /login,/signup,/forgot-password,/reset-password/:token,/verify-email,/checkEmail`
* `MainLayout public: /=Home, /search, /product/:id, /category/:categoryName, /explore, /price, /termscondition, /privacy-policy, /contact`
* `ProtectedLayout+MainLayout: /profile (+/profileoverview→), /subscription, /settings (+/setting→), /wishlist, /achievements (+/badge→), /myorders, /chat, /notification, /upload[/:productId], /productlisted`
* `Public secret: /p/:code`, `*=NotFound`

---

## 3. Git state (for other session)

* Modified (M): `backend/src/config/constants.js`, controllers `admin.user|auth|product|user|wishlist`, models `Product|User|conversation`, routes `admin|user`, services `admin.user|auth|conversation|product`, validations `product`, frontend `app/main|components/layout/Header|chat/*|product/*|user/api/userApi|user/pages/Settings|layouts/MainLayout|styles/index.css`
* Untracked (??): `backend/scripts/backfillGirlsCorner.js`, `backend/src/jobs/autoUnlistInvalidGirlsListings.job.js`, `backend/src/utils/girlsCorner.js`, `frontend/src/components/ui/GirlsToggle.jsx`, `frontend/src/context/GirlsModeContext.jsx`, `frontend/src/features/product/components/GirlsTabs.jsx|VisibilitySelector.jsx`, `frontend/src/features/product/copy/girlsCorner.copy.js`, `frontend/src/features/user/components/GenderGate.jsx`, `session-ses_eca1.md`
