import "./HowItWorks.css";
import React from "react";

const HowItWorks: React.FC = () => {
  return (
    <div id="how-it-works" className="square-menu">
      <div className="square">1</div>
      <p className="square-menu-text">Выбери шаблон</p>
      <hr className="hr_square" />
      <div className="square">2</div>
      <p className="square-menu-text">Настрой презентацию и введи тему</p>
      <hr className="hr_square" />
      <div className="square">3</div>
      <p className="square-menu-text">Скачай результат</p>
    </div>
  );
};

export default HowItWorks;
