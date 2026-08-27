# Pollachi Coconut Oil — Final E-Commerce Setup

This project is prepared for local development with:

- React + Vite
- Supabase Auth + Database
- Existing customer website
- Existing Admin Dashboard
- Customer orders
- Admin order list + status updates
- Razorpay Test Mode online payment
- COD
- Secure Express API for Razorpay order creation/verification
- Supabase RLS/admin role protection

## 1. Install packages

From the project folder:

```powershell
npm install
```

Do NOT copy `node_modules` from another machine.

## 2. Frontend environment

Copy:

```text
.env.example
```

to:

```text
.env
```

Fill:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
VITE_API_URL=http://localhost:4000
VITE_SITE_URL=http://localhost:5173
```

The frontend must NEVER contain the Supabase service-role/secret key or Razorpay secret.

## 3. Server environment

Copy:

```text
server/.env.example
```

to:

```text
server/.env
```

Fill:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SECRET_OR_SERVICE_ROLE_KEY

RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_RAZORPAY_KEY_SECRET

PORT=4000
FRONTEND_URL=http://localhost:5173
```

The Supabase service/secret key and Razorpay secret MUST stay in `server/.env`.

## 4. Supabase database

In Supabase Dashboard → SQL Editor, run the migration files in this order:

1. `supabase/migrations/20260815063240_pollachi_schema.sql`
2. `supabase/migrations/20260815064333_add_profile_insert_policy.sql`
3. `supabase/migrations/20260815090000_add_razorpay_payment_fields.sql`
4. `supabase/migrations/20260817120000_fix_admin_rls.sql`

The last migration fixes recursive admin RLS and provides `public.is_admin()`.

## 5. Create an admin

First create the admin account in:

Supabase Dashboard → Authentication → Users → Add user.

Then open:

```text
supabase/setup/promote-admin.sql
```

Replace:

```text
YOUR_ADMIN_EMAIL
```

with the admin email and run it in SQL Editor.

Verify that the result says:

```text
role = admin
```

## 6. Supabase email confirmation

For local development, in:

Authentication → URL Configuration

set:

```text
Site URL:
http://localhost:5173
```

Add:

```text
http://localhost:5173/**
```

to Redirect URLs.

Email confirmation can remain enabled.

## 7. Razorpay

Use Razorpay Test Mode first.

Put only the Test Key ID and Key Secret in:

```text
server/.env
```

Do not put `RAZORPAY_KEY_SECRET` in the frontend `.env`.

The checkout page loads Razorpay Checkout and the server verifies the Razorpay signature before creating the paid order in Supabase.

## 8. Run the project

Terminal 1:

```powershell
npm run server
```

Expected:

```text
API server running on http://localhost:4000
```

Terminal 2:

```powershell
npm run dev
```

Open:

```text
http://localhost:5173
```

You can also use:

```powershell
npm run dev:all
```

## 9. Complete order flow

Customer:

```text
Register
→ Email confirmation
→ Login
→ Shop
→ Product
→ Cart
→ Checkout
→ Razorpay / COD
→ Order created
→ My Orders
```

Admin:

```text
Admin Login
→ /admin
→ Dashboard
→ Orders
→ View customer/order
→ Change status
```

Order statuses:

```text
pending
confirmed
processing
shipped
out for delivery
delivered
cancelled
```

The customer sees the same order status in My Orders.

## 10. Important security note

Never commit these values:

- Supabase service-role/secret key
- Razorpay Key Secret

The supplied project ZIP originally contained credentials. Those credentials have been removed from this final source package. If they were real credentials, rotate/revoke them in Supabase and Razorpay before using the project.

## 11. Production

Before going live:

- Deploy the API over HTTPS.
- Set production `FRONTEND_URL` and `VITE_API_URL`.
- Use Razorpay Live credentials after completing Razorpay's account/go-live requirements.
- Configure Razorpay webhooks.
- Use a production domain in Supabase URL Configuration.
