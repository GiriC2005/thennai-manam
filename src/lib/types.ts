export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
}

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

export interface OrderItem {
  product_id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size: string;
}

export interface Order {
  courier_name: string;
  tracking_id: string;
  tracking_url: string;
  id: string;
  user_id: string | null;
  order_number: string | null;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  delivery_charge: number;
  total: number;
  address: {
    fullName: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  payment_method: string;
  payment_status: string;
  order_status: string;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  role: string;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order: number;
  active: boolean;
}

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
