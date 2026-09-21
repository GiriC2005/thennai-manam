// =====================================================
// CATEGORY
// =====================================================

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
}


// =====================================================
// PRODUCT
// =====================================================

export interface Product {
  id: string;
  name: string;
  slug: string;

  description: string | null;
  short_description: string | null;

  category_id: string | null;

  images: string[];

  price: number;
  mrp: number | null;
  discount: number;

  sizes: string[];

  stock: number;

  rating: number;
  review_count: number;

  ingredients: string | null;
  benefits: string | null;
  how_to_use: string | null;
  storage_instructions: string | null;

  featured: boolean;
  best_seller: boolean;

  created_at: string;

  category?: Category | null;
}


// =====================================================
// REVIEW
// =====================================================

export interface Review {
  id: string;

  product_id: string;

  user_id: string | null;

  user_name: string;

  user_location: string | null;

  rating: number;

  comment: string | null;

  approved: boolean;

  created_at: string;
}


// =====================================================
// ORDER ITEM
// =====================================================

export interface OrderItem {
  product_id: string;

  name: string;

  image: string;

  price: number;

  quantity: number;

  size: string;
}


// =====================================================
// ORDER ADDRESS
// =====================================================

export interface OrderAddress {
  fullName: string;

  phone: string;

  line1: string;

  line2?: string;

  city: string;

  state: string;

  pincode: string;
}


// =====================================================
// ORDER
// =====================================================

export interface Order {
  id: string;

  user_id: string | null;

  order_number: string | null;

  items: OrderItem[];

  subtotal: number;

  discount: number;

  delivery_charge: number;

  total: number;

  address: OrderAddress;

  payment_method: string;

  payment_status: string;

  order_status: string;

  // Delivery tracking
  courier_name: string | null;

  tracking_id: string | null;

  tracking_url: string | null;

  created_at: string;
}


// =====================================================
// PROFILE
// =====================================================

export interface Profile {
  id: string;

  email: string | null;

  full_name: string | null;

  phone: string | null;

  role: string;

  created_at: string;
}


// =====================================================
// COUPON
// =====================================================

export interface Coupon {
  id: string;

  code: string;

  discount_type: string;

  discount_value: number;

  // Minimum order amount
  min_order: number;

  // Optional database field used by
  // coupon validation
  minimum_order_amount?: number | null;

  // Coupon expiry
  expires_at?: string | null;

  // Usage restriction
  usage_limit?: number | null;

  // Number of times coupon has been used
  used_count?: number | null;

  active: boolean;

  created_at?: string;

  updated_at?: string;
}


// =====================================================
// CART ITEM
// =====================================================

export interface CartItem {
  product_id: string;

  name: string;

  slug: string;

  image: string;

  price: number;

  mrp: number;

  quantity: number;

  size: string;

  stock: number;
}


// =====================================================
// HERO BANNER
// =====================================================

export interface HeroBanner {
  id: string;

  title: string | null;

  subtitle: string | null;

  offer_text: string | null;

  desktop_image_url: string;

  mobile_image_url: string | null;

  button_text: string | null;

  button_link: string | null;

  sort_order: number;

  is_active: boolean;

  created_at: string;

  updated_at: string;
}


// =====================================================
// HERO BANNER INPUT
// Used when creating a new banner
// =====================================================

export type HeroBannerInput = {
  title?: string | null;

  subtitle?: string | null;

  offer_text?: string | null;

  desktop_image_url: string;

  mobile_image_url?: string | null;

  button_text?: string | null;

  button_link?: string | null;

  sort_order?: number;

  is_active?: boolean;
};