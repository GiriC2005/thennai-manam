import { Link } from 'react-router-dom';

import {
  Leaf,
  TreePine,
  Droplets,
  Truck,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import { useEffect, useState } from 'react';

import AOS from 'aos';
import 'aos/dist/aos.css';
import flipkartImg from '@/assets/flipkart.png';
import amazonImg from '@/assets/amazon.png';
import meeshoImg from '@/assets/meesho.png';
import fssaiImg from '@/assets/fssai.png';
import blinkitImg from '@/assets/blinkit.png';
import jiomartImg from '@/assets/jiomart.png';
import snapdealImg from '@/assets/snapdeal.png';
import type {
  Product,
  Category,
  Review,
  HeroBanner,
} from '@/lib/types';

import {
  getProducts,
  getCategories,
  getReviews,
  getHeroBanners,
} from '@/services/api';

import ProductCard from '@/components/ProductCard';
import ProductCardSkeleton from '@/components/ProductCardSkeleton';
import StarRating from '@/components/StarRating';

import heroimg from '@/assets/hero.png';


export default function Home() {
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  const [heroBanners, setHeroBanners] = useState<HeroBanner[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  const [loading, setLoading] = useState(true);


  /* =========================================
     HERO SLIDER
     ONLY IMAGES COME FROM ADMIN
  ========================================= */

  const heroSlides =
    heroBanners.length > 0
      ? heroBanners
      : [
          {
            id: 'default-hero',
            desktop_image_url: heroimg,
            mobile_image_url: heroimg,
          } as HeroBanner,
        ];


  function nextSlide() {
    setCurrentSlide((prev) =>
      prev === heroSlides.length - 1 ? 0 : prev + 1
    );
  }


  function prevSlide() {
    setCurrentSlide((prev) =>
      prev === 0 ? heroSlides.length - 1 : prev - 1
    );
  }


  /* =========================================
     AUTO HERO SLIDER
  ========================================= */

  useEffect(() => {
    if (heroSlides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) =>
        prev === heroSlides.length - 1 ? 0 : prev + 1
      );
    }, 5000);

    return () => clearInterval(timer);
  }, [heroSlides.length]);


  /* =========================================
     RESET SLIDE WHEN BANNERS CHANGE
  ========================================= */

  useEffect(() => {
    if (currentSlide >= heroSlides.length) {
      setCurrentSlide(0);
    }
  }, [heroSlides.length, currentSlide]);


  /* =========================================
     AOS INITIALIZATION
  ========================================= */

  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 70,
      delay: 0,
      disable: false,
    });

    const timer = setTimeout(() => {
      AOS.refresh();
    }, 500);

    return () => clearTimeout(timer);
  }, []);


  /* =========================================
     LOAD PRODUCTS + CATEGORIES + HERO
  ========================================= */

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [
          products,
          cats,
          banners,
        ] = await Promise.all([
          getProducts({
            bestSeller: true,
            limit: 4,
          }),

          getCategories(),

          getHeroBanners(),
        ]);

        setBestSellers(products);
        setCategories(cats);

        /*
          IMPORTANT:
          Only image fields are used from hero banners.
          Title / subtitle / offer text are NOT used.
        */
        setHeroBanners(
          Array.isArray(banners)
            ? banners.filter(
                (banner) =>
                  banner.is_active !== false &&
                  !!banner.desktop_image_url
              )
            : []
        );
      } catch (error) {
        console.error(
          'Home data loading error:',
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadHomeData();
  }, []);


  /* =========================================
     REVIEWS
  ========================================= */

  useEffect(() => {
    (async () => {
      try {
        const products = await getProducts({
          limit: 8,
        });

        const allReviews: Review[] = [];

        for (const product of products) {
          const productReviews =
            await getReviews(product.id);

          allReviews.push(
            ...productReviews.slice(0, 1)
          );
        }

        setReviews(
          allReviews.slice(0, 3)
        );
      } catch {
        // Ignore review loading errors
      }
    })();
  }, []);


  /* =========================================
     REFRESH AOS
  ========================================= */

  useEffect(() => {
    const timer = setTimeout(() => {
      AOS.refresh();
    }, 300);

    return () => clearTimeout(timer);
  }, [
    categories,
    bestSellers,
    reviews,
    heroBanners,
  ]);


  return (
    <div className="overflow-x-hidden">


      {/* =========================================
          HERO
      ========================================= */}

      <section className="relative overflow-hidden bg-gradient-to-br from-bg via-bg to-bg-warm">

        <div className="container-page pt-2 pb-12 lg:pt-4 lg:pb-20">

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">


            {/* =====================================
                HERO CONTENT
                OLD CONTENT - UNCHANGED
            ===================================== */}

            <div
              data-aos="fade-up"
              data-aos-duration="900"
            >

              {/* Badge */}

              <div
                data-aos="fade-down"
                data-aos-delay="100"
                className="
                  inline-flex
                  items-center
                  gap-2
                  px-4
                  py-2
                  rounded-full
                  bg-palm/10
                  text-palm
                  text-sm
                  font-medium
                  mb-6
                "
              >
                <Leaf className="w-4 h-4" />

                Farm-to-bottle, Pollachi
              </div>


              {/* Heading */}

              <h1
                data-aos="fade-up"
                data-aos-delay="150"
                className="
                  font-heading
                  text-4xl
                  lg:text-5xl
                  font-semibold
                  text-ink
                  leading-tight
                  mb-2
                "
              >
                மரச்செக்கில் ஆட்டிய
                <br />
                தூய்மை
              </h1>


              {/* Subtitle */}

              <p
                data-aos="fade-up"
                data-aos-delay="250"
                className="
                  font-heading
                  text-2xl
                  lg:text-3xl
                  text-ink-soft
                  mb-6
                "
              >
                Cold-pressed & The Marachekku Way.
              </p>


              {/* Description */}

              <p
                data-aos="fade-up"
                data-aos-delay="350"
                className="
                  text-ink-soft
                  text-base
                  lg:text-lg
                  leading-relaxed
                  max-w-lg
                  mb-5
                "
              >
                From Pollachi coconut farms to your kitchen.
                Traditional wood pressing, no unnecessary heat,
                no chemicals — freshly bottled.
              </p>


              {/* Buttons */}

              <div
                data-aos="fade-up"
                data-aos-delay="450"
                className="flex flex-wrap gap-3"
              >

                <Link
                  to="/shop"
                  className="btn-primary"
                >
                  Shop the Oil

                  <ArrowRight className="w-3 h-4" />
                </Link>


                <Link
                  to="/our-process"
                  className="btn-secondary"
                >
                  Our Process
                </Link>

              </div>


              {/* Stats */}

              {/* <div
                data-aos="fade-up"
                data-aos-delay="550"
                className="
                  grid
                  grid-cols-4
                  gap-3
                  sm:gap-4
                  mt-12
                  pt-8
                  border-t
                  border-ink/10
                "
              >

                <Stat
                  value="40+"
                  label="Partner Farms"
                />

                <Stat
                  value="1st"
                  label="Quality"
                />

                <div className="text-center">

                  <p
                    className="
                      font-heading
                      text-xl
                      lg:text-2xl
                      text-ink
                      font-semibold
                    "
                  >
                    Fresh
                  </p>

                  <p className="text-xs text-ink-soft">
                    Carefully Bottled
                  </p>

                </div>

                <Stat
                  value="0"
                  label="Preservatives"
                />

              </div> */}

            </div>


    {/* =====================================
    HERO IMAGE
    ONLY IMAGE COMES FROM ADMIN
===================================== */}

<div
  data-aos="fade-up"
  data-aos-duration="900"
  data-aos-delay="250"
  className="
    relative
    w-full
    lg:mt-8
  "
>
  <div
    className="
      relative
      w-full
      aspect-[16/9]
      rounded-2xl
      sm:rounded-3xl
      overflow-hidden
      shadow-3xl
      bg-bg-warm
    "
  >

    {/* =================================
        HERO SLIDES
    ================================= */}

    {heroSlides.map((banner, index) => {
      const desktopImage =
        banner.desktop_image_url;

      const mobileImage =
        banner.mobile_image_url ||
        banner.desktop_image_url;

      return (
        <picture
          key={
            banner.id ||
            index
          }
          className={`
            absolute
            inset-0
            block
            transition-all
            duration-700
            ease-in-out
            ${
              currentSlide === index
                ? 'opacity-100'
                : 'opacity-0'
            }
          `}
        >

          {/* Mobile image */}
          <source
            media="(max-width: 639px)"
            srcSet={mobileImage}
          />

          {/* Desktop image */}
          <img
            src={desktopImage}
            alt="Thennai Manam Coconut Oil"
            loading={
              index === 0
                ? 'eager'
                : 'lazy'
            }
            // fetchPriority={
            //   index === 0
            //     ? 'high'
            //     : 'low'
            // }
            decoding="async"
            className="
              w-full
              h-full
              object-cover
              object-center
              block
            "
          />

        </picture>
      );
    })}

    {/* =================================
        GRADIENT
    ================================= */}

    <div
      className="
        absolute
        inset-0
        bg-gradient-to-t
        from-ink/20
        via-transparent
        to-transparent
        pointer-events-none
        z-[2]
      "
    />

    {/* =================================
        PREVIOUS BUTTON
    ================================= */}

    {heroSlides.length > 1 && (
      <button
        type="button"
        onClick={prevSlide}
        aria-label="Previous image"
        className="
          absolute
          left-3
          sm:left-4
          top-1/2
          -translate-y-1/2
          w-9
          h-9
          sm:w-10
          sm:h-10
          rounded-full
          bg-white/90
          backdrop-blur-sm
          text-ink
          flex
          items-center
          justify-center
          shadow-md
          hover:bg-white
          hover:scale-105
          transition-all
          z-10
        "
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
    )}

    {/* =================================
        NEXT BUTTON
    ================================= */}

    {heroSlides.length > 1 && (
      <button
        type="button"
        onClick={nextSlide}
        aria-label="Next image"
        className="
          absolute
          right-3
          sm:right-4
          top-1/2
          -translate-y-1/2
          w-9
          h-9
          sm:w-10
          sm:h-10
          rounded-full
          bg-white/90
          backdrop-blur-sm
          text-ink
          flex
          items-center
          justify-center
          shadow-md
          hover:bg-white
          hover:scale-105
          transition-all
          z-10
        "
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    )}

    {/* =================================
        SLIDER DOTS
    ================================= */}

    {heroSlides.length > 1 && (
      <div
        className="
          absolute
          bottom-4
          left-1/2
          -translate-x-1/2
          flex
          items-center
          gap-2
          z-10
        "
      >
        {heroSlides.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() =>
              setCurrentSlide(index)
            }
            aria-label={`Go to slide ${
              index + 1
            }`}
            className={`
              h-2
              rounded-full
              transition-all
              duration-300
              ${
                currentSlide === index
                  ? 'w-7 bg-gold'
                  : 'w-2 bg-white/70 hover:bg-white'
              }
            `}
          />
        ))}
      </div>
    )}

  </div>
