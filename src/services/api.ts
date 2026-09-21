// src/services/api.ts

import { supabase } from '@/lib/supabase';

import type {
  Product,
  Category,
  Review,
  Order,
  Coupon,
  HeroBanner,
  HeroBannerInput,
} from '@/lib/types';

// ============================================================
// API CONFIG
// ============================================================

const API_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') ||
  (import.meta.env.DEV
    ? 'https://thennai-manam-api.onrender.com'
    : '');

// ============================================================
// COMMON API REQUEST
// ============================================================

async function apiRequest(
  path: string,
  options: RequestInit = {}
) {
  if (!API_URL) {
    throw new Error('API URL is not configured.');
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  console.log('API SESSION:', {
    hasSession: !!session,
    hasToken: !!session?.access_token,
    user: session?.user?.email,
  });

  const headers = new Headers(options.headers);

  headers.set('Content-Type', 'application/json');

  if (session?.access_token) {
    headers.set(
      'Authorization',
      `Bearer ${session.access_token}`
    );
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  let body: any = {};

  try {
    body = await response.json();
  } catch {
    body = {};
  }

  if (!response.ok) {
    console.error('API ERROR:', {
      status: response.status,
      path,
      body,
    });

    if (response.status === 401) {
      throw new Error(
        body?.error || 'Invalid session. Please login again.'
      );
    }

    throw new Error(
      body?.error ||
        `Request failed (${response.status})`
    );
  }

  return body;
}

// ============================================================
// RAZORPAY
// ============================================================

export async function createRazorpayOrder(
  amount: number
) {
  return apiRequest('/api/payments/create-order', {
    method: 'POST',
    body: JSON.stringify({
      amount,
    }),
  });
}


export async function verifyRazorpayPayment(
  payload: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    order?: unknown;
  }
) {
  return apiRequest('/api/payments/verify', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}


// ============================================================
// COD ORDER
// ============================================================

export async function createCodOrder(
  order: Omit<
    Order,
    'id' | 'created_at' | 'order_number'
  >
) {
  return apiRequest('/api/orders/cod', {
    method: 'POST',
    body: JSON.stringify(order),
  });
}


// ============================================================
// CATEGORIES
// ============================================================

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as Category[];
}


// ============================================================
// PRODUCTS
// ============================================================

export interface ProductFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  featured?: boolean;
  bestSeller?: boolean;
  sort?: string;
  limit?: number;
}


export async function getProducts(
  filters: ProductFilters = {}
): Promise<Product[]> {
  let query = supabase
    .from('products')
    .select(`
      *,
      category:categories(*)
    `);

  if (filters.category) {
    query = query.eq(
      'category_id',
      filters.category
    );
  }

  if (filters.search) {
    const search = filters.search.trim();

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,short_description.ilike.%${search}%,description.ilike.%${search}%`
      );
    }
  }

  if (
    filters.minPrice !== undefined &&
    filters.minPrice !== null
  ) {
    query = query.gte(
      'price',
      filters.minPrice
    );
  }

  if (
    filters.maxPrice !== undefined &&
    filters.maxPrice !== null
  ) {
    query = query.lte(
      'price',
      filters.maxPrice
    );
  }

  if (
    filters.minRating !== undefined &&
    filters.minRating !== null
  ) {
    query = query.gte(
      'rating',
      filters.minRating
    );
  }

  if (filters.featured !== undefined) {
    query = query.eq(
      'featured',
      filters.featured
    );
  }

  if (filters.bestSeller !== undefined) {
    query = query.eq(
      'best_seller',
      filters.bestSeller
    );
  }

  switch (filters.sort) {
    case 'price-low':
      query = query.order(
        'price',
        { ascending: true }
      );
      break;

    case 'price-high':
      query = query.order(
        'price',
        { ascending: false }
      );
      break;

    case 'rating':
      query = query.order(
        'rating',
        { ascending: false }
      );
      break;

    case 'newest':
      query = query.order(
        'created_at',
        { ascending: false }
      );
      break;

    default:
      query = query
        .order(
          'best_seller',
          { ascending: false }
        )
        .order(
          'rating',
          { ascending: false }
        );
      break;
  }

  if (
    filters.limit !== undefined &&
    filters.limit > 0
  ) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as Product[];
}


// ============================================================
// SINGLE PRODUCT
// ============================================================

export async function getProductBySlug(
  slug: string
): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as Product | null;
}


// ============================================================
// REVIEWS
// ============================================================

export async function getReviews(
  productId: string
): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .eq('approved', true)
    .order('created_at', {
      ascending: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as Review[];
}


export async function addReview(
  productId: string,
  userId: string | null,
  userName: string,
  userLocation: string | null,
  rating: number,
  comment: string
) {
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      product_id: productId,
      user_id: userId,
      user_name: userName,
      user_location: userLocation,
      rating,
      comment,
      approved: false,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Review;
}


// ============================================================
// CREATE ORDER
// ============================================================

export async function createOrder(
  order: Omit<
    Order,
    'id' | 'created_at' | 'order_number'
  >
): Promise<Order> {
  if (order.payment_method === 'cod') {
    const result = await createCodOrder(order);

    return result.order as Order;
  }

  throw new Error(
    'Use Razorpay checkout for online payments'
  );
}


// ============================================================
// USER ORDERS
// ============================================================

export async function getOrders(
  _userId?: string
): Promise<Order[]> {
  const result = await apiRequest('/api/orders');

  return (result.orders || []) as Order[];
}


export async function getOrderById(
  id: string
): Promise<Order | null> {
  const result = await apiRequest(
    `/api/orders/${id}`
  );

  return (result.order || null) as Order | null;
}


export async function cancelOrder(
  id: string
) {
  return apiRequest(
    `/api/orders/${id}/cancel`,
    {
      method: 'PATCH',
    }
  );
}


export async function updateOrderAddress(
  id: string,
  address: Order['address']
) {
  return apiRequest(
    `/api/orders/${id}/address`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        address,
      }),
    }
  );
}


// ============================================================
// ADMIN ORDERS
// ============================================================

export async function getAllOrders(): Promise<Order[]> {
  const result = await apiRequest(
    '/api/admin/orders'
  );

  return (result.orders || []) as Order[];
}


export async function getAdminOrderById(
  id: string
): Promise<Order | null> {
  const result = await apiRequest(
    `/api/admin/orders/${id}`
  );

  return (result.order || null) as Order | null;
}


export async function updateOrderStatus(
  id: string,
  status: string
) {
  return apiRequest(
    `/api/admin/orders/${id}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        status,
      }),
    }
  );
}


