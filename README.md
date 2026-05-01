# 🛒 GrocerApp

A production-ready full-stack grocery web application with **Admin** and **Client** panels.

Built with **Next.js 14 App Router**, **TypeScript**, **Tailwind CSS**, **Zustand**, **Prisma**, and **PostgreSQL**.

---

## ✨ Features

### Client Panel
- Browse & search products with category filters
- Add to cart (persisted in localStorage)
- Checkout with delivery details
- View order history + live status tracking

### Admin Panel
- Dashboard with revenue & order analytics
- Full product CRUD (create, edit, delete)
- Order management with status updates
- Protected routes (ADMIN role only)

---

## 🧱 Tech Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | Next.js 14 App Router | Full-stack, SSR, file-based routing |
| Language | TypeScript | Type safety across frontend + backend |
| Styling | Tailwind CSS | Utility-first, fast, consistent |
| State | Zustand | Lightweight, no boilerplate |
| ORM | Prisma | Type-safe DB queries, great DX |
| Database | PostgreSQL | Production-grade relational DB |
| Auth | JWT (HTTP-only cookies) | Stateless, secure, role-based |
| Validation | Zod + React Hook Form | Runtime + compile-time safety |

---

## 📁 Folder Structure

```
grocerapp/
├── app/
│   ├── (auth)/                  # Auth route group (no navbar)
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (client)/                # Storefront route group
│   │   ├── layout.tsx           # Navbar + CartDrawer
│   │   ├── page.tsx             # Homepage / product listing
│   │   ├── cart/page.tsx
│   │   ├── checkout/page.tsx
│   │   ├── orders/page.tsx
│   │   └── products/[id]/page.tsx
│   ├── admin/                   # Admin panel
│   │   ├── layout.tsx           # Sidebar layout + auth guard
│   │   ├── page.tsx             # Dashboard
│   │   ├── products/
│   │   │   ├── page.tsx         # Products table
│   │   │   ├── new/page.tsx     # Create product
│   │   │   └── [id]/edit/page.tsx
│   │   └── orders/page.tsx
│   ├── api/                     # Next.js API routes (backend)
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   └── signup/route.ts
│   │   ├── products/
│   │   │   ├── route.ts         # GET all, POST create
│   │   │   └── [id]/route.ts    # GET one, PUT update, DELETE
│   │   ├── orders/
│   │   │   ├── route.ts         # GET (admin: all, client: own), POST create
│   │   │   └── [id]/status/route.ts  # PATCH status
│   │   └── dashboard/route.ts   # GET stats
│   ├── globals.css
│   └── layout.tsx               # Root layout
│
├── components/
│   ├── ui/                      # Reusable primitives
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── index.tsx            # Badge, Modal, Spinner, etc.
│   ├── client/
│   │   ├── ClientNavbar.tsx
│   │   ├── ProductCard.tsx
│   │   ├── CartDrawer.tsx
│   │   └── CategoryFilter.tsx
│   └── admin/
│       ├── AdminSidebar.tsx
│       ├── DashboardStats.tsx
│       ├── ProductForm.tsx
│       └── OrdersTable.tsx
│
├── hooks/
│   ├── useAuth.ts
│   ├── useProducts.ts
│   └── useOrders.ts
│
├── lib/
│   ├── utils.ts
│   ├── constants.ts
│   └── mockData.ts
│
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
│
├── services/
│   ├── api.ts                   # Axios instance
│   ├── authService.ts
│   ├── productService.ts
│   └── orderService.ts
│
├── store/
│   ├── authStore.ts
│   ├── cartStore.ts
│   └── uiStore.ts
│
├── types/
│   └── index.ts
│
├── middleware.ts                 # Route protection
├── .env.example
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🚀 Local Setup

### Prerequisites
- Node.js 18+
- PostgreSQL (local or Docker)
- npm / yarn / pnpm

---

### Step 1 — Clone & Install

```bash
git clone https://github.com/your-username/grocerapp.git
cd grocerapp
npm install
```

---

### Step 2 — Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Required for real backend
DATABASE_URL=postgresql://postgres:password@localhost:5432/grocerapp
JWT_SECRET=your-super-secret-key

# Set to "false" to use real API routes
NEXT_PUBLIC_USE_MOCK=true
```

