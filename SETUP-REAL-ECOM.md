# Real E-commerce Setup

This version uses Supabase for persistent products/orders/users and a Node/Express API for secure Razorpay order creation and payment verification. Razorpay's Key Secret is server-only.

## 1. Supabase
Run the new migration `20260815090000_add_razorpay_payment_fields.sql` in Supabase SQL Editor.

## 2. Razorpay
Create a Razorpay account and use Test Mode first. Generate a Key ID and Key Secret. The Key Secret must never be placed in the Vite frontend environment.

## 3. Server env
Copy `server/.env.example` to `server/.env` and fill in the values. Put the Supabase **service role key** only in `server/.env`.

## 4. Frontend env
Set `VITE_API_URL=http://localhost:4000` in the root `.env`.

## 5. Run
Terminal 1: `npm run server`
Terminal 2: `npm run dev`
Or use `npm run dev:all`.

## Payment/order flow
Customer -> server creates Razorpay order -> Razorpay Checkout -> server verifies HMAC signature -> server writes the paid order to Supabase -> Admin Orders loads the same database record. COD orders are also written by the server.

Admin status flow: pending -> confirmed -> processing -> shipped -> out for delivery -> delivered, or cancelled.

For production, deploy the API on HTTPS, use Razorpay Live keys after KYC/go-live checks, enable automatic capture, and configure Razorpay webhooks for payment events.
