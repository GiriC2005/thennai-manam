
import { supabase } from '@/lib/supabase';
import type {
  Product,
  Category,
  Review,
  Order,
  Coupon,
} from '@/lib/types';

const API_BASE =
  import.meta.env.VITE_API_URL || 'http://localhost:4000';

/* =====================================================
   API REQUEST HELPER
===================================================== */

async function apiRequest(
  path: string,
  options: RequestInit = {}
) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers = new Headers(options.headers);

  headers.set('Content-Type', 'application/json');

  if (session?.access_token) {
    headers.set(
      'Authorization',
      `Bearer ${session.access_token}`
    );
  }

  const res = await fetch(
    `${API_BASE}${path}`,
    {
      ...options,
      headers,
    }
  );

  const body = await res
    .json()
    .catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      body.error || 'Request failed'
    );
  }

  return body;
}

/* =====================================================
   RAZORPAY
===================================================== */

export async function createRazorpayOrder(
  amount: number
) {
  return apiRequest(
    '/api/payments/create-order',
    {
      method: 'POST',
      body: JSON.stringify({ amount }),
    }
  );
}

export async function verifyRazorpayPayment(
  payload: any
) {
  return apiRequest(
    '/api/payments/verify',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
}

/* =====================================================
   COD ORDER
===================================================== */

export async function createCodOrder(
  order: any
) {
  return apiRequest(
    '/api/orders/cod',
    {
      method: 'POST',
      body: JSON.stringify(order),
    }
  );
}

/* =====================================================
   CATEGORIES
===================================================== */

export async function getCategories(): Promise<Category[]> {
  const {
    data,
    error,
  } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) throw error;

  return data as Category[];
}

/* =====================================================
   PRODUCTS
===================================================== */

export async function getProducts(
  filters?: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    sort?: string;
    featured?: boolean;
    bestSeller?: boolean;
    limit?: number;
  }
): Promise<Product[]> {
  let query = supabase
    .from('products')
    .select(`
      *,
      category:categories(*)
    `);

  if (filters?.category) {
    query = query.eq(
      'category_id',
      filters.category
    );
  }

  if (filters?.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,short_description.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
    );
  }

  if (
    filters?.minPrice !== undefined
  ) {
    query = query.gte(
      'price',
      filters.minPrice
    );
  }

  if (
    filters?.maxPrice !== undefined
  ) {
    query = query.lte(
      'price',
      filters.maxPrice
    );
  }

  if (
    filters?.minRating !== undefined
  ) {
    query = query.gte(
      'rating',
      filters.minRating
    );
  }

  if (filters?.featured) {
    query = query.eq(
      'featured',
      true
    );
  }

  if (filters?.bestSeller) {
    query = query.eq(
      'best_seller',
      true
    );
  }

  switch (filters?.sort) {
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
  }

  if (filters?.limit) {
    query = query.limit(
      filters.limit
    );
  }

  const {
    data,
    error,
  } = await query;

  if (error) throw error;

  return data as Product[];
}

export async function getProductBySlug(
  slug: string
): Promise<Product | null> {
  const {
    data,
    error,
  } = await supabase
    .from('products')
    .select(
      '*, category:categories(*)'
    )
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw error;

  return data as Product | null;
}

/* =====================================================
   REVIEWS
===================================================== */

export async function getReviews(
  productId: string
): Promise<Review[]> {
  const {
    data,
    error,
  } = await supabase
    .from('reviews')
    .select('*')
    .eq(
      'product_id',
      productId
    )
    .eq(
      'approved',
      true
    )
    .order(
      'created_at',
      { ascending: false }
    );

  if (error) throw error;

  return data as Review[];
}

export async function addReview(
productId: string, userId: string, userName: string, userLocation: string, rating: number, comment: string): Promise<void> {
  const {
    error,
  } = await supabase
    .from('reviews')
    .insert({
      product_id: productId,
      user_id: userId,
      user_name: userName,
      user_location: userLocation,
      rating,
      comment,
      approved: false,
    });

  if (error) throw error;
}

/* =====================================================
   ORDERS - CREATE
===================================================== */

export async function createOrder(
  order: Omit<
    Order,
    'id' |
    'created_at' |
    'order_number'
  >
): Promise<Order> {
  if (
    order.payment_method ===
    'cod'
  ) {
    const {
      order: created,
    } = await createCodOrder(
      order
    );

    return created as Order;
  }

  throw new Error(
    'Use Razorpay checkout for online payments'
  );
}

/* =====================================================
   USER ORDERS
===================================================== */

export async function getOrders(
  userId: string
): Promise<Order[]> {
  const {
    orders,
  } = await apiRequest(
    '/api/orders'
  );

  return orders as Order[];
}

export async function getOrderById(
  id: string
): Promise<Order | null> {
  const {
    order,
  } = await apiRequest(
    `/api/orders/${id}`
  );

  return order as Order;
}