> **Quick start without PostgreSQL:** Leave `NEXT_PUBLIC_USE_MOCK=true`.  
> The app runs entirely on mock data — no DB needed.

---

### Step 3 — Database Setup (skip if using mock mode)

```bash
# Generate Prisma client
npx prisma generate

# Create tables
npx prisma db push

# Seed with sample data
npx prisma db seed
```

---

### Step 4 — Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@grocerapp.com | admin123 |
| Client | ahmed@example.com | client123 |

---

## 📡 API Endpoints

### Auth
```
POST /api/auth/signup      — Register new client
POST /api/auth/login       — Login (admin or client)
```

### Products
```
GET    /api/products              — List (paginated, filterable)
GET    /api/products/:id          — Single product
POST   /api/products              — Create (ADMIN only)
PUT    /api/products/:id          — Update (ADMIN only)
DELETE /api/products/:id          — Delete (ADMIN only)
GET    /api/products/categories   — All categories
```

### Orders
```
POST   /api/orders                — Place order (CLIENT)
GET    /api/orders                — All orders (ADMIN) / own orders (CLIENT)
PATCH  /api/orders/:id/status     — Update status (ADMIN only)
```

### Dashboard
```
GET    /api/dashboard             — Stats: revenue, orders, products, customers (ADMIN)
```

---

## 🗄️ Database Schema

```prisma
model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String   // bcrypt hashed
  role      Role     @default(CLIENT)
  orders    Order[]
  createdAt DateTime @default(now())
}

model Category {
  id       String    @id @default(cuid())
  name     String    @unique
  slug     String    @unique
  products Product[]
}

model Product {
  id          String      @id @default(cuid())
  name        String
  description String?
  price       Float
  image       String?
  stock       Int         @default(0)
  categoryId  String
  category    Category    @relation(fields: [categoryId], references: [id])
  orderItems  OrderItem[]
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

model Order {
  id              String      @id @default(cuid())
  userId          String
  user            User        @relation(fields: [userId], references: [id])
  items           OrderItem[]
  totalPrice      Float
  status          OrderStatus @default(PENDING)
  deliveryName    String
  deliveryPhone   String
  deliveryAddress String
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}

model OrderItem {
  id        String  @id @default(cuid())
  orderId   String
  order     Order   @relation(fields: [orderId], references: [id])
  productId String
  product   Product @relation(fields: [productId], references: [id])
  quantity  Int
  price     Float   // snapshot at time of order
}

enum Role {
  ADMIN
  CLIENT
}

enum OrderStatus {
  PENDING
  PROCESSING
  DELIVERED
}
```

---

## 🔄 Switching from Mock to Real API

1. Set `NEXT_PUBLIC_USE_MOCK=false` in `.env.local`
2. Ensure `DATABASE_URL` and `JWT_SECRET` are set
3. Run `npx prisma db push && npx prisma db seed`
4. Restart the dev server

All services use the same interface — the mock/real swap is fully transparent to components.

---

## 🧪 Testing Mock Credentials

The mock layer (`lib/mockData.ts`) ships with:
- **12 products** across 7 categories
- **3 sample orders** in various statuses
- **Admin + Client** user accounts

---

## 📦 Production Build

```bash
npm run build
npm start
```

---

## 🌐 Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set env vars in Vercel dashboard:
# DATABASE_URL, JWT_SECRET, NEXT_PUBLIC_USE_MOCK=false
```

For DB, use [Neon](https://neon.tech) or [Supabase](https://supabase.com) (both free PostgreSQL).

---

## ⚡ Performance Notes

- Product list uses server-side pagination (8/page)
- Cart state persisted to `localStorage` via Zustand persist
- Images lazy-loaded via Next.js `<Image>` with remote pattern allowlist
- Admin route guard: middleware (token presence) + layout (role check)

---

## 🛣️ What's Next (Backend Phase)

The frontend is complete. The backend phase will add:

1. `prisma/schema.prisma` — Full schema with migrations
2. `app/api/` — All REST route handlers (JWT auth, bcrypt, Prisma queries)
3. `prisma/seed.ts` — Seed script with realistic data
4. `lib/auth.ts` — JWT sign/verify utilities
5. `lib/db.ts` — Prisma client singleton
