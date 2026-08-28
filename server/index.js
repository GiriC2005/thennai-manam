import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import express from 'express';
import crypto from 'node:crypto';
import cors from 'cors';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

dotenv.config({
  path: fileURLToPath(new URL('./.env', import.meta.url)),
});

/* =====================================================
   APP
===================================================== */

const app = express();

/* =====================================================
   ENVIRONMENT
===================================================== */

const port = process.env.PORT || 4000;

const supabaseUrl =
  process.env.VITE_SUPABASE_URL;

const anonKey =
  process.env.VITE_SUPABASE_ANON_KEY;

const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

/* =====================================================
   CORS
===================================================== */

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://thennaimanam.netlify.app',,
  'https://thennai-manam-api.onrender.com',
  

];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without origin
      // such as Postman/server-to-server requests
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log('CORS BLOCKED:', origin);

      return callback(
        new Error('Not allowed by CORS')
      );
    },

    credentials: true,

    methods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS',
    ],

    allowedHeaders: [
      'Content-Type',
      'Authorization',
    ],
  })
);

/*
  Explicitly handle preflight requests.
*/

app.use(express.json());

/* =====================================================
   ENV VALIDATION
===================================================== */

if (!supabaseUrl || !anonKey || !serviceKey) {
  throw new Error(
    'Missing Supabase environment variables. Check server/.env'
  );
}

/* =====================================================
   SUPABASE
===================================================== */

const db = createClient(
  supabaseUrl,
  serviceKey
);

const authClient = createClient(
  supabaseUrl,
  anonKey
);

/* =====================================================
   RAZORPAY
===================================================== */

const razorpay =
  process.env.RAZORPAY_KEY_ID &&
  process.env.RAZORPAY_KEY_SECRET
    ? new Razorpay({
        key_id:
          process.env.RAZORPAY_KEY_ID,

        key_secret:
          process.env.RAZORPAY_KEY_SECRET,
      })
    : null;

/* =====================================================
   HELPERS
===================================================== */

function orderNumber() {
  return `PCO-${Date.now()
    .toString(36)
    .toUpperCase()}-${crypto
    .randomBytes(3)
    .toString('hex')
    .toUpperCase()}`;
}

/* =====================================================
   AUTH MIDDLEWARE
===================================================== */

async function auth(req, res, next) {
  try {
    const token = (
      req.headers.authorization || ''
    ).replace(/^Bearer\s+/i, '');

    if (!token) {
      return res.status(401).json({
        error: 'Authentication required',
      });
    }

    const {
      data,
      error,
    } = await authClient.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({
        error: 'Invalid session',
      });
    }

    req.user = data.user;
    req.token = token;

    next();
  } catch (error) {
    console.error(
      'AUTH ERROR:',
      error
    );

    return res.status(401).json({
      error: 'Authentication failed',
    });
  }
}

/* =====================================================
   ADMIN MIDDLEWARE
===================================================== */

async function admin(req, res, next) {
  try {
    const {
      data,
      error,
    } = await db
      .from('profiles')
      .select('role')
      .eq('id', req.user.id)
      .maybeSingle();

    if (error) {
      console.error(
        'ADMIN PROFILE ERROR:',
        error
      );

      return res.status(500).json({
        error: error.message,
      });
    }

    if (data?.role !== 'admin') {
      return res.status(403).json({
        error: 'Admin access required',
      });
    }

    next();
  } catch (error) {
    console.error(
      'ADMIN ERROR:',
      error
    );

    return res.status(500).json({
      error: 'Admin authentication failed',
    });
  }
}

/* =====================================================
   HEALTH CHECK
===================================================== */

app.get(
  '/api/health',
  (req, res) => {
    res.json({
      ok: true,
      razorpay: !!razorpay,
      server: 'running',
    });
  }
);

/* =====================================================
   TEST ADMIN ORDER ROUTE
===================================================== */