</div>
          </div>

        </div>

      </section>


      {/* =========================================
          USP / TRUST
      ========================================= */}

      <section className="container-page py-16">

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">

          <div
            data-aos="fade-up"
            data-aos-delay="0"
          >
            <USPCard
              icon={Leaf}
              title="100% Natural"
              desc="No chemicals or unnecessary additives"
            />
          </div>


          <div
            data-aos="fade-up"
            data-aos-delay="100"
          >
            <USPCard
              icon={TreePine}
              title="Wood Pressed"
              desc="Traditional marachekku cold pressing"
            />
          </div>


          <div
            data-aos="fade-up"
            data-aos-delay="200"
          >
            <USPCard
              icon={Droplets}
              title="Rich in Goodness"
              desc="Natural aroma and quality"
            />
          </div>


          <div
            data-aos="fade-up"
            data-aos-delay="300"
          >
            <USPCard
              icon={Truck}
              title="Fast Delivery"
              desc="Delivered safely to your doorstep"
            />
          </div>

        </div>

      </section>
{/* =========================================
    AVAILABLE ON / FSSAI MARQUEE
========================================= */}

<section className="w-full overflow-hidden bg-white border-y border-ink/5 py-5">
  <div className="relative flex overflow-hidden">

    <div className="flex min-w-max animate-marquee items-center">

      {/* SET 1 */}
      <div className="flex items-center gap-14 px-7">

        {/* <span className="text-sm font-medium text-ink-soft whitespace-nowrap">
          Available on
        </span> */}

        <img
          src={amazonImg}
          alt="Available on Amazon"
          className="h-10 w-auto object-contain"
          loading="lazy"
        />

        <img
          src={flipkartImg}
          alt="Available on Flipkart"
          className="h-10 w-auto object-contain"
          loading="lazy"
        />

       

        <img
          src={meeshoImg}
          alt="Available on Meesho"
          className="h-10 w-200 object-contain"
          loading="lazy"
        />

          <img
          src={blinkitImg}
          alt="Available on Blinkit"
          className="h-10 w-200 object-contain"
          loading="lazy"
        />

          <img
          src={jiomartImg}
          alt="Available on JioMart"
          className="h-10 w-200 object-contain"
          loading="lazy"
        />
        
          <img
          src={snapdealImg}
          alt="Available on Snapdeal"
          className="h-10 w-200 object-contain"
          loading="lazy"
        />
        
        




      </div>

        <div className="h-8 w-px bg-ink/10" />

      {/* SET 2 - DUPLICATE FOR SEAMLESS LOOP */}
      <div className="flex items-center gap-14 px-7">

        {/* <span className="text-sm font-medium text-ink-soft whitespace-nowrap">
          Available on
        </span> */}

         <img
          src={amazonImg}
          alt="Available on Amazon"
          className="h-10 w-auto object-contain"
          loading="lazy"
        />

        <img
          src={flipkartImg}
          alt="Available on Flipkart"
          className="h-10 w-auto object-contain"
          loading="lazy"
        />

       

        <img
          src={meeshoImg}
          alt="Available on Meesho"
          className="h-10 w-auto object-contain"
          loading="lazy"
        />
        
          <img
          src={blinkitImg}
          alt="Available on Blinkit"
          className="h-10 w-200 object-contain"
          loading="lazy"
        />

          <img
          src={jiomartImg}
          alt="Available on JioMart"
          className="h-10 w-200 object-contain"
          loading="lazy"
        />
        
          <img
          src={snapdealImg}
          alt="Available on Snapdeal"
          className="h-10 w-200 object-contain"
          loading="lazy"
        />

        <div className="h-8 w-px bg-ink/10" />

       
      </div>

    </div>

  </div>
