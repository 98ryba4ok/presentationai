import "./SamplesSection.css";
import React from "react";
import SampleCard from "../SampleCard/SampleCard";
import cardImage1 from "../../assets/card1.png";
import cardImage2 from "../../assets/card2.png";
import cardImage3 from "../../assets/card3.png";

const SamplesSection: React.FC = () => {
  return (
    <>
      <h2 id="templates" className="main-title2">
        Шаблоны
      </h2>
      <div className="sample-cards">
        <SampleCard
          image={cardImage1}
          title="Квант"
          text="Футуристичный и технологичный шаблон
для IT-компаний, стартапов, презентаций инновационных продуктов и научных докладов. Создает ощущение прорыва, точности и движения вперед"
        />
        <SampleCard
          image={cardImage2}
          title="Терра"
          text="Органичный, спокойный и эко-ориентированный шаблон. Идеален для брендов, связанных с природой, устойчивым развитием, туризмом. Передает чувство гармонии и надежности"
        />
        <SampleCard
          image={cardImage3}
          title="Импульс"
          text="Динамичный, яркий и смелый шаблон для креативных агентств, ивентов, спортивных брендов и молодежной аудитории. Полон энергии, использует смелые типографические решения и геометрию"
        />
      </div>
    </>
  );
};

export default SamplesSection;
