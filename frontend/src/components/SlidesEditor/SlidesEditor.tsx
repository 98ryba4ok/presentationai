import "./SlidesEditor.css";
import React from "react";
import type { Slide } from "../../types/presentation";

type SlideExtended = Slide & { _id: string; number: number };

interface SlidesEditorProps {
  slides: SlideExtended[];
  draggingIndex: number | null;
  onDragStart: (index: number) => void;
  onDragEnter: (index: number) => void;
  onDragEnd: () => void;
  onSave: () => void;
  onBack: () => void;
  loading: boolean;
}

const SlidesEditor: React.FC<SlidesEditorProps> = ({
  slides,
  draggingIndex,
  onDragStart,
  onDragEnter,
  onDragEnd,
  onSave,
  onBack,
  loading,
}) => {
  return (
    <>
      <h4 className="dragh4">
        Перетягивайте слайды местами, если хотите поменять их последовательность
      </h4>
      <div className="generated-slides">
        {slides.map((slide, index) => (
          <div
            key={slide._id}
            className={`slide-card ${draggingIndex === index ? "dragging" : ""}`}
            draggable={index !== 0}
            onDragStart={() => onDragStart(index)}
            onDragEnter={() => onDragEnter(index)}
            onDragEnd={onDragEnd}
          >
            <h3 className="slide-card-h3">Слайд {slide.number}</h3>
            <h4 className="slide-card-h4">{slide.title}</h4>
            <p>{slide.text}</p>
          </div>
        ))}
      </div>

      <div className="setup-buttons">
        <button onClick={onBack} className="back-btn">
          Назад
        </button>
        <button className="next-btn" disabled={loading} onClick={onSave}>
          Сохранить
        </button>
      </div>
    </>
  );
};

export default SlidesEditor;
