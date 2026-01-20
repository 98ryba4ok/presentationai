import "./ErrorScreen.css";
import React from "react";
import error_generation from "../../assets/error_generation.png";

interface ErrorScreenProps {
  onRetry: () => void;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({ onRetry }) => {
  return (
    <div className="error-screen">
      <img src={error_generation} alt="" />
      <h3>Не получилось создать содержание</h3>
      <h4>Измените тему презентации и попробуйте ещё раз</h4>
      <button className="back-btn-err" onClick={onRetry}>
        К настройкам презентации
      </button>
    </div>
  );
};

export default ErrorScreen;
