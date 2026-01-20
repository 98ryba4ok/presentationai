import React, { useState } from "react";
import "./PaymentsTab.css";
import profile_starcount from "../../assets/profile_starcount.svg";
import PriceCard from "../PriceCard/PriceCard";

const PaymentsTab: React.FC = () => {
  const [generationCount, setGenerationCount] = useState(10);

  return (
    <div className="tab-payments">
      <h2 className="tab-info-h2">Оплата генераций</h2>

      <div className="payments-info">
        <div className="slider-block">
          <label htmlFor="generationRange">Количество генераций</label>
          <div className="slider-row">
            <input
              id="generationRange"
              type="range"
              min="1"
              max="100"
              value={generationCount}
              onChange={(e) => setGenerationCount(Number(e.target.value))}
              style={{
                background: `linear-gradient(90deg, #9F2EFD ${
                  (generationCount / 100) * 100
                }%, #3B3B3B ${(generationCount / 100) * 100}%)`,
              }}
            />
            <div className="slider-input-wrapper">
              <input
                type="number"
                min="1"
                max="100"
                value={generationCount}
                onChange={(e) => {
                  const val = Math.max(
                    1,
                    Math.min(100, Number(e.target.value))
                  );
                  setGenerationCount(val);
                }}
                className="slider-input"
              />
              <img
                src={profile_starcount}
                alt="звёздочка"
                className="slider-star"
              />
            </div>
          </div>
        </div>

        <PriceCard generationCount={generationCount} />
      </div>
      <a
        className="price-promo-button"
        href="https://t.me/prai_presentations"
        target="_blank"
        rel="noopener noreferrer"
        role="button"
      >
        Оплата генераций
      </a>
    </div>
  );
};

export default PaymentsTab;
