import { useState } from "react";
import type { Slide } from "../types/presentation";

type SlideExtended = Slide & { _id: string; number: number };

export const useSlidesDragAndDrop = (slides: SlideExtended[], setSlides: (slides: SlideExtended[]) => void) => {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

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

  return {
    draggingIndex,
    handleDragStart,
    handleDragEnter,
    handleDragEnd,
  };
};
