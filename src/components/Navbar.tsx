import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import {
  Search,
  User,
  Heart,
  ShoppingCart,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useToast } from '@/context/ToastContext';

import logo from '@/assets/logo1.png';

export default function Navbar() {
  const [scrolled, setScrolled] =
    useState(false);

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [searchOpen, setSearchOpen] =
    useState(false);

  const [searchQuery, setSearchQuery] =
    useState('');

  const [userMenuOpen, setUserMenuOpen] =
    useState(false);

  const userMenuRef =
    useRef<HTMLDivElement>(null);

  const {
    user,
    profile,
    isAdmin,
    signOut,
  } = useAuth();

  const { totalItems } =
    useCart();

  const {
    count: wishlistCount,
  } = useWishlist();

  const { showToast } =
    useToast();

  const navigate =
    useNavigate();

  const location =
    useLocation();

  // ==========================================
  // SCROLL
  // ==========================================

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener(
      'scroll',
      onScroll
    );

    return () => {
      window.removeEventListener(
        'scroll',
        onScroll
      );
    };
  }, []);

  // ==========================================
  // MOBILE BODY LOCK
  // ==========================================

  useEffect(() => {
    document.body.style.overflow =
      mobileOpen ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  // ==========================================
  // CLOSE USER MENU ON PAGE CHANGE
  // ==========================================

  useEffect(() => {
    setUserMenuOpen(false);
  }, [location.pathname]);

  // ==========================================
  // OUTSIDE CLICK
  // ==========================================

  useEffect(() => {
    if (!userMenuOpen) return;

    const handleClickOutside = (
      event: MouseEvent
    ) => {
      const target =
        event.target as Node;

      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(target)
      ) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener(
      'mousedown',
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );
    };
  }, [userMenuOpen]);

  // ==========================================
  // SEARCH
  // ==========================================

  function handleSearch(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (searchQuery.trim()) {
      navigate(
        `/search?q=${encodeURIComponent(
          searchQuery.trim()
        )}`
      );

      setSearchOpen(false);
      setSearchQuery('');
    }
  }

  // ==========================================
  // NAV LINKS
  // ==========================================

  const navLinks = [
    {
      label: 'Home',
      path: '/',
    },
    {
      label: 'Shop',
      path: '/shop',
    },
    {
      label: 'About',
      path: '/about',
    },
    {
      label: 'Our Process',
      path: '/our-process',
    },
    {
      label: 'Reviews',
      path: '/reviews',
    },
    {
      label: 'Contact',
      path: '/contact',
    },
  ];

  // ==========================================
  // SIGN OUT
  // ==========================================

  async function handleSignOut() {
    setUserMenuOpen(false);
    setMobileOpen(false);

    const result =
      await signOut();

    if (result.error) {
      showToast(
        result.error,
        'error'
      );

      return;
    }

    showToast(
      'Signed out successfully',
      'success'
    );

    navigate('/');
  }

  return (
    <>
      {/* =====================================
          DESKTOP / MAIN HEADER
      ===================================== */}

      <header
        className={`
          fixed
          top-0
          left-0
          right-0
          z-50
          px-3
          sm:px-5
          lg:px-7
          pt-2
          transition-all
          duration-300
        `}
      >
        {/* =================================
            NAVBAR SHAPE
            Cream + Curved Sides + Shadow
        ================================= */}

   <nav 
  className={`
    max-w-7xl 
    mx-auto 
    relative 
    overflow-visible 
    bg-[#FFF8E7]
    backdrop-blur-md 
    border 
    border-black/20
    transition-all 
    duration-300 
    rounded-[32px]
  `} 
>
          {/* =================================
              SUBTLE BOTTOM CURVE
          ================================= */}

          

          {/* =================================
              NAV CONTENT
          ================================= */}

          <div
            className="
              h-20
              px-4
              sm:px-6
              lg:px-7
              flex
              items-center
              justify-between
              gap-4
            "
          >

            {/* =================================
                LOGO
            ================================= */}

            <Link
              to="/"
              onClick={() => {
                setUserMenuOpen(false);
                setMobileOpen(false);
              }}
              className="
                flex
                items-center
                gap-3
                shrink-0
              "
            >
              <img
                src={logo}
                alt="Thennai Manam"
                className="
                  w-30
                  h-12
                  object-contain
                "
              />

              <div className="hidden sm:block">
                <p
                  className="
                    font-heading
                    text-lg
                    font-semibold
                    text-ink
                  "
                >
                  Thennai Manam
                </p>

                <p
                  className="
                    font-tamil
                    text-[10px]
                    text-ink-soft
                  "
                >
                  மரத்தில் ஆட்டிய தூய்மை
                </p>
              </div>
            </Link>

            {/* =================================
                DESKTOP NAV
            ================================= */}

            <div
              className="
                hidden
                lg:flex
                items-center
                gap-6
              "
            >
              {navLinks.map((link) => {
                const isActive =
                  location.pathname ===
                    link.path ||
                  (
                    link.path !== '/' &&
                    location.pathname.startsWith(
                      `${link.path}/`
                    )
                  );

                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() =>
                      setUserMenuOpen(false)
                    }
                    className={`
                      relative
                      py-2
                      text-sm
                      font-medium
                      transition-all
                      duration-200

                      ${
                        isActive
                          ? 'text-palm'
                          : 'text-ink-soft hover:text-palm'
                      }
                    `}
                  >
                    {link.label}

                    {isActive && (
                      <span
                        className="
                          absolute
                          left-1/2
                          -translate-x-1/2
                          -bottom-1
                          w-5
                          h-0.5
                          bg-gold
                          rounded-full
                        "
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* =================================
                ACTIONS
            ================================= */}

            <div
              className="
                flex
                items-center
                gap-1
                sm:gap-2
              "
            >

              {/* SEARCH */}

              <button
                type="button"
                onClick={() => {
                  setSearchOpen(
                    (s) => !s
                  );

                  setUserMenuOpen(false);
                }}
                className="
                  p-2
                  rounded-full
                  text-ink
                  hover:bg-palm/5
                  hover:text-palm
                  transition-all
                "
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* =================================
                  USER
              ================================= */}

              {user ? (
                <div
                  ref={userMenuRef}
                  className="relative"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(
                        (s) => !s
                      );

                      setSearchOpen(false);
                    }}
                    className="
                      p-2
                      rounded-full
                      text-ink
                      hover:bg-palm/5
                      hover:text-palm
                      transition-all
                      flex
                      items-center
                      gap-1
                    "
                    aria-label="Account"
                    aria-expanded={
                      userMenuOpen
                    }
                  >
                    <User className="w-5 h-5" />

                    <ChevronDown
                      className={`
                        w-3
                        h-3
                        text-ink-soft
                        hidden
                        sm:block
                        transition-transform
                        ${
                          userMenuOpen
                            ? 'rotate-180'
                            : ''
                        }
                      `}
                    />
                  </button>

                  {/* USER DROPDOWN */}

                  {userMenuOpen && (
                    <div
                      className="
                        absolute
                        right-0
                        mt-3
                        w-56
                        bg-card
                        rounded-2xl
                        border
                        border-ink/10
                        shadow-2xl
                        py-2
                        z-[70]
                        animate-scale-in
                      "
                    >
                      <div
                        className="
                          px-4
                          py-3
                          border-b
                          border-ink/5
                        "
                      >
                        <p
                          className="
                            text-sm
                            font-medium
                            text-ink
                            truncate
                          "
                        >
                          {profile?.full_name ||
                            user.email}
                        </p>

                        <p
                          className="
                            text-xs
                            text-ink-soft
                            truncate
                            mt-0.5
                          "
                        >
                          {user.email}
                        </p>
                      </div>

                      <Link
                        to="/account"
                        onClick={() =>
                          setUserMenuOpen(false)
                        }
                        className="
                          block
                          px-4
                          py-2.5
                          text-sm
                          text-ink-soft
                          hover:bg-palm/5
                          hover:text-palm
                          transition-colors
                        "
                      >
                        My Account
                      </Link>

                      <Link
                        to="/orders"
                        onClick={() =>
                          setUserMenuOpen(false)
                        }
                        className="
                          block
                          px-4
                          py-2.5
                          text-sm
                          text-ink-soft
                          hover:bg-palm/5
                          hover:text-palm
                          transition-colors
                        "
                      >
                        My Orders
                      </Link>

                      <Link
                        to="/wishlist"
                        onClick={() =>
                          setUserMenuOpen(false)
                        }
                        className="
                          block
                          px-4
                          py-2.5
                          text-sm
                          text-ink-soft
                          hover:bg-palm/5
                          hover:text-palm
                          transition-colors
                        "
                      >
                        Wishlist
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() =>
                            setUserMenuOpen(false)
                          }
                          className="
                            block
                            px-4
                            py-2.5
                            text-sm
                            text-gold-deep
                            font-medium
                            hover:bg-gold/5
                            transition-colors
                          "
                        >
                          Admin Dashboard
                        </Link>
                      )}

                      <div
                        className="
                          h-px
                          bg-ink/5
                          my-1
                        "
                      />

                      <button
                        type="button"
                        onClick={
                          handleSignOut
                        }
                        className="
                          block
                          w-full
                          text-left
                          px-4
                          py-2.5
                          text-sm
                          text-copper
                          hover:bg-copper/5
                          transition-colors
                        "
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="
                    p-2
                    rounded-full
                    text-ink
                    hover:bg-palm/5
                    hover:text-palm
                    transition-all
                  "
                  aria-label="Login"
                >
                  <User className="w-5 h-5" />
                </Link>
              )}

              {/* =================================
                  WISHLIST
              ================================= */}

              <Link
                id="wishlist-target"
                to="/wishlist"
                onClick={() => {
                  setUserMenuOpen(false);
                }}
                className="
                  p-2
                  rounded-full
                  text-ink
                  hover:bg-palm/5
                  hover:text-palm
                  transition-all
                  relative
                "
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />

                {wishlistCount > 0 && (
                  <span
                    className="
                      absolute
                      -top-0.5
                      -right-0.5
                      min-w-4
                      h-4
                      px-1
                      rounded-full
                      bg-copper
                      text-white
                      text-[10px]
                      font-bold
                      flex
                      items-center
                      justify-center
                    "
                  >
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* =================================
                  CART
              ================================= */}

              <Link
                id="cart-target"
                to="/cart"
                onClick={() => {
                  setUserMenuOpen(false);
                }}
                className="
                  p-2
                  rounded-full
                  text-ink
                  hover:bg-palm/5
                  hover:text-palm
                  transition-all
                  relative
                "
                aria-label="Cart"
              >
                <ShoppingCart className="w-5 h-5" />

                {totalItems > 0 && (
                  <span
                    className="
                      absolute
                      -top-0.5
                      -right-0.5
                      min-w-4
                      h-4
                      px-1
                      rounded-full
                      bg-palm
                      text-white
                      text-[10px]
                      font-bold
                      flex
                      items-center
                      justify-center
                    "
                  >
                    {totalItems}
                  </span>
                )}
              </Link>

              {/* =================================
                  MOBILE MENU BUTTON
              ================================= */}

              <button
                type="button"
                onClick={() => {
                  setMobileOpen(true);
                  setUserMenuOpen(false);
                }}
                className="
                  p-2
                  rounded-full
                  text-ink
                  hover:bg-palm/5
                  hover:text-palm
                  transition-all
                  lg:hidden
                "
                aria-label="Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* =================================
              SEARCH BAR
          ================================= */}

          {searchOpen && (
            <div
              className="
                px-4
                sm:px-6
                lg:px-7
                pb-4
                animate-fade-in-down
              "
            >
              <form
                onSubmit={handleSearch}
                className="
                  flex
                  gap-2
                "
              >
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) =>
                    setSearchQuery(
                      e.target.value
                    )
                  }
                  placeholder="Search for coconut oil, hair care, combo packs..."
                  className="
                    input-field
                    bg-white
                    border-ink/10
                  "
                  autoFocus
                />

                <button
                  type="submit"
                  className="
                    btn-primary
                    shrink-0
                  "
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </nav>
      </header>

      {/* =========================================
          MOBILE MENU
      ========================================= */}

      {mobileOpen && (
        <div
          className="
            fixed
            inset-0
            z-[60]
            lg:hidden
          "
        >
          {/* OVERLAY */}

          <div
            className="
              absolute
              inset-0
              bg-ink/30
              backdrop-blur-sm
            "
            onClick={() =>
              setMobileOpen(false)
            }
          />

          {/* DRAWER */}

          <div
            className="
              absolute
              right-0
              top-0
              bottom-0
              w-80
              max-w-[85vw]
              bg-bg
              shadow-2xl
              animate-slide-in-right
              overflow-y-auto
              rounded-l-[32px]
            "
          >
            {/* DRAWER HEADER */}

            <div
              className="
                flex
                items-center
                justify-between
                p-4
                border-b
                border-ink/5
              "
            >
              <div className="flex items-center gap-3">
                <img
                  src={logo}
                  alt="Thennai Manam"
                  className="
                    w-24
                    h-10
                    object-contain
                  "
                />

                <span
                  className="
                    font-heading
                    font-semibold
                    text-ink
                  "
                >
                  Menu
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  setMobileOpen(false)
                }
                className="
                  p-2
                  rounded-full
                  hover:bg-palm/5
                  text-ink
                  transition-colors
                "
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* MENU LINKS */}

            <div
              className="
                p-4
                flex
                flex-col
                gap-1
              "
            >
              {navLinks.map((link) => {
                const isActive =
                  location.pathname ===
                    link.path ||
                  (
                    link.path !== '/' &&
                    location.pathname.startsWith(
                      `${link.path}/`
                    )
                  );

                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => {
                      setMobileOpen(false);
                      setUserMenuOpen(false);
                    }}
                    className={`
                      px-4
                      py-3
                      text-base
                      font-medium
                      rounded-xl
                      transition-colors

                      ${
                        isActive
                          ? 'bg-palm/10 text-palm'
                          : 'text-ink-soft hover:text-palm hover:bg-palm/5'
                      }
                    `}
                  >
                    {link.label}
                  </Link>
                );
              })}

              <div
                className="
                  h-px
                  bg-ink/5
                  my-2
                "
              />

              {/* WISHLIST */}

              <Link
                to="/wishlist"
                onClick={() =>
                  setMobileOpen(false)
                }
                className="
                  px-4
                  py-3
                  text-base
                  font-medium
                  text-ink-soft
                  hover:text-palm
                  hover:bg-palm/5
                  rounded-xl
                  transition-colors
                "
              >
                Wishlist
              </Link>

              {/* USER */}

              {user ? (
                <>
                  <Link
                    to="/account"
                    onClick={() =>
                      setMobileOpen(false)
                    }
                    className="
                      px-4
                      py-3
                      text-base
                      font-medium
                      text-ink-soft
                      hover:text-palm
                      hover:bg-palm/5
                      rounded-xl
                      transition-colors
                    "
                  >
                    My Account
                  </Link>

                  <Link
                    to="/orders"
                    onClick={() =>
                      setMobileOpen(false)
                    }
                    className="
                      px-4
                      py-3
                      text-base
                      font-medium
                      text-ink-soft
                      hover:text-palm
                      hover:bg-palm/5
                      rounded-xl
                      transition-colors
                    "
                  >
                    My Orders
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() =>
                        setMobileOpen(false)
                      }
                      className="
                        px-4
                        py-3
                        text-base
                        font-medium
                        text-gold-deep
                        hover:bg-gold/10
                        rounded-xl
                        transition-colors
                      "
                    >
                      Admin Dashboard
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={
                      handleSignOut
                    }
                    className="
                      px-4
                      py-3
                      text-base
                      font-medium
                      text-copper
                      hover:bg-copper/5
                      rounded-xl
                      text-left
                      transition-colors
                    "
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() =>
                      setMobileOpen(false)
                    }
                    className="
                      px-4
                      py-3
                      text-base
                      font-medium
                      text-ink-soft
                      hover:text-palm
                      hover:bg-palm/5
                      rounded-xl
                      transition-colors
                    "
                  >
                    Login
                  </Link>

                  <Link
                    to="/register"
                    onClick={() =>
                      setMobileOpen(false)
                    }
                    className="
                      px-4
                      py-3
                      text-base
                      font-medium
                      text-ink-soft
                      hover:text-palm
                      hover:bg-palm/5
                      rounded-xl
                      transition-colors
                    "
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}