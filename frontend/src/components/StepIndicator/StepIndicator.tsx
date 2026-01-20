import "./StepIndicator.css";
import React from "react";
import setupArrow from "../../assets/setupArrow.png";

interface StepIndicatorProps {
  currentStep: 1 | 2 | 3;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  return (
    <div>
      <div className="setup-steps">
        <div className="setup-step">
          <div className={currentStep === 1 ? "step_number-active" : "step_number"}>
            <p>1</p>
          </div>
          <span className={currentStep === 1 ? "active-step" : ""}>
            Выбор шаблона
          </span>
        </div>
        <img src={setupArrow} alt="" />
        <div className="setup-step">
          <div className={currentStep === 2 ? "step_number-active" : "step_number"}>
            <p>2</p>
          </div>
          <span className={currentStep === 2 ? "active-step" : ""}>
            Просмотр слайдов
          </span>
        </div>
        <img src={setupArrow} alt="" />
        <div className="setup-step">
          <div className={currentStep === 3 ? "step_number-active" : "step_number"}>
            <p>3</p>
          </div>
          <span className={currentStep === 3 ? "active-step" : ""}>
            Результат
          </span>
        </div>
      </div>
      <hr className="setup-steps-hr" />
    </div>
  );
};

export default StepIndicator;
