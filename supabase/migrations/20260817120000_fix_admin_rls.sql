-- Fix admin RLS without recursive references to public.profiles.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

DROP POLICY IF EXISTS "admin_insert_categories" ON public.categories;
CREATE POLICY "admin_insert_categories" ON public.categories
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_update_categories" ON public.categories;
CREATE POLICY "admin_update_categories" ON public.categories
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_categories" ON public.categories;
CREATE POLICY "admin_delete_categories" ON public.categories
  FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "admin_insert_products" ON public.products;
CREATE POLICY "admin_insert_products" ON public.products
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_update_products" ON public.products;
CREATE POLICY "admin_update_products" ON public.products
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_products" ON public.products;
CREATE POLICY "admin_delete_products" ON public.products
  FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_reviews" ON public.reviews;
CREATE POLICY "admin_delete_reviews" ON public.reviews
  FOR DELETE TO authenticated USING (public.is_admin() OR user_id = auth.uid());

DROP POLICY IF EXISTS "admin_update_reviews" ON public.reviews;
CREATE POLICY "admin_update_reviews" ON public.reviews
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "user_read_orders" ON public.orders;
CREATE POLICY "user_read_orders" ON public.orders
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "admin_update_orders" ON public.orders;
CREATE POLICY "admin_update_orders" ON public.orders
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "user_read_profiles" ON public.profiles;
CREATE POLICY "user_read_profiles" ON public.profiles
  FOR SELECT TO authenticated USING (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "user_update_profiles" ON public.profiles;
CREATE POLICY "user_update_profiles" ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "admin_insert_coupons" ON public.coupons;
CREATE POLICY "admin_insert_coupons" ON public.coupons
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_update_coupons" ON public.coupons;
CREATE POLICY "admin_update_coupons" ON public.coupons
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_coupons" ON public.coupons;
CREATE POLICY "admin_delete_coupons" ON public.coupons
  FOR DELETE TO authenticated USING (public.is_admin());
