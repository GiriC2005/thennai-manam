import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  direction?: 'up' | 'left' | 'right';
  distance?: number;
  duration?: number;
  once?: boolean;
  className?: string;
}

export default function ScrollReveal({
  children,
  delay = 0,
  direction = 'up',
  distance = 50,
  duration = 900,
  once = true,
  className = '',
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    // Fallback for browsers where IntersectionObserver
    // is unavailable.
    if (!('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;

        if (entry.isIntersecting) {
          setVisible(true);

          if (once) {
            observer.unobserve(element);
          }
        } else if (!once) {
          setVisible(false);
        }
      },
      {
        threshold: 0.05,
        rootMargin: '0px 0px -20px 0px',
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [once]);

  const getTransform = () => {
    if (visible) {
      return 'translate3d(0, 0, 0)';
    }

    if (direction === 'left') {
      return `translate3d(-${distance}px, 0, 0)`;
    }

    if (direction === 'right') {
      return `translate3d(${distance}px, 0, 0)`;
    }

    return `translate3d(0, ${distance}px, 0)`;
  };

  return (
    <div
      ref={ref}
      className={`scroll-reveal ${className}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: getTransform(),
        transitionProperty: 'opacity, transform',
        transitionDuration: `${duration}ms`,
        transitionTimingFunction:
          'cubic-bezier(0.22, 1, 0.36, 1)',
        transitionDelay: `${delay}ms`,
        willChange: visible
          ? 'auto'
          : 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
}