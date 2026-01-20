import "./PresentationForm.css";
import React from "react";
import PresentationHelper from "../PresentationHelper/PresentationHelper";

interface PresentationFormProps {
  title: string;
  theme: string;
  imagePrompt: string;
  onTitleChange: (value: string) => void;
  onThemeChange: (value: string) => void;
  onImagePromptChange: (value: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  loading: boolean;
}

const PresentationForm: React.FC<PresentationFormProps> = ({
  title,
  theme,
  imagePrompt,
  onTitleChange,
  onThemeChange,
  onImagePromptChange,
  onSubmit,
  onBack,
  loading,
}) => {
  return (
    <>
      <div className="setup-textarea">
        <div className="setup-input">
          <label>Название презентации</label>
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Например: Моя презентация про ИИ"
          />
        </div>

        <label>Введите тему презентации или описание слайдов</label>
        <div className="ph-wrapper">
          <PresentationHelper />
          <textarea
            value={theme}
            onChange={(e) => onThemeChange(e.target.value)}
            placeholder="Например: Искусственный интеллект в образовании"
          />
        </div>
        <div className="setup-input">
          <label className="img_search-label">Поиск изображений</label>
          <p className="img_search">
            Если поле останется пустым, презентация будет без изображений
          </p>
          <input
            type="text"
            value={imagePrompt}
            onChange={(e) => onImagePromptChange(e.target.value)}
            placeholder="Например: космос"
          />
        </div>
      </div>

      <div className="setup-buttons">
        <button onClick={onBack} className="back-btn">
          Назад
        </button>
        <button
          className="next-btn"
          disabled={!theme.trim() || loading}
          onClick={onSubmit}
        >
          Далее
        </button>
      </div>
    </>
  );
};

export default PresentationForm;
