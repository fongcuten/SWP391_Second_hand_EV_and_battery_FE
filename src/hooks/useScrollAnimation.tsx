import { useEffect, useRef, useState } from 'react';

interface UseScrollAnimationProps {
  threshold?: number; // phan tram phan tu hien ra thi moi tinh la "visible"
  rootMargin?: string; // Vd -50px se thay som hon
  triggerOnce?: boolean; // true to trigger animation only once
}

/*
  * Custom hook to handle scroll-based animations
  * @param {UseScrollAnimationProps} options - Options for the scroll animation
  * @returns {Object} - Contains ref to attach to the element and isVisible state
  
  Co che hoat dong:
  - Su dung IntersectionObserver de theo doi su hien thi cua phan tu trong viewport
  - Khi phan tu hien thi, set isVisible = true de bat dau animation
  - Neu triggerOnce = true, animation chi duoc trigger mot lan duy nhat
  - Neu phan tu khong hien thi, isVisible se duoc reset ve false neu triggerOnce = false
  - ref duoc su dung de tham chieu toi phan tu can quan sat
*/

export const useScrollAnimation = (options: UseScrollAnimationProps = {}) => {
  const { threshold = 0.1, rootMargin = '0px', triggerOnce = false } = options;
  const [isVisible, setIsVisible] = useState(false); // xac dinh xem phan tu co hien thi hay ko
  const [hasTriggered, setHasTriggered] = useState(false); // danh dau da trigger animation hay chua
  const ref = useRef<HTMLDivElement | null>(null); // tham chieu toi phan tu can quan sat

  useEffect(() => {
    // tao mot IntersectionObserver de theo doi su hien thi cua phan tu
    const observer = new IntersectionObserver(
      ([entry]) => {
        // entry.isIntersecting la true neu phan tu dang hien thi trong viewport
        if (entry.isIntersecting && !hasTriggered) {
          setIsVisible(true) // bat dau animation khi phan tu hien thi
          if (triggerOnce) {
            setHasTriggered(true); // neu triggerOnce la true, danh dau da trigger animation
          }
        } else if (!triggerOnce && !hasTriggered) {
          setIsVisible(false); // neu ko phai triggerOnce va phan tu nam ngoai vung, reset isVisible khi phan tu khong hien thi
        }
      },
      {
        threshold,
        rootMargin,
      },
    )

    const currentElement = ref.current
    if (currentElement) {
      observer.observe(currentElement); // bat dau theo doi phan tu hien tai
    }

    // cleanup: dung theo doi phan tu khi component unmount
    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    }
  }, [threshold, rootMargin, triggerOnce, hasTriggered]);

  return { ref, isVisible }
}