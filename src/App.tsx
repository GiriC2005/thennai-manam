import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import AdminLayout from '@/layouts/AdminLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import ScrollToTop from '@/components/ScrollToTop';

import Home from '@/pages/Home';
import Shop from '@/pages/Shop';
import ProductDetails from '@/pages/ProductDetails';
import Cart from '@/pages/Cart';
import Wishlist from '@/pages/Wishlist';
import Checkout from '@/pages/Checkout';
import OrderSuccess from '@/pages/OrderSuccess';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Account from '@/pages/Account';
import Orders from '@/pages/Orders';
import OrderDetails from '@/pages/OrderDetails';
import About from '@/pages/About';
import OurProcess from '@/pages/OurProcess';
import WhyPollachi from '@/pages/WhyPollachi';
import Reviews from '@/pages/Reviews';
import Contact from '@/pages/Contact';
import FAQ from '@/pages/FAQ';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import Terms from '@/pages/Terms';
import ShippingPolicy from '@/pages/ShippingPolicy';
import ReturnPolicy from '@/pages/ReturnPolicy';
import SearchPage from '@/pages/SearchPage';
import NotFound from '@/components/NotFound';

import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminProducts from '@/pages/admin/AdminProducts';
import AdminOrders from '@/pages/admin/AdminOrders';
import AdminCustomers from '@/pages/admin/AdminCustomers';
import AdminReviews from '@/pages/admin/AdminReviews';
import AdminCategories from '@/pages/admin/AdminCategories';
import AdminOrderDetails from '@/pages/admin/AdminOrderDetails';
import Reports from '@/pages/admin/AdminReports';

function App() {
  return (
    <BrowserRouter>
     <ScrollToTop />
      <Routes>
        {/* Main site */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:slug" element={<ProductDetails />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/order-success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/orders/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
          <Route path="/about" element={<About />} />
          <Route path="/our-process" element={<OurProcess />} />
          <Route path="/why-pollachi" element={<WhyPollachi />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/shipping-policy" element={<ShippingPolicy />} />
          <Route path="/return-policy" element={<ReturnPolicy />} />
          
        </Route>

        {/* Admin */}
       <Route
  path="/admin"
  element={
    <ProtectedRoute adminOnly>
      <AdminLayout />
    </ProtectedRoute>
  }
>
  <Route index element={<AdminDashboard />} />

  <Route
    path="products"
    element={<AdminProducts />}
  />

  <Route
    path="orders"
    element={<AdminOrders />}
  />

  <Route
    path="orders/:id"
    element={<AdminOrderDetails />}
  />
<Route
  path="reports"
  element={<Reports />}
/>
  <Route
    path="customers"
    element={<AdminCustomers />}
  />

  <Route
    path="reviews"
    element={<AdminReviews />}
  />

  <Route
    path="categories"
    element={<AdminCategories />}
  />
</Route>

        <Route path="*" element={<MainLayout />}>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
