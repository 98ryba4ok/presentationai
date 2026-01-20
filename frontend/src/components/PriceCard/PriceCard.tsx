import React from "react";
import "./PriceCard.css";
import iconFire from "../../assets/iconFire.png";

interface PriceCardProps {
  generationCount: number;
}

const PriceCard: React.FC<PriceCardProps> = ({ generationCount }) => {
  return (
    <div className="price-card">
      <h3 className="price-title">Стоимость</h3>

      {generationCount < 100 ? (
        <div className="price-content">
          <p className="price-generations">
            За <span>{generationCount}</span> генераций
          </p>
          <p className="price-current">{generationCount * 25} ₽</p>
        </div>
      ) : null}

      <div className="price-promo">
        <img src={iconFire} alt="" className="price-fire" />
        <h4 className="price-promo-ti">100 генераций</h4>
        <p className="price-old">
          2000 ₽ <span>2500 ₽</span>
        </p>
      </div>
    </div>
  );
};

export default PriceCard;
