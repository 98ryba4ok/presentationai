import { useState, useRef, useCallback, useEffect } from "react";
import type { Slide } from "../types/presentation";

type SlideExtended = Slide & { _id: string; number: number };

export const useSlidesDragAndDrop = (slides: SlideExtended[], setSlides: (slides: SlideExtended[]) => void) => {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const draggingIndexRef = useRef<number | null>(null);
  const slidesRef = useRef(slides);

  useEffect(() => {
    slidesRef.current = slides;
  }, [slides]);

  useEffect(() => {
    draggingIndexRef.current = draggingIndex;
  }, [draggingIndex]);

  const handleDragStart = (index: number) => {
    if (index !== 0) {
      setDraggingIndex(index);
    }
  };

  const handleDragEnter = (targetIndex: number) => {
    if (draggingIndex === null || targetIndex === 0) return;

    setSlides(
      (() => {
        const reordered = [...slides];
        const dragged = reordered[draggingIndex];
        reordered.splice(draggingIndex, 1);
        reordered.splice(targetIndex, 0, dragged);
        return reordered.map((s, i) => ({ ...s, number: i + 1 }));
      })()
    );

    setDraggingIndex(targetIndex);
  };

  const handleDragEnd = () => {
    setSlides(slides.map((s, i) => ({ ...s, number: i + 1 })));
    setDraggingIndex(null);
  };

  const getIndexFromTouchPoint = useCallback((clientY: number): number | null => {
    if (!containerRef.current) return null;

    const cards = containerRef.current.querySelectorAll('.slide-card');
    for (let i = 0; i < cards.length; i++) {
      const rect = cards[i].getBoundingClientRect();
      if (clientY >= rect.top && clientY <= rect.bottom) {
        return i;
      }
    }
    return null;
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      const card = target.closest('.slide-card') as HTMLElement;
      if (!card) return;

      const cards = container.querySelectorAll('.slide-card');
      let index = -1;
      cards.forEach((c, i) => {
        if (c === card) index = i;
      });

      if (index === 0 || index === -1) return;

      e.preventDefault();
      setDraggingIndex(index);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (draggingIndexRef.current === null) return;

      e.preventDefault();
      const touch = e.touches[0];
      const targetIndex = getIndexFromTouchPoint(touch.clientY);

      if (targetIndex !== null && targetIndex !== draggingIndexRef.current && targetIndex !== 0) {
        const currentSlides = slidesRef.current;
        const currentDraggingIndex = draggingIndexRef.current;

        const reordered = [...currentSlides];
        const dragged = reordered[currentDraggingIndex];
        reordered.splice(currentDraggingIndex, 1);
        reordered.splice(targetIndex, 0, dragged);
        const updated = reordered.map((s, i) => ({ ...s, number: i + 1 }));

        setSlides(updated);
        setDraggingIndex(targetIndex);
      }
    };

    const handleTouchEnd = () => {
      if (draggingIndexRef.current === null) return;

      const currentSlides = slidesRef.current;
      setSlides(currentSlides.map((s, i) => ({ ...s, number: i + 1 })));
      setDraggingIndex(null);
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [getIndexFromTouchPoint, setSlides]);

  return {
    draggingIndex,
    containerRef,
    handleDragStart,
    handleDragEnter,
    handleDragEnd,
  };
};
