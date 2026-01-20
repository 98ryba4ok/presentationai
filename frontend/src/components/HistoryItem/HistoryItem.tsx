import React from "react";
import "./HistoryItem.css";
import type { UserPresentation } from "../../types/presentation";

interface HistoryItemProps {
  presentation: UserPresentation;
  onDelete: (id: number, title: string) => void;
}

const HistoryItem: React.FC<HistoryItemProps> = ({
  presentation,
  onDelete,
}) => {
  return (
    <div className="history-item">
      <div className="history-info">
        <h3>{presentation.title || "Без названия"}</h3>
        <p className="history-date">
          {new Date(presentation.created_at).toLocaleString()}
        </p>
      </div>

      <div className="history-actions">
        <a
          href={presentation.pptx_file || ""}
          download
          className="history-download"
        >
          Скачать
        </a>

        <button
          className="history-delete"
          onClick={() => onDelete(presentation.id, presentation.title)}
        >
          Удалить
        </button>
      </div>
    </div>
  );
};

export default HistoryItem;
