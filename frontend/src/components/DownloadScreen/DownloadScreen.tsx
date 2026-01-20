import "./DownloadScreen.css";
import React from "react";
import generatedpptx from "../../assets/generatedpptx.png";

interface DownloadScreenProps {
  onDownload: () => void;
  onBack: () => void;
}

const DownloadScreen: React.FC<DownloadScreenProps> = ({
  onDownload,
  onBack,
}) => {
  return (
    <div className="download-screen">
      <h2>Презентация готова!</h2>
      <img src={generatedpptx} alt="" />
      <button className="download-btn" onClick={onDownload}>
        Скачать презентацию
      </button>
      <button className="back-btn-download" onClick={onBack}>
        К списку презентаций
      </button>
    </div>
  );
};

export default DownloadScreen;
