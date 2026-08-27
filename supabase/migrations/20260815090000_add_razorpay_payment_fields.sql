ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_order_id text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_payment_id text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_signature text;
CREATE UNIQUE INDEX IF NOT EXISTS orders_razorpay_payment_id_idx ON orders(razorpay_payment_id) WHERE razorpay_payment_id IS NOT NULL;