export async function updateOrderTracking(
  id: string,
  tracking: {
    courier_name?: string | null;
    tracking_id?: string | null;
    tracking_url?: string | null;
  }
) {
  return apiRequest(
    `/api/admin/orders/${id}/tracking`,
    {
      method: 'PATCH',
      body: JSON.stringify(tracking),
    }
  );
}


// ============================================================
// COUPONS
// ============================================================

export async function getCoupons(): Promise<Coupon[]> {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', {
      ascending: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as Coupon[];
}


export async function validateCoupon(
  code: string,
  subtotal = 0
): Promise<Coupon | null> {
  const cleanCode = code
    .trim()
    .toUpperCase();

  if (!cleanCode) {
    return null;
  }

  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', cleanCode)
    .eq('active', true)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const coupon = data as Coupon;

  // Expiry check
  if (coupon.expires_at) {
    const expiryTime =
      new Date(coupon.expires_at).getTime();

    if (
      Number.isFinite(expiryTime) &&
      expiryTime < Date.now()
    ) {
      return null;
    }
  }

  // Usage limit check
  if (
    coupon.usage_limit !== undefined &&
    coupon.usage_limit !== null
  ) {
    const usedCount =
      coupon.used_count || 0;

    if (
      usedCount >= coupon.usage_limit
    ) {
      return null;
    }
  }

  // Minimum order check
  const minimumOrder =
    coupon.minimum_order_amount ??
    coupon.min_order ??
    0;

  if (subtotal < minimumOrder) {
    return null;
  }

  return coupon;
}


export async function createCoupon(
  coupon: Partial<Coupon>
): Promise<Coupon> {
  const payload = {
    ...coupon,
    code: coupon.code
      ? coupon.code.trim().toUpperCase()
      : undefined,
  };

  const { data, error } = await supabase
    .from('coupons')
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Coupon;
}


export async function updateCoupon(
  id: string,
  updates: Partial<Coupon>
): Promise<Coupon> {
  const payload = {
    ...updates,
    ...(updates.code
      ? {
          code: updates.code
            .trim()
            .toUpperCase(),
        }
      : {}),
  };

  const { data, error } = await supabase
    .from('coupons')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Coupon;
}


export async function deleteCoupon(
  id: string
) {
  const { error } = await supabase
    .from('coupons')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  return true;
}


