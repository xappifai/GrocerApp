# 🛒 GrocerApp

A production-ready, full-stack grocery web application with a **Customer Storefront** and an **Admin Panel** — built as a **Progressive Web App (PWA)** installable on any device.

**Live tech:** Next.js 14 App Router · TypeScript · Tailwind CSS · Supabase · Zustand · PWA

---

## ✨ Feature Overview

### 🧑‍💻 Customer Storefront
| Feature | Details |
|---|---|
| Product browsing | Search, category filter, paginated grid (2-col mobile → 5-col desktop) |
| Category shortcuts | Tap-to-filter icon grid on mobile home screen |
| Product detail | Full page with stock indicator, rating display, and image |
| Cart | Persistent via `localStorage` (Zustand persist), slide-in drawer |
| Checkout | COD only · delivery details · GPS location pin · pre-filled from saved profile |
| Order history | Date-range picker filter · expand/collapse · order status tracker |
| Reorder | Price-diff modal showing current vs. original prices before re-adding to cart |
| Profile | Save name, phone, address, city, and GPS pin — auto-fills checkout |
| Auth | Email/password signup & login via Supabase Auth |

### 🛠️ Admin Panel
| Feature | Details |
|---|---|
| Dashboard | Revenue, orders, products, and customer count at a glance |
| Products | Full CRUD — create, edit, delete with image URL and category |
| Orders | Status management (Pending → Processing → Delivered) · search · status tabs · Google Maps link for delivery location |
| Messages | Customer contact messages inbox with date range + subject + text search |

### 📱 PWA & Mobile
- Installable on iOS, Android, and desktop (Web App Manifest + Service Worker)
- Native-style **bottom tab bar** on mobile (Shop / Orders / Cart / Profile)
- Offline-capable via Workbox caching strategies
- Safe-area inset support for iPhone notch

### 📄 Marketing Pages
- `/about` — Brand story, stats, values, and how it works
- `/contact` — Contact form (saves to Supabase) + FAQ
- `/privacy` — Full Privacy Policy
- `/terms` — Full Terms of Service

---

## 🧱 Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 14 (App Router) | SSR, RSC, file-based routing, image optimisation |
| Language | TypeScript | End-to-end type safety |
| Styling | Tailwind CSS | Utility-first, consistent design tokens |
| Backend & DB | Supabase (PostgreSQL) | Auth, database, RLS, storage — zero-config |
| SSR Auth | `@supabase/ssr` | Cookie-based sessions that work in Server Components |
| State | Zustand | Lightweight global state with `persist` middleware |
| Forms | React Hook Form + Zod | Validated, type-safe forms |
| PWA | `@ducanh2912/next-pwa` | Workbox service worker, offline support |
| Icons | Lucide React | Consistent, tree-shaken icon set |
| Notifications | React Hot Toast | Non-intrusive toast feedback |

---

## 📁 Project Structure

```
grocerapp/
├── app/
│   ├── (auth)/                     # Auth pages (no navbar layout)
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   │
│   ├── (client)/                   # Customer storefront
│   │   ├── layout.tsx              # Navbar + BottomTabBar + CartDrawer + Footer
│   │   ├── page.tsx                # Home — product listing
│   │   ├── HomeContent.tsx         # Client component (search, filter, pagination)
│   │   ├── about/page.tsx
│   │   ├── cart/page.tsx
│   │   ├── checkout/
│   │   │   ├── page.tsx            # SSR — prefetches saved profile
│   │   │   └── CheckoutContent.tsx
│   │   ├── contact/
│   │   │   ├── page.tsx
│   │   │   └── ContactForm.tsx
│   │   ├── orders/
│   │   │   ├── page.tsx            # SSR — fetches user's orders
│   │   │   └── OrdersContent.tsx   # Date-range filter, expand/collapse
│   │   ├── privacy/page.tsx
│   │   ├── products/[id]/
│   │   │   ├── page.tsx            # SSR product detail
│   │   │   └── ProductActions.tsx
│   │   ├── profile/
│   │   │   ├── page.tsx            # SSR — prefetches profile
│   │   │   └── ProfileForm.tsx     # GPS + form
│   │   └── terms/page.tsx
│   │
│   ├── admin/                      # Admin panel (auth-guarded)
│   │   ├── layout.tsx              # Sidebar + role guard
│   │   ├── page.tsx                # Dashboard
│   │   ├── messages/
│   │   │   ├── page.tsx
│   │   │   └── MessagesContent.tsx # Date + subject + search filter
│   │   ├── orders/
│   │   │   ├── page.tsx
│   │   │   └── AdminOrdersContent.tsx
│   │   └── products/
│   │       ├── page.tsx
│   │       ├── new/page.tsx
│   │       └── [id]/edit/page.tsx
│   │
│   ├── manifest.ts                 # PWA Web App Manifest
│   ├── globals.css
│   └── layout.tsx                  # Root layout + PWA meta
│
├── components/
│   ├── ui/                         # Reusable primitives (Spinner, Badge, Modal…)
│   ├── client/
│   │   ├── BottomTabBar.tsx        # Mobile-only native-style tab bar
│   │   ├── CartDrawer.tsx
│   │   ├── CategoryFilter.tsx
│   │   ├── ClientNavbar.tsx
│   │   ├── Footer.tsx
│   │   ├── ProductCard.tsx
│   │   └── ReorderModal.tsx
│   └── admin/
│       ├── AdminSidebar.tsx
│       ├── DashboardStats.tsx
│       ├── OrdersTable.tsx
│       └── ProductForm.tsx
│
├── hooks/
│   ├── useAuth.ts
│   ├── useOrders.ts
│   └── useProducts.ts
│
├── lib/
│   ├── constants.ts
│   ├── utils.ts
│   └── supabase/
│       ├── client.ts               # Browser Supabase client
│       ├── server.ts               # Server Supabase client (cookies)
│       └── mappers.ts              # DB row → app type mappers
│
├── services/
│   ├── authService.ts
│   ├── contactService.ts
│   ├── orderService.ts
│   ├── productService.ts
│   └── profileService.ts
│
├── store/
│   ├── authStore.ts                # User session + role
│   ├── cartStore.ts                # Cart items (persisted to localStorage)
│   └── uiStore.ts
│
├── supabase/
│   └── schema.sql                  # Full DB schema + RLS policies + seed data
│
├── types/
│   └── index.ts                    # Shared TypeScript interfaces
│
├── middleware.ts                    # Route protection (Supabase session refresh)
├── next.config.js                   # PWA + image domains + optimisePackageImports
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🗄️ Database Schema (Supabase / PostgreSQL)

```sql
-- Auth handled by Supabase Auth (auth.users)

