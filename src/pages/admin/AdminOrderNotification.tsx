import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  X,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react';

import { getAllOrders } from '@/services/api';

interface AdminOrder {
  id: string;
  order_number: string | null;
  total: number;
  order_status: string;
  created_at: string;
}

export default function AdminOrderNotification() {
  const [notification, setNotification] =
    useState<AdminOrder | null>(null);

  const [newOrderCount, setNewOrderCount] =
    useState(0);

  const knownOrderIds =
    useRef<Set<string>>(new Set());

  const initialized =
    useRef(false);

  const audioContextRef =
    useRef<AudioContext | null>(null);

  // ==========================================
  // NOTIFICATION SOUND
  // ==========================================

  function playNotificationSound() {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (
          window as typeof window & {
            webkitAudioContext?: typeof AudioContext;
          }
        ).webkitAudioContext;

      if (!AudioContextClass) return;

      if (!audioContextRef.current) {
        audioContextRef.current =
          new AudioContextClass();
      }

      const audioContext =
        audioContextRef.current;

      const oscillator =
        audioContext.createOscillator();

      const gainNode =
        audioContext.createGain();

      oscillator.type = 'sine';

      oscillator.frequency.setValueAtTime(
        880,
        audioContext.currentTime
      );

      oscillator.frequency.setValueAtTime(
        1174,
        audioContext.currentTime + 0.12
      );

      gainNode.gain.setValueAtTime(
        0.0001,
        audioContext.currentTime
      );

      gainNode.gain.exponentialRampToValueAtTime(
        0.18,
        audioContext.currentTime + 0.02
      );

      gainNode.gain.exponentialRampToValueAtTime(
        0.0001,
        audioContext.currentTime + 0.35
      );

      oscillator.connect(gainNode);

      gainNode.connect(
        audioContext.destination
      );

      oscillator.start();

      oscillator.stop(
        audioContext.currentTime + 0.35
      );
    } catch (error) {
      console.warn(
        'Notification sound unavailable:',
        error
      );
    }
  }

  // ==========================================
  // CHECK NEW ORDERS
  // ==========================================

  async function checkNewOrders() {
    try {
      const data =
        await getAllOrders();

      const orders =
        Array.isArray(data)
          ? (data as AdminOrder[])
          : [];

      // ---------------------------------------
      // FIRST LOAD
      // Don't show old orders as new
      // ---------------------------------------

      if (!initialized.current) {
        orders.forEach((order) => {
          knownOrderIds.current.add(
            order.id
          );
        });

        initialized.current = true;

        return;
      }

      // ---------------------------------------
      // FIND NEW ORDERS
      // ---------------------------------------

      const newOrders =
        orders.filter(
          (order) =>
            !knownOrderIds.current.has(
              order.id
            )
        );

      if (newOrders.length === 0) {
        return;
      }

      // ---------------------------------------
      // SAVE NEW ORDER IDS
      // ---------------------------------------

      newOrders.forEach((order) => {
        knownOrderIds.current.add(
          order.id
        );
      });

      // ---------------------------------------
      // LATEST NEW ORDER
      // ---------------------------------------

      const latestOrder =
        [...newOrders].sort(
          (a, b) =>
            new Date(
              b.created_at
            ).getTime() -
            new Date(
              a.created_at
            ).getTime()
        )[0];

      setNotification(latestOrder);

      setNewOrderCount(
        newOrders.length
      );

      playNotificationSound();

      // ---------------------------------------
      // AUTO CLOSE AFTER 8 SECONDS
      // ---------------------------------------

    //   window.setTimeout(() => {
    //     setNotification((current) => {
    //       if (
    //         current?.id ===
    //         latestOrder.id
    //       ) {
    //         return null;
    //       }

    //       return current;
    //     });

    //     setNewOrderCount(0);
    //   }, 8000);
    } catch (error) {
      console.error(
        'New order notification error:',
        error
      );
    }
  }

  // ==========================================
  // POLLING
  // ==========================================

  useEffect(() => {
    checkNewOrders();

    const interval =
      window.setInterval(
        checkNewOrders,
        10000
      );

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, []);

  // ==========================================
  // CLOSE
  // ==========================================

  function closeNotification() {
    setNotification(null);
    setNewOrderCount(0);
  }

  if (!notification) {
    return null;
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div
      className="
        fixed
        top-5
        right-5
        z-[9999]
        w-[calc(100vw-2rem)]
        max-w-sm
        animate-slide-in-right
      "
    >
      <div
        className="
          bg-white
          border
          border-palm/20
          rounded-2xl
          shadow-2xl
          overflow-hidden
        "
      >

        {/* TOP GREEN BAR */}

        <div
          className="
            h-1.5
            bg-palm
          "
        />

        <div className="p-4">

          {/* HEADER */}

          <div className="flex items-start gap-3">

            {/* ICON */}

            <div
              className="
                w-11
                h-11
                rounded-xl
                bg-palm/10
                flex
                items-center
                justify-center
                shrink-0
              "
            >
              <Bell
                className="
                  w-5
                  h-5
                  text-palm
                  animate-bounce
                "
              />
            </div>

            {/* TEXT */}

            <div className="flex-1 min-w-0">

              <div className="flex items-center justify-between gap-2">

                <h3
                  className="
                    font-semibold
                    text-ink
                  "
                >
                  New Order Received!
                </h3>

                <button
                  type="button"
                  onClick={
                    closeNotification
                  }
                  className="
                    w-7
                    h-7
                    rounded-full
                    flex
                    items-center
                    justify-center
                    text-ink-soft
                    hover:bg-ink/5
                    shrink-0
                  "
                  aria-label="Close notification"
                >
                  <X className="w-4 h-4" />
                </button>

              </div>

              <p
                className="
                  text-sm
                  text-ink-soft
                  mt-1
                "
              >
                A customer has placed a
                new order.
              </p>

            </div>

          </div>

          {/* ORDER DETAILS */}

          <div
            className="
              mt-4
              rounded-xl
              bg-palm/5
              border
              border-palm/10
              p-3
            "
          >

            <div className="flex items-center gap-3">

              <div
                className="
                  w-9
                  h-9
                  rounded-lg
                  bg-white
                  flex
                  items-center
                  justify-center
                  shrink-0
                "
              >
                <ShoppingBag
                  className="
                    w-4
                    h-4
                    text-palm
                  "
                />
              </div>

              <div className="flex-1 min-w-0">

                <p
                  className="
                    font-medium
                    text-ink
                    truncate
                  "
                >
                  {notification.order_number ||
                    `#${notification.id.slice(
                      0,
                      8
                    )}`}
                </p>

                <p
                  className="
                    text-xs
                    text-ink-soft
                    mt-0.5
                    capitalize
                  "
                >
                  Status:{' '}
                  {notification.order_status}
                </p>

              </div>

              <p
                className="
                  font-semibold
                  text-palm
                  whitespace-nowrap
                "
              >
                ₹
                {Number(
                  notification.total || 0
                ).toLocaleString(
                  'en-IN'
                )}
              </p>

            </div>

          </div>

          {/* MULTIPLE ORDERS */}

          {newOrderCount > 1 && (
            <p
              className="
                text-xs
                text-gold
                font-medium
                mt-2
              "
            >
              + {newOrderCount - 1}{' '}
              more new order
              {newOrderCount - 1 > 1
                ? 's'
                : ''}
            </p>
          )}

          {/* VIEW ORDER */}

          <Link
            to={`/admin/orders/${notification.id}`}
            onClick={
              closeNotification
            }
            className="
              mt-4
              w-full
              inline-flex
              items-center
              justify-center
              gap-2
              px-4
              py-2.5
              rounded-xl
              bg-palm
              text-white
              text-sm
              font-medium
              hover:bg-palm/90
              transition-colors
            "
          >
            View Order

            <ArrowRight
              className="w-4 h-4"
            />
          </Link>

        </div>
      </div>

      {/* ANIMATION */}

      <style>
        {`
          @keyframes adminOrderSlideIn {
            from {
              opacity: 0;
              transform: translateX(40px);
            }

            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          .animate-slide-in-right {
            animation:
              adminOrderSlideIn
              0.35s
              ease-out;
          }
        `}
      </style>

    </div>
  );
}