</section>

      {/* =========================================
          SHOP BY CATEGORY
      ========================================= */}

      <section className="container-page py-12">

        <div
          data-aos="fade-up"
          className="
            flex
            items-end
            justify-between
            mb-8
          "
        >

          <div>

            <p className="text-gold text-sm font-medium mb-1">
              Explore
            </p>

            <h2 className="font-heading text-3xl lg:text-4xl text-ink">
              Shop by Category
            </h2>

          </div>


          <Link
            to="/shop"
            className="
              hidden
              sm:flex
              items-center
              gap-1
              text-palm
              text-sm
              font-medium
              hover:gap-2
              transition-all
            "
          >
            View all

            <ArrowRight className="w-4 h-4" />
          </Link>

        </div>


        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">

          {categories.map(
            (cat, index) => (

              <Link
                key={cat.id}
                to={`/shop?category=${cat.id}`}
                data-aos="zoom-in"
                data-aos-delay={
                  index * 100
                }
                className="
                  group
                  relative
                  aspect-[3/4]
                  rounded-2xl
                  overflow-hidden
                  card
                  hover:shadow-lg
                  transition-all
                "
              >

                <img
                  src={
                    cat.image_url ?? ''
                  }
                  alt={cat.name}
                  loading="lazy"
                  className="
                    w-full
                    h-full
                    object-cover
                    group-hover:scale-105
                    transition-transform
                    duration-500
                  "
                />


                <div
                  className="
                    absolute
                    inset-0
                    bg-gradient-to-t
                    from-ink/70
                    via-ink/10
                    to-transparent
                  "
                />


                <div
                  className="
                    absolute
                    bottom-0
                    left-0
                    right-0
                    p-4
                  "
                >

                  <h3
                    className="
                      font-heading
                      text-lg
                      text-white
                      font-medium
                      mb-1
                    "
                  >
                    {cat.name}
                  </h3>


                  <p
                    className="
                      text-white/70
                      text-xs
                      line-clamp-1
                      mb-2
                    "
                  >
                    {cat.description}
                  </p>


                  <span
                    className="
                      inline-flex
                      items-center
                      gap-1
                      text-gold
                      text-xs
                      font-medium
                      group-hover:gap-2
                      transition-all
                    "
                  >
                    Shop Now

                    <ArrowRight className="w-3 h-3" />
                  </span>

                </div>

              </Link>
            )
          )}

        </div>

      </section>


      {/* =========================================
          BEST SELLERS
      ========================================= */}

      <section className="container-page py-12">

        <div
          data-aos="fade-up"
          className="
            flex
            items-end
            justify-between
            mb-8
          "
        >

          <div>

            <p className="text-gold text-sm font-medium mb-1">
              Most loved
            </p>

            <h2
              className="
                font-heading
                text-3xl
                lg:text-4xl
                text-ink
              "
            >
              Best Sellers
            </h2>

          </div>


          <Link
            to="/shop"
            className="
              hidden
              sm:flex
              items-center
              gap-1
              text-palm
              text-sm
              font-medium
              hover:gap-2
              transition-all
            "
          >
            View all

            <ArrowRight className="w-4 h-4" />
          </Link>

        </div>


        <div
          className="
            grid
            grid-cols-2
            lg:grid-cols-4
            gap-4
            lg:gap-6
          "
        >

          {loading ? (

            Array.from({
              length: 4,
            }).map((_, index) => (

              <div
                key={index}
                data-aos="fade-up"
                data-aos-delay={
                  index * 100
                }
              >
                <ProductCardSkeleton />
              </div>

            ))

          ) : (

            bestSellers.map(
              (product, index) => (

                <div
                  key={product.id}
                  data-aos="fade-up"
                  data-aos-delay={
                    index * 120
                  }
                >
                  <ProductCard
                    product={product}
                  />
                </div>

              )
            )

          )}

        </div>

      </section>


      {/* =========================================
          OUR PROCESS
      ========================================= */}

      <section
        className="
          bg-palm-deep
          text-bg
          py-20
          mt-12
        "
      >

        <div className="container-page">

          <div
            data-aos="fade-up"
            className="
              text-center
              max-w-2xl
              mx-auto
              mb-12
            "
          >

            <p className="text-gold text-sm font-medium mb-2">
              The marachekku method
            </p>

            <h2
              className="
                font-heading
                text-3xl
                lg:text-4xl
                text-bg
                mb-4
              "
            >
              From Coconut to Bottle
            </h2>

            <p className="text-bg/70 leading-relaxed">
              Five careful steps, each one rooted in tradition.
              No shortcuts, no chemicals — just the way it's
              been done in Pollachi for generations.
            </p>

          </div>


          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-5
              gap-4
              lg:gap-6
            "
          >

            {processSteps.map(
              (step, index) => (

                <div
                  key={index}
                  data-aos="fade-up"
                  data-aos-delay={
                    index * 150
                  }
                >

                  <div className="text-center">

                    <div
                      className="
                        w-12
                        h-12
                        rounded-full
                        bg-gold
                        text-white
                        font-heading
                        font-bold
                        text-lg
                        flex
                        items-center
                        justify-center
                        mx-auto
                        mb-4
                      "
                    >
                      {String(
                        index + 1
                      ).padStart(2, '0')}
                    </div>


                    <h3
                      className="
                        font-heading
                        text-lg
                        text-bg
                        mb-2
                      "
                    >
                      {step.title}
                    </h3>


                    <p
                      className="
                        text-bg/60
                        text-sm
                        leading-relaxed
                      "
                    >
                      {step.desc}
                    </p>

                  </div>

                </div>

              )
            )}

          </div>


          <div
            data-aos="fade-up"
            data-aos-delay="500"
            className="text-center mt-12"
          >

            <Link
              to="/our-process"
              className="
                inline-flex
                items-center
                gap-2
                px-6
                py-3
                rounded-full
                bg-gold
                text-white
                font-medium
                hover:bg-gold-deep
                transition-colors
              "
            >
              See the full process

              <ArrowRight className="w-4 h-4" />
            </Link>

          </div>

        </div>

      </section>


      {/* =========================================
          WHY POLLACHI
      ========================================= */}

      <section className="container-page py-20">

        <div
          className="
            grid
            lg:grid-cols-2
            gap-12
            items-center
          "
        >

          {/* Image */}

          <div
            data-aos="fade-up"
            className="relative"
          >

            <div
              className="
                aspect-[4/3]
                rounded-3xl
                overflow-hidden
                shadow-xl
              "
            >

              <img
                src="https://images.pexels.com/photos/13071432/pexels-photo-13071432.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                alt="Pollachi coconut farms"
                loading="lazy"
                className="w-full h-full object-cover"
              />

            </div>


            <div
              data-aos="zoom-in"
              data-aos-delay="300"
              className="
                absolute
                -top-4
                -right-4
                bg-card
                rounded-2xl
                shadow-xl
                p-6
                border
                border-ink/5
                hidden
                sm:block
              "
            >

              <p
                className="
                  font-heading
                  text-3xl
                  text-palm
                  font-bold
                "
              >
                40+
              </p>

              <p className="text-xs text-ink-soft">
                Partner Farms
              </p>

            </div>

          </div>


          {/* Content */}

          <div
            data-aos="fade-up"
            data-aos-delay="150"
          >

            <p className="text-gold text-sm font-medium mb-2">
              Why Pollachi
            </p>


            <h2
              className="
                font-heading
                text-3xl
                lg:text-4xl
                text-ink
                mb-6
              "
            >
              A tradition rooted in the soil
            </h2>


            <div
              className="
                space-y-4
                text-ink-soft
                leading-relaxed
              "
            >

              <p>
                Pollachi's red soil and tropical climate produce
                some of India's finest coconuts. Our partner farms
                have been cultivating coconuts for generations,
                using methods that work with nature, not against it.
              </p>


              <p>
                We work directly with 40+ family farms, ensuring
                fair prices and traceable sourcing. Every bottle
                tells a story — from the tree to the marachekku
                press to your home.
              </p>


              <p>
                No preservatives. No additives. No unnecessary
                heat. Just pure, wood-pressed coconut oil the way
                it's been made for centuries.
              </p>

            </div>


            <Link
              to="/why-pollachi"
              data-aos="fade-up"
              data-aos-delay="300"
              className="btn-secondary mt-8 inline-flex"
            >
              Learn more

              <ArrowRight className="w-4 h-4" />
            </Link>

          </div>

        </div>

      </section>


      {/* =========================================
          REVIEWS
      ========================================= */}

      {reviews.length > 0 && (

        <section
          className="
            bg-ink
            text-bg
            py-20
          "
        >

          <div className="container-page">

            <div
              data-aos="fade-up"
              className="
                text-center
                max-w-2xl
                mx-auto
                mb-12
              "
            >

              <p className="text-gold text-sm font-medium mb-2">
                Customer stories
              </p>


              <h2
                className="
                  font-heading
                  text-3xl
                  lg:text-4xl
                  text-bg
                  mb-4
                "
              >
                Loved by families across India
              </h2>

            </div>


            <div
              className="
                grid
                md:grid-cols-3
                gap-6
              "
            >

              {reviews.map(
                (review, index) => (

                  <div
                    key={review.id}
                    data-aos="zoom-in"
                    data-aos-delay={
                      index * 150
                    }
                    className="
                      bg-bg/5
                      rounded-2xl
                      p-6
                      border
                      border-bg/10
                    "
                  >

                    <StarRating
                      rating={
                        review.rating
                      }
                      size="md"
                    />


                    <p
                      className="
                        text-bg/80
                        mt-4
                        leading-relaxed
                        text-sm
                      "
                    >
                      "{review.comment}"
                    </p>


                    <div
                      className="
                        flex
                        items-center
                        gap-3
                        mt-6
                        pt-6
                        border-t
                        border-bg/10
                      "
                    >

                      <div
                        className="
                          w-10
                          h-10
                          rounded-full
                          bg-gold/20
                          flex
                          items-center
                          justify-center
                          text-gold
                          font-heading
                          font-semibold
                        "
                      >
                        {review.user_name
                          ?.charAt(0)
                          ?.toUpperCase() || 'U'}
                      </div>


                      <div>

                        <p
                          className="
                            text-bg
                            text-sm
                            font-medium
                          "
                        >
                          {review.user_name ||
                            'Anonymous'}
                        </p>


                        <p
                          className="
                            text-bg/50
                            text-xs
                          "
                        >
                          {review.user_location}
                        </p>

                      </div>

                    </div>

                  </div>

                )
              )}

            </div>


            <div
              data-aos="fade-up"
              data-aos-delay="400"
              className="text-center mt-12"
            >

              <Link
                to="/reviews"
                className="
                  inline-flex
                  items-center
                  gap-2
                  text-gold
                  font-medium
                  hover:gap-3
                  transition-all
                "
              >
                Read more reviews

                <ArrowRight className="w-4 h-4" />
              </Link>

            </div>

          </div>

        </section>

      )}


      {/* =========================================
          CTA
      ========================================= */}

      <section className="container-page py-20">

        <div
          data-aos="zoom-in"
          data-aos-duration="900"
          className="
            bg-gradient-to-br
            from-palm
            to-palm-deep
            rounded-3xl
            p-8
            lg:p-16
            text-center
            text-bg
            relative
            overflow-hidden
          "
        >

          <div
            className="
              relative
              z-10
              max-w-xl
              mx-auto
            "
          >

            <h2
              className="
                font-heading
                text-3xl
                lg:text-4xl
                text-bg
                mb-4
              "
            >
              Start your Pollachi journey
            </h2>


            <p
              className="
                text-bg/70
                mb-8
                leading-relaxed
              "
            >
              Experience the difference of truly traditional,
              wood-pressed coconut oil. Your hair, skin, and
              kitchen will thank you.
            </p>


            <Link
              to="/shop"
              className="
                inline-flex
                items-center
                gap-2
                px-8
                py-4
                rounded-full
                bg-gold
                text-white
                font-medium
                hover:bg-gold-deep
                transition-colors
              "
            >
              Shop Now

              <ArrowRight className="w-4 h-4" />
            </Link>

          </div>


          <div
            className="
              absolute
              top-0
              right-0
              w-64
              h-64
              bg-gold/10
              rounded-full
              blur-3xl
            "
          />


          <div
            className="
              absolute
              bottom-0
              left-0
              w-64
              h-64
              bg-gold/10
              rounded-full
              blur-3xl
            "
          />

        </div>

      </section>

    </div>
  );
}