profiles          -- Extended user data: name, phone, address, lat/lng, role
categories        -- Product categories (id, name, slug)
products          -- id, name, description, price, image, stock, category_id
orders            -- id, user_id, total_price, status, delivery fields, lat/lng
order_items       -- id, order_id, product_id, product_name, quantity, price
contact_messages  -- id, name, email, subject, message, created_at
```

Row-Level Security is enabled on all tables. An `is_admin()` helper function gates admin-only operations.

---

## 🚀 Local Setup

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier is fine)
- npm / yarn / pnpm

---

### 1 — Clone & install

```bash
git clone https://github.com/your-username/grocerapp.git
cd grocerapp
npm install
```

---

### 2 — Configure environment variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-public-key
```

Both values are found in your Supabase project under **Settings → API**.

---

### 3 — Set up the database

Run the contents of `supabase/schema.sql` in your Supabase **SQL Editor**.

This creates all tables, RLS policies, triggers, and seeds sample categories + products.

---

### 4 — Create an admin user

1. Sign up through the app at `/signup`
2. In Supabase SQL Editor, promote the account:

```sql
UPDATE profiles
SET role = 'ADMIN'
WHERE email = 'your@email.com';
```

---

### 5 — Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — admin panel is at `/admin`.

---

## 🔑 Default Access

| Role | How to access |
|---|---|
| **Customer** | Sign up at `/signup` |
| **Admin** | Sign up, then run the SQL above to set `role = 'ADMIN'` |

---

## 📦 Build & Deploy

```bash
# Production build
npm run build
npm start
```

### Deploy to Vercel (recommended)

```bash
npm i -g vercel
vercel
```

Add the two environment variables in the **Vercel dashboard → Project → Settings → Environment Variables**:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

No other configuration needed — Vercel auto-detects Next.js.

> **Database:** Your Supabase project is already hosted — no separate DB deployment needed.

---

## ⚡ Performance & Accessibility

| Optimisation | Detail |
|---|---|
| SSR product pages | Homepage and product detail are server-rendered for fast FCP |
| `next/image` | AVIF/WebP formats, lazy loading, `priority` on first 4 cards |
| `optimizePackageImports` | Tree-shakes lucide-react at build time |
| Cart hydration fix | `mounted` state prevents Zustand persist hydration mismatch |
| Dynamic CartDrawer | Loaded client-side only (`ssr: false`) — not in initial JS bundle |
| Heading hierarchy | h1 → h2 → h3 maintained across all pages |
| ARIA labels | All icon-only buttons have `aria-label` |
| Colour contrast | All text meets WCAG AA minimum (4.5:1) |
| PWA offline | Workbox caches shell + assets for offline browsing |

---

## 📱 PWA Installation

The app is fully installable as a native-like app:

- **iOS Safari:** Share → Add to Home Screen
- **Android Chrome:** Three-dot menu → Install App (or Add to Home Screen)
- **Desktop Chrome/Edge:** Address bar install icon

The bottom tab bar and safe-area insets activate automatically when running in standalone PWA mode.

---

## 🛣️ Roadmap

- [ ] Push notifications for order status updates
- [ ] Product image upload via Supabase Storage
- [ ] Discount codes / promo system
- [ ] Customer reviews & ratings
- [ ] Admin analytics charts (revenue over time)
- [ ] Multi-language support (i18n)