app.get(
  '/api/test-admin-order-route',
  (req, res) => {
    res.json({
      ok: true,
      message:
        'ADMIN ORDER ROUTE FILE IS RUNNING',
    });
  }
);

/* =====================================================
   RAZORPAY - CREATE ORDER
===================================================== */

app.post(
  '/api/payments/create-order',
  auth,
  async (req, res) => {
    try {
      if (!razorpay) {
        return res.status(503).json({
          error:
            'Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to server .env',
        });
      }

      const amount = Math.round(
        Number(req.body.amount) * 100
      );

      if (
        !Number.isFinite(amount) ||
        amount <= 0
      ) {
        return res.status(400).json({
          error: 'Invalid amount',
        });
      }

      const rp =
        await razorpay.orders.create({
          amount,
          currency: 'INR',
          receipt: orderNumber(),
          notes: {
            user_id: req.user.id,
          },
        });

      return res.json({
        id: rp.id,
        amount: rp.amount,
        currency: rp.currency,
        keyId:
          process.env.RAZORPAY_KEY_ID,
      });
    } catch (error) {
      console.error(
        'RAZORPAY CREATE ERROR:',
        error
      );

      return res.status(500).json({
        error:
          error?.error?.description ||
          error?.message ||
          'Unable to create payment order',
      });
    }
  }
);

/* =====================================================
   RAZORPAY - VERIFY PAYMENT
===================================================== */