/* =====================================================
   CUSTOMER - CANCEL ORDER
   Allowed only:
   pending
   confirmed
===================================================== */

export async function cancelOrder(
  id: string
): Promise<Order> {
  const {
    order,
  } = await apiRequest(
    `/api/orders/${id}/cancel`,
    {
      method: 'PATCH',
    }
  );

  return order as Order;
}

/* =====================================================
   CUSTOMER - UPDATE ADDRESS
   Allowed only:
   pending
   confirmed
===================================================== */

export async function updateOrderAddress(
  id: string,
  address: Order['address']
): Promise<Order> {
  const {
    order,
  } = await apiRequest(
    `/api/orders/${id}/address`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        address,
      }),
    }
  );

  return order as Order;
}

/* =====================================================
   ADMIN ORDERS
===================================================== */

export async function getAllOrders(): Promise<Order[]> {
  const {
    orders,
  } = await apiRequest(
    '/api/admin/orders'
  );

  return orders as Order[];
}

export async function getAdminOrderById(
  id: string
): Promise<Order | null> {
  const {
    order,
  } = await apiRequest(
    `/api/admin/orders/${id}`
  );

  return order as Order | null;
}

/* =====================================================
   ADMIN - UPDATE ORDER STATUS
===================================================== */

export async function updateOrderStatus(
  id: string,
  status: string
): Promise<Order> {
  const {
    order,
  } = await apiRequest(
    `/api/admin/orders/${id}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        status,
      }),
    }
  );

  return order as Order;
}

/* =====================================================
   ADMIN - UPDATE TRACKING
===================================================== */

export async function updateOrderTracking(
  id: string,
  tracking: {
    courier_name: string;
    tracking_id: string;
    tracking_url: string;
  }
): Promise<Order> {
  const { order } = await apiRequest(
    `/api/admin/orders/${id}/tracking`,
    {
      method: 'PATCH',
      body: JSON.stringify(tracking),
    }
  );

  return order as Order;
}
/* =====================================================
   COUPONS
===================================================== */

export async function validateCoupon(
  code: string
): Promise<Coupon | null> {
  const {
    data,
    error,
  } = await supabase
    .from('coupons')
    .select('*')
    .eq(
      'code',
      code.toUpperCase()
    )
    .eq(
      'active',
      true
    )
    .maybeSingle();

  if (error) throw error;

  return data as Coupon | null;
}

/* =====================================================
   ADMIN - REVIEWS
===================================================== */

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
    console.error('getAllReviews error:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    return [];
  }

  const productIds = [
    ...new Set(
      data
        .map((review: any) => review.product_id)
        .filter(Boolean)
    ),
  ];

  let products: Product[] = [];

  if (productIds.length > 0) {
    const { data: productData, error: productError } =
      await supabase
        .from('products')
        .select('*')
        .in('id', productIds);

    if (productError) {
      console.error(
        'getAllReviews products error:',
        productError
      );
    } else {
      products = (productData || []) as Product[];
    }
  }

  return data.map((review: any) => ({
    ...review,
    product:
      products.find(
        (p) => p.id === review.product_id
      ) || null,
  })) as (
    Review & {
      product: Product | null;
    }
  )[];
}
export async function approveReview(
  id: string
): Promise<void> {
  const { error } = await supabase
    .from('reviews')
    .update({
      approved: true,
    })
    .eq('id', id);

  if (error) {
    console.error('approveReview error:', error);
    throw error;
  }
}

export async function deleteReview(
  id: string
): Promise<void> {
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('deleteReview error:', error);
    throw error;
  }
}
/* =====================================================
   ADMIN - PROFILES
===================================================== */

export async function getAllProfiles(): Promise<any[]> {
  const {
    data,
    error,
  } = await supabase
    .from('profiles')
    .select('*')
    .order(
      'created_at',
      { ascending: false }
    );

  if (error) throw error;

  return data;
}

/* =====================================================
   ADMIN - PRODUCTS
===================================================== */

export async function getAllProductsWithCategory(): Promise<Product[]> {
  const {
    data,
    error,
  } = await supabase
    .from('products')
    .select(
      '*, category:categories(*)'
    )
    .order(
      'created_at',
      { ascending: false }
    );

  if (error) throw error;

  return data as Product[];
}

export async function createProduct(
  product: Partial<Product>
): Promise<void> {
  const {
    error,
  } = await supabase
    .from('products')
    .insert(product);

  if (error) throw error;
}

export async function updateProduct(
  id: string,
  updates: Partial<Product>
): Promise<void> {
  const {
    error,
  } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
}

export async function deleteProduct(
  id: string
): Promise<void> {
  const {
    error,
  } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/* =====================================================
   ADMIN - CATEGORIES
===================================================== */

export async function createCategory(
  category: Partial<Category>
): Promise<void> {
  const {
    error,
  } = await supabase
    .from('categories')
    .insert(category);

  if (error) throw error;
}

export async function updateCategory(
  id: string,
  updates: Partial<Category>
): Promise<void> {
  const {
    error,
  } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
}

export async function deleteCategory(
  id: string
): Promise<void> {
  const {
    error,
  } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/* =====================================================
   ADMIN DASHBOARD
===================================================== */

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
// ==========================================
// ADMIN SALES REPORT
// ==========================================

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
}

// ==========================================
// ADMIN SALES REPORT
// ==========================================

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
}

export async function getSalesReport(
  fromDate: string,
  toDate: string
): Promise<SalesReport> {
  if (!fromDate || !toDate) {
    throw new Error(
      'From date and To date are required'
    );
  }

  if (fromDate > toDate) {
    throw new Error(
      'From date cannot be after To date'
    );
  }

  // ==========================================
  // DATE RANGE
  // ==========================================

  const startDate = `${fromDate}T00:00:00`;
  const endDate = `${toDate}T23:59:59`;

  // ==========================================
  // GET ORDERS
  // ==========================================

  const {
    data: orders,
    error,
  } = await supabase
    .from('orders')
    .select(`
      id,
      user_id,
      items,
      total,
      order_status,
      created_at
    `)
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at', {
      ascending: true,
    });

  if (error) {
    console.error(
      'getSalesReport error:',
      error
    );

    throw error;
  }

  const safeOrders = orders || [];

  // ==========================================
  // ORDER COUNTS
  // ==========================================

  const totalOrders =
    safeOrders.length;

  const deliveredOrders =
    safeOrders.filter(
      (order) =>
        String(
          order.order_status
        ).toLowerCase() === 'delivered'
    ).length;

  const pendingOrders =
    safeOrders.filter(
      (order) =>
        [
          'pending',
          'processing',
          'confirmed',
          'shipped',
        ].includes(
          String(
            order.order_status
          ).toLowerCase()
        )
    ).length;

  const cancelledOrders =
    safeOrders.filter(
      (order) =>
        String(
          order.order_status
        ).toLowerCase() === 'cancelled'
    ).length;

  // ==========================================
  // REVENUE
  // ==========================================

  const totalRevenue =
    safeOrders.reduce(
      (sum, order) => {
        const status =
          String(
            order.order_status
          ).toLowerCase();

        // Cancelled orders should
        // not count as revenue
        if (status === 'cancelled') {
          return sum;
        }

        return (
          sum +
          (Number(order.total) || 0)
        );
      },
      0
    );

  // ==========================================
  // AVERAGE ORDER VALUE
  // ==========================================

  const revenueOrders =
    safeOrders.filter(
      (order) =>
        String(
          order.order_status
        ).toLowerCase() !== 'cancelled'
    );

  const averageOrderValue =
    revenueOrders.length > 0
      ? totalRevenue /
        revenueOrders.length
      : 0;

  // ==========================================
  // DAILY SALES
  // ==========================================

  const dailyMap: Record<
    string,
    {
      orders: number;
      revenue: number;
    }
  > = {};

  safeOrders.forEach((order) => {
    const status =
      String(
        order.order_status
      ).toLowerCase();

    // Cancelled orders
    // excluded from daily sales
    if (status === 'cancelled') {
      return;
    }

    const date = new Date(
      order.created_at
    )
      .toISOString()
      .split('T')[0];

    if (!dailyMap[date]) {
      dailyMap[date] = {
        orders: 0,
        revenue: 0,
      };
    }

    dailyMap[date].orders += 1;

    dailyMap[date].revenue +=
      Number(order.total) || 0;
  });

  const dailySales =
    Object.entries(dailyMap)
      .sort(
        ([dateA], [dateB]) =>
          dateA.localeCompare(dateB)
      )
      .map(
        ([date, value]) => ({
          date,
          orders: value.orders,
          revenue: value.revenue,
        })
      );

  // ==========================================
  // PRODUCTS SOLD
  // ==========================================

  const totalProductsSold =
    safeOrders.reduce(
      (total, order) => {
        const status =
          String(
            order.order_status
          ).toLowerCase();

        // Cancelled orders excluded
        if (status === 'cancelled') {
          return total;
        }

        const items =
          Array.isArray(order.items)
            ? order.items
            : [];

        const itemQuantity =
          items.reduce(
            (
              itemTotal: number,
              item: any
            ) => {
              return (
                itemTotal +
                (Number(
                  item.quantity
                ) || 0)
              );
            },
            0
          );

        return (
          total + itemQuantity
        );
      },
      0
    );

  // ==========================================
  // UNIQUE CUSTOMERS
  // ==========================================

  const customerIds =
    new Set(
      safeOrders
        .filter(
          (order) =>
            String(
              order.order_status
            ).toLowerCase() !==
            'cancelled'
        )
        .map(
          (order) =>
            order.user_id
        )
        .filter(Boolean)
    );

  const totalCustomers =
    customerIds.size;

  // ==========================================
  // FINAL REPORT
  // ==========================================

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
  };
}