export async function toggleCoupon(
  id: string,
  active: boolean
) {
  const { data, error } = await supabase
    .from('coupons')
    .update({
      active,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Coupon;
}


// ============================================================
// ADMIN REVIEWS
// ============================================================

export async function getAllReviews(): Promise<
  (Review & {
    product: Product | null;
  })[]
> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', {
      ascending: false,
    });

  if (error) {
    console.error('GET ALL REVIEWS ERROR:', error);
    throw new Error(error.message);
  }

  const reviews = (data || []) as Review[];

  if (reviews.length === 0) {
    return [];
  }

  const productIds = [
    ...new Set(
      reviews
        .map((review) => review.product_id)
        .filter(Boolean)
    ),
  ];

  let productMap = new Map<
    string,
    Product
  >();

  if (productIds.length > 0) {
    const {
      data: products,
      error: productsError,
    } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds);

    if (productsError) {
      console.error(
        'GET REVIEW PRODUCTS ERROR:',
        productsError
      );

      throw new Error(
        productsError.message
      );
    }

    productMap = new Map(
      ((products || []) as Product[]).map(
        (product) => [
          product.id,
          product,
        ]
      )
    );
  }

  return reviews.map((review) => ({
    ...review,
    product:
      productMap.get(review.product_id) ||
      null,
  }));
}
export async function approveReview(
  id: string
) {
  const { data, error } = await supabase
    .from('reviews')
    .update({
      approved: true,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Review;
}


export async function deleteReview(
  id: string
) {
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  return true;
}


// ============================================================
// ADMIN PROFILES
// ============================================================

export async function getAllProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', {
      ascending: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}


// ============================================================
// ADMIN PRODUCTS
// ============================================================

export async function getAllProductsWithCategory(): Promise<
  Product[]
> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*)
    `)
    .order('created_at', {
      ascending: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as Product[];
}


export async function createProduct(
  product: Partial<Product>
): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert(product)
    .select(`
      *,
      category:categories(*)
    `)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Product;
}


export async function updateProduct(
  id: string,
  updates: Partial<Product>
): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      category:categories(*)
    `)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Product;
}


export async function deleteProduct(
  id: string
) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  return true;
}


// ============================================================
// ADMIN CATEGORIES
// ============================================================

export async function createCategory(
  category: Partial<Category>
): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .insert(category)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Category;
}


export async function updateCategory(
  id: string,
  updates: Partial<Category>
): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Category;
}


export async function deleteCategory(
  id: string
) {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  return true;
}


// ============================================================
// ADMIN DASHBOARD
// ============================================================

export async function getDashboardStats(): Promise<{
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  totalProducts: number;
  totalCustomers: number;
}> {
  return apiRequest(
    '/api/admin/dashboard'
  );
}


// ============================================================
// SALES REPORT
// ============================================================

export interface SalesReport {
  fromDate: string;
  toDate: string;
  totalRevenue: number;
  totalOrders: number;
  deliveredOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  totalProductsSold: number;
  totalCustomers: number;
  averageOrderValue: number;

  dailySales: {
    date: string;
    orders: number;
    revenue: number;
  }[];

  orderSummary: {
    id: string;
    orderNumber: string;
    customer: string;
    date: string;
    status: string;
    amount: number;
  }[];
}


