import "./HeroSection.css";
import React from "react";
import maincard from "../../assets/maincard.png";

const HeroSection: React.FC = () => {
  return (
    <>
      <h1 className="main-title">
        <span className="highlight">Создавай</span> презентации
        <br />
        за считанные минуты
      </h1>
      <img className="main-title-image" src={maincard} alt="maincard" />
    </>
  );
};

export default HeroSection;