/* =========================================
   STAT
========================================= */

function Stat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  const [count, setCount] = useState(0);


  useEffect(() => {
    const target =
      parseInt(
        value.replace(/\D/g, ''),
        10
      ) || 0;

    const duration = 1500;
    const steps = 50;
    const increment =
      target / steps;

    let current = 0;

    const timer = setInterval(() => {
      current += increment;

      if (current >= target) {
        current = target;
        clearInterval(timer);
      }

      setCount(
        Math.floor(current)
      );
    }, duration / steps);


    return () =>
      clearInterval(timer);

  }, [value]);


  const prefix =
    value.includes('~')
      ? '~'
      : '';


  const suffix =
    value.includes('+')
      ? '+'
      : value.includes('st')
        ? 'st'
        : '';


  return (
    <div className="text-center">

      <p
        className="
          font-heading
          text-xl
          lg:text-2xl
          text-ink
          font-semibold
        "
      >
        {prefix}
        {count}
        {suffix}
      </p>


      <p className="text-xs text-ink-soft">
        {label}
      </p>

    </div>
  );
}


/* =========================================
   USP CARD
========================================= */

function USPCard({
  icon: Icon,
  title,
  desc,
}: {
  icon: any;
  title: string;
  desc: string;
}) {
  return (
    <div
      className="
        card
        p-5
        lg:p-6
        hover:shadow-md
        transition-shadow
        h-full
      "
    >

      <div
        className="
          w-12
          h-12
          rounded-xl
          bg-palm/10
          flex
          items-center
          justify-center
          mb-4
        "
      >
        <Icon className="w-6 h-6 text-palm" />
      </div>


      <h3
        className="
          font-heading
          text-lg
          text-ink
          mb-1
        "
      >
        {title}
      </h3>


      <p
        className="
          text-sm
          text-ink-soft
          leading-relaxed
        "
      >
        {desc}
      </p>

    </div>
  );
}


/* =========================================
   PROCESS DATA
========================================= */

const processSteps = [
  {
    title: 'Hand-picked Harvest',
    desc: 'Mature coconuts selected from Pollachi farms',
  },
  {
    title: 'Sun-dried Copra',
    desc: 'Naturally dried under the Pollachi sun',
  },
  {
    title: 'Marachekku Pressing',
    desc: 'Wood-pressed at low temperature',
  },
  {
    title: 'Settle & Filter',
    desc: 'Natural settling, minimal filtering',
  },
  {
    title: 'Hand Bottled',
    desc: 'Freshly bottled and sealed',
  },
];