export async function getSalesReport(
  fromDate: string,
  toDate: string
): Promise<SalesReport> {
  if (!fromDate || !toDate) {
    throw new Error(
      'From date and To date are required.'
    );
  }

  if (fromDate > toDate) {
    throw new Error(
      'From date cannot be greater than To date.'
    );
  }

  const startDate =
    new Date(`${fromDate}T00:00:00.000Z`);

  const endDate =
    new Date(`${toDate}T23:59:59.999Z`);

  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      user_id,
      items,
      total,
      order_status,
      created_at
    `)
    .gte(
      'created_at',
      startDate.toISOString()
    )
    .lte(
      'created_at',
      endDate.toISOString()
    )
    .order('created_at', {
      ascending: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  const safeOrders = data || [];

  const cancelledStatuses = [
    'cancelled',
    'canceled',
  ];

  const activeOrders = safeOrders.filter(
    (order) =>
      !cancelledStatuses.includes(
        String(order.order_status).toLowerCase()
      )
  );

  const totalOrders =
    safeOrders.length;

  const deliveredOrders =
    safeOrders.filter(
      (order) =>
        String(
          order.order_status
        ).toLowerCase() === 'delivered'
    ).length;

  const pendingStatuses = [
    'pending',
    'processing',
    'confirmed',
    'shipped',
    'out for delivery',
  ];

  const pendingOrders =
    safeOrders.filter((order) =>
      pendingStatuses.includes(
        String(
          order.order_status
        ).toLowerCase()
      )
    ).length;

  const cancelledOrders =
    safeOrders.filter((order) =>
      cancelledStatuses.includes(
        String(
          order.order_status
        ).toLowerCase()
      )
    ).length;

  const totalRevenue =
    activeOrders.reduce(
      (sum, order) =>
        sum + Number(order.total || 0),
      0
    );

  const averageOrderValue =
    activeOrders.length > 0
      ? totalRevenue / activeOrders.length
      : 0;

  let totalProductsSold = 0;

  for (const order of activeOrders) {
    const items = Array.isArray(order.items)
      ? order.items
      : [];

    for (const item of items) {
      totalProductsSold += Number(
        item?.quantity || 0
      );
    }
  }

  const uniqueCustomers = new Set(
    activeOrders
      .map((order) => order.user_id)
      .filter(Boolean)
  );

  const totalCustomers =
    uniqueCustomers.size;

  const dailySalesMap = new Map<
    string,
    {
      orders: number;
      revenue: number;
    }
  >();

  for (const order of activeOrders) {
    const date = new Date(
      order.created_at
    )
      .toISOString()
      .slice(0, 10);

    const existing =
      dailySalesMap.get(date) || {
        orders: 0,
        revenue: 0,
      };

    existing.orders += 1;
    existing.revenue += Number(
      order.total || 0
    );

    dailySalesMap.set(
      date,
      existing
    );
  }

  const dailySales = Array.from(
    dailySalesMap.entries()
  )
    .sort(([a], [b]) =>
      a.localeCompare(b)
    )
    .map(([date, values]) => ({
      date,
      orders: values.orders,
      revenue: values.revenue,
    }));

  const orderSummary =
    safeOrders.map((order) => ({
      id: order.id,
      orderNumber:
        order.order_number ||
        order.id,
      customer:
        order.user_id
          ? 'Customer'
          : 'Guest',
      date: order.created_at,
      status: order.order_status,
      amount: Number(
        order.total || 0
      ),
    }));

  return {
    fromDate,
    toDate,
    totalRevenue,
    totalOrders,
    deliveredOrders,
    pendingOrders,
    cancelledOrders,
    totalProductsSold,
    totalCustomers,
    averageOrderValue,
    dailySales,
    orderSummary,
  };
}


// ============================================================
// HERO BANNERS
// ============================================================

export async function getHeroBanners(): Promise<
  HeroBanner[]
> {
  const { data, error } = await supabase
    .from('hero_banners')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', {
      ascending: true,
    });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as HeroBanner[];
}


export async function getAllHeroBanners(): Promise<
  HeroBanner[]
> {
  const { data, error } = await supabase
    .from('hero_banners')
    .select('*')
    .order('sort_order', {
      ascending: true,
    });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as HeroBanner[];
}


export async function createHeroBanner(
  banner: Omit<
    HeroBanner,
    'id' | 'created_at' | 'updated_at'
  >
): Promise<HeroBanner> {
  const { data, error } = await supabase
    .from('hero_banners')
    .insert(banner)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as HeroBanner;
}


export async function updateHeroBanner(
  id: string,
  updates: HeroBannerInput
): Promise<HeroBanner> {
  const { data, error } = await supabase
    .from('hero_banners')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as HeroBanner;
}


export async function deleteHeroBanner(
  id: string
) {
  const { error } = await supabase
    .from('hero_banners')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  return true;
}


// ============================================================
// HERO BANNER IMAGE UPLOAD
// ============================================================

export async function uploadHeroBannerImage(
  file: File,
  type: 'desktop' | 'mobile'
): Promise<string> {
  const extension =
    file.name.split('.').pop() ||
    'jpg';

  const fileName =
    `${type}/${crypto.randomUUID()}.${extension}`;

  const { error } =
    await supabase.storage
      .from('hero-banners')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

  if (error) {
    throw new Error(error.message);
  }

  const {
    data: publicUrlData,
  } =
    supabase.storage
      .from('hero-banners')
      .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
}


// ============================================================
// DELETE HERO BANNER IMAGE
// ============================================================

export async function deleteHeroBannerImage(
  imageUrl: string
) {
  const marker =
    '/storage/v1/object/public/hero-banners/';

  const markerIndex =
    imageUrl.indexOf(marker);

  if (markerIndex === -1) {
    return false;
  }

  const filePath =
    imageUrl.slice(
      markerIndex + marker.length
    );

  if (!filePath) {
    return false;
  }

  const { error } =
    await supabase.storage
      .from('hero-banners')
      .remove([filePath]);

  if (error) {
    throw new Error(error.message);
  }

  return true;
}