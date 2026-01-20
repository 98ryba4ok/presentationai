import "./TemplateSlider.css";
import React, { useState } from "react";
import type { PresentationTemplate } from "../../types/presentation";

interface TemplateSliderProps {
  template: PresentationTemplate;
}

const TemplateSlider: React.FC<TemplateSliderProps> = ({ template }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    if (template.images?.length) {
      setCurrentIndex((p) => (p + 1) % template.images.length);
    }
  };

  const prevSlide = () => {
    if (template.images?.length) {
      setCurrentIndex((p) => (p === 0 ? template.images.length - 1 : p - 1));
    }
  };

  return (
    <div className="slider">
      {template.images.map((img, index) => (
        <div
          key={index}
          className={`slide ${index === currentIndex ? "active" : ""}`}
        >
          <img src={img.image} alt={template.title} />
        </div>
      ))}
      <button className="slider-btn prev" onClick={prevSlide}>
        ‹
      </button>
      <button className="slider-btn next" onClick={nextSlide}>
        ›
      </button>
    </div>
  );
};

export default TemplateSlider;