app.post(
  '/api/payments/verify',
  auth,
  async (req, res) => {
    try {
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        order,
      } = req.body;

      if (
        !razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature ||
        !order
      ) {
        return res.status(400).json({
          error:
            'Missing payment/order data',
        });
      }

      if (
        !process.env.RAZORPAY_KEY_SECRET
      ) {
        return res.status(503).json({
          error:
            'Razorpay secret key is not configured',
        });
      }

      const expected = crypto
        .createHmac(
          'sha256',
          process.env.RAZORPAY_KEY_SECRET
        )
        .update(
          `${razorpay_order_id}|${razorpay_payment_id}`
        )
        .digest('hex');

      const expectedBuffer =
        Buffer.from(expected);

      const signatureBuffer =
        Buffer.from(
          razorpay_signature
        );

      if (
        expectedBuffer.length !==
          signatureBuffer.length ||
        !crypto.timingSafeEqual(
          expectedBuffer,
          signatureBuffer
        )
      ) {
        return res.status(400).json({
          error:
            'Payment signature verification failed',
        });
      }

      const {
        data,
        error,
      } = await db
        .from('orders')
        .insert({
          user_id: req.user.id,

          order_number:
            orderNumber(),

          items:
            order.items,

          subtotal:
            order.subtotal,

          discount:
            order.discount || 0,

          delivery_charge:
            order.delivery_charge || 0,

          total:
            order.total,

          address:
            order.address,

          payment_method:
            'razorpay',

          payment_status:
            'paid',

          order_status:
            'confirmed',

          razorpay_order_id,

          razorpay_payment_id,

          razorpay_signature,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return res.json({
        order: data,
      });
    } catch (error) {
      console.error(
        'RAZORPAY VERIFY ERROR:',
        error
      );

      return res.status(500).json({
        error:
          error?.message ||
          'Payment verification failed',
      });
    }
  }
);

/* =====================================================
   COD ORDER
===================================================== */

app.post(
  '/api/orders/cod',
  auth,
  async (req, res) => {
    try {
      const orderData = req.body;

      const {
        data,
        error,
      } = await db
        .from('orders')
        .insert({
          ...orderData,

          user_id:
            req.user.id,

          order_number:
            orderNumber(),

          payment_method:
            'cod',

          payment_status:
            'pending',

          order_status:
            'pending',
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return res.json({
        order: data,
      });
    } catch (error) {
      console.error(
        'COD ORDER ERROR:',
        error
      );

      return res.status(500).json({
        error:
          error?.message ||
          'Unable to place order',
      });
    }
  }
);

/* =====================================================
   USER - GET ORDERS
===================================================== */

app.get(
  '/api/orders',
  auth,
  async (req, res) => {
    try {
      const {
        data,
        error,
      } = await db
        .from('orders')
        .select('*')
        .eq(
          'user_id',
          req.user.id
        )
        .order(
          'created_at',
          {
            ascending: false,
          }
        );

      if (error) {
        return res.status(500).json({
          error:
            error.message,
        });
      }

      return res.json({
        orders:
          data || [],
      });
    } catch (error) {
      console.error(
        'USER ORDERS ERROR:',
        error
      );

      return res.status(500).json({
        error:
          error?.message ||
          'Unable to fetch orders',
      });
    }
  }
);

/* =====================================================
   USER - SINGLE ORDER
===================================================== */

app.get(
  '/api/orders/:id',
  auth,
  async (req, res) => {
    try {
      const {
        data,
        error,
      } = await db
        .from('orders')
        .select('*')
        .eq(
          'id',
          req.params.id
        )
        .eq(
          'user_id',
          req.user.id
        )
        .maybeSingle();

      if (error) {
        return res.status(500).json({
          error:
            error.message,
        });
      }

      if (!data) {
        return res.status(404).json({
          error:
            'Order not found',
        });
      }

      return res.json({
        order: data,
      });
    } catch (error) {
      console.error(
        'GET ORDER ERROR:',
        error
      );

      return res.status(500).json({
        error:
          error?.message ||
          'Unable to fetch order',
      });
    }
  }
);

/* =====================================================
   USER - CANCEL ORDER
===================================================== */

app.patch(
  '/api/orders/:id/cancel',
  auth,
  async (req, res) => {
    try {
      const orderId =
        req.params.id;

      const {
        data: existingOrder,
        error: fetchError,
      } = await db
        .from('orders')
        .select('*')
        .eq(
          'id',
          orderId
        )
        .eq(
          'user_id',
          req.user.id
        )
        .maybeSingle();

      if (fetchError) {
        return res.status(500).json({
          error:
            fetchError.message,
        });
      }

      if (!existingOrder) {
        return res.status(404).json({
          error:
            'Order not found',
        });
      }

      const cancellableStatuses = [
        'pending',
        'confirmed',
      ];

      if (
        !cancellableStatuses.includes(
          existingOrder.order_status
        )
      ) {
        return res.status(400).json({
          error:
            'Order can no longer be cancelled',
        });
      }

      const {
        data,
        error,
      } = await db
        .from('orders')
        .update({
          order_status:
            'cancelled',
        })
        .eq(
          'id',
          orderId
        )
        .eq(
          'user_id',
          req.user.id
        )
        .select()
        .single();

      if (error) {
        return res.status(500).json({
          error:
            error.message,
        });
      }

      return res.json({
        order: data,
      });
    } catch (error) {
      console.error(
        'CANCEL ORDER ERROR:',
        error
      );

      return res.status(500).json({
        error:
          error?.message ||
          'Unable to cancel order',
      });
    }
  }
);

/* =====================================================
   USER - UPDATE ORDER ADDRESS
===================================================== */

app.patch(
  '/api/orders/:id/address',
  auth,
  async (req, res) => {
    try {
      const orderId =
        req.params.id;

      const {
        address,
      } = req.body;

      if (!address) {
        return res.status(400).json({
          error:
            'Address is required',
        });
      }

      const {
        data: existingOrder,
        error: fetchError,
      } = await db
        .from('orders')
        .select(
          'id, order_status'
        )
        .eq(
          'id',
          orderId
        )
        .eq(
          'user_id',
          req.user.id
        )
        .maybeSingle();

      if (fetchError) {
        return res.status(500).json({
          error:
            fetchError.message,
        });
      }

      if (!existingOrder) {
        return res.status(404).json({
          error:
            'Order not found',
        });
      }

      const editableStatuses = [
        'pending',
        'confirmed',
      ];

      if (
        !editableStatuses.includes(
          existingOrder.order_status
        )
      ) {
        return res.status(400).json({
          error:
            'Address can only be changed before order processing',
        });
      }

      const {
        data,
        error,
      } = await db
        .from('orders')
        .update({
          address,
        })
        .eq(
          'id',
          orderId
        )
        .eq(
          'user_id',
          req.user.id
        )
        .select()
        .single();

      if (error) {
        return res.status(500).json({
          error:
            error.message,
        });
      }

      return res.json({
        order: data,
      });
    } catch (error) {
      console.error(
        'UPDATE ADDRESS ERROR:',
        error
      );

      return res.status(500).json({
        error:
          error?.message ||
          'Unable to update address',
      });
    }
  }
);

/* =====================================================
   ADMIN - GET ALL ORDERS
===================================================== */

app.get(
  '/api/admin/orders',
  auth,
  admin,
  async (req, res) => {
    try {
      console.log(
        'ADMIN ORDERS REQUEST'
      );

      console.log(
        'Admin user:',
        req.user.id
      );

      const {
        data,
        error,
      } = await db
        .from('orders')
        .select('*')
        .order(
          'created_at',
          {
            ascending: false,
          }
        );

      if (error) {
        return res.status(500).json({
          error:
            error.message,
        });
      }

      console.log(
        'Orders from Supabase:',
        data
      );

      return res.json({
        orders:
          data || [],
      });
    } catch (error) {
      console.error(
        'ADMIN ORDERS ERROR:',
        error
      );

      return res.status(500).json({
        error:
          error?.message ||
          'Unable to fetch admin orders',
      });
    }
  }
);

/* =====================================================
   ADMIN - SINGLE ORDER
===================================================== */

app.get(
  '/api/admin/orders/:id',
  auth,
  admin,
  async (req, res) => {
    try {
      const orderId =
        req.params.id;

      const {
        data,
        error,
      } = await db
        .from('orders')
        .select('*')
        .eq(
          'id',
          orderId
        )
        .maybeSingle();

      if (error) {
        return res.status(500).json({
          error:
            error.message,
        });
      }

      if (!data) {
        return res.status(404).json({
          error:
            'Order not found',
        });
      }

      return res.json({
        order: data,
      });
    } catch (error) {
      console.error(
        'ADMIN SINGLE ORDER ERROR:',
        error
      );

      return res.status(500).json({
        error:
          error?.message ||
          'Unable to fetch order details',
      });
    }
  }
);

/* =====================================================
   ADMIN - UPDATE ORDER STATUS
===================================================== */

app.patch(
  '/api/admin/orders/:id/status',
  auth,
  admin,
  async (req, res) => {
    try {
      const allowedStatuses = [
        'pending',
        'confirmed',
        'processing',
        'shipped',
        'out for delivery',
        'delivered',
        'cancelled',
      ];

      const status =
        req.body.status;

      if (
        !allowedStatuses.includes(
          status
        )
      ) {
        return res.status(400).json({
          error:
            'Invalid status',
        });
      }

      const patch = {
        order_status:
          status,
      };

      if (
        status === 'delivered' &&
        req.body.payment_status
      ) {
        patch.payment_status =
          req.body.payment_status;
      }

      const {
        data,
        error,
      } = await db
        .from('orders')
        .update(patch)
        .eq(
          'id',
          req.params.id
        )
        .select()
        .single();

      if (error) {
        return res.status(500).json({
          error:
            error.message,
        });
      }

      return res.json({
        order: data,
      });
    } catch (error) {
      console.error(
        'UPDATE ORDER STATUS ERROR:',
        error
      );

      return res.status(500).json({
        error:
          error?.message ||
          'Unable to update order status',
      });
    }
  }
);

/* =====================================================
   ADMIN - UPDATE ORDER TRACKING
===================================================== */

app.patch(
  '/api/admin/orders/:id/tracking',
  auth,
  admin,
  async (req, res) => {
    try {
      const {
        courier_name,
        tracking_id,
        tracking_url,
      } = req.body;

      const patch = {
        courier_name:
          courier_name?.trim() ||
          null,

        tracking_id:
          tracking_id?.trim() ||
          null,

        tracking_url:
          tracking_url?.trim() ||
          null,
      };

      const {
        data,
        error,
      } = await db
        .from('orders')
        .update(patch)
        .eq(
          'id',
          req.params.id
        )
        .select()
        .single();

      if (error) {
        return res.status(500).json({
          error:
            error.message,
        });
      }

      return res.json({
        order: data,
      });
    } catch (error) {
      console.error(
        'UPDATE TRACKING ERROR:',
        error
      );

      return res.status(500).json({
        error:
          error?.message ||
          'Unable to update tracking details',
      });
    }
  }
);

/* =====================================================
   ADMIN DASHBOARD
===================================================== */

app.get(
  '/api/admin/dashboard',
  auth,
  admin,
  async (req, res) => {
    try {
      const [
        ordersResult,
        productsResult,
        customersResult,
      ] = await Promise.all([
        db
          .from('orders')
          .select(
            'total,order_status'
          ),

        db
          .from('products')
          .select('id', {
            count: 'exact',
            head: true,
          }),

        db
          .from('profiles')
          .select('id', {
            count: 'exact',
            head: true,
          })
          .eq(
            'role',
            'customer'
          ),
      ]);

      const {
        data: orders,
        error: ordersError,
      } = ordersResult;

      const {
        count: productCount,
        error: productsError,
      } = productsResult;

      const {
        count: customerCount,
        error: customersError,
      } = customersResult;

      if (
        ordersError ||
        productsError ||
        customersError
      ) {
        const error =
          ordersError ||
          productsError ||
          customersError;

        return res.status(500).json({
          error:
            error.message,
        });
      }

      const rows =
        orders || [];

      const totalRevenue =
        rows
          .filter(
            (order) =>
              order.order_status !==
              'cancelled'
          )
          .reduce(
            (
              total,
              order
            ) =>
              total +
              Number(
                order.total || 0
              ),
            0
          );

      const totalOrders =
        rows.length;

      const pendingOrders =
        rows.filter(
          (order) =>
            [
              'pending',
              'confirmed',
              'processing',
            ].includes(
              order.order_status
            )
        ).length;

      const deliveredOrders =
        rows.filter(
          (order) =>
            order.order_status ===
            'delivered'
        ).length;

      return res.json({
        totalRevenue,

        totalOrders,

        pendingOrders,

        deliveredOrders,

        totalProducts:
          productCount || 0,

        totalCustomers:
          customerCount || 0,
      });
    } catch (error) {
      console.error(
        'ADMIN DASHBOARD ERROR:',
        error
      );

      return res.status(500).json({
        error:
          error?.message ||
          'Unable to load dashboard',
      });
    }
  }
);

/* =====================================================
   404
===================================================== */

app.use(
  (req, res) => {
    console.log(
      '404 ROUTE:',
      req.method,
      req.originalUrl
    );

    return res.status(404).json({
      error:
        'API route not found',

      path:
        req.originalUrl,
    });
  }
);

/* =====================================================
   ERROR HANDLER
===================================================== */

app.use(
  (err, req, res, next) => {
    console.error(
      'SERVER ERROR:',
      err
    );

    if (
      err.message ===
      'Not allowed by CORS'
    ) {
      return res.status(403).json({
        error:
          'CORS origin not allowed',
      });
    }

    return res.status(500).json({
      error:
        err.message ||
        'Internal server error',
    });
  }
);

/* =====================================================
   SERVER
===================================================== */

app.listen(
  port,
  () => {
    console.log(
      `API server running on port ${port}`
    );

    console.log(
      'Allowed origins:',
      allowedOrigins
    );

    console.log(
      'Razorpay configured:',
      !!razorpay
    );
  }
);