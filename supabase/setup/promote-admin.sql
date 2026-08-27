-- Run this AFTER creating the admin user in Supabase Authentication > Users.
-- Replace the email below with the exact admin email.

INSERT INTO public.profiles (id, email, full_name, role)
SELECT id, email, COALESCE(raw_user_meta_data->>'full_name', 'Admin'), 'admin'
FROM auth.users
WHERE email = 'YOUR_ADMIN_EMAIL'
ON CONFLICT (id) DO UPDATE
SET role = 'admin', email = EXCLUDED.email;

-- Verify
SELECT p.id, p.email, p.full_name, p.role
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'YOUR_ADMIN_EMAIL';
