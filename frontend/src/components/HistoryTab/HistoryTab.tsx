import React from "react";
import "./HistoryTab.css";
import type { UserPresentation } from "../../types/presentation";
import HistoryItem from "../HistoryItem/HistoryItem";

interface HistoryTabProps {
  presentations: UserPresentation[];
  loading: boolean;
  onDelete: (id: number, title: string) => void;
}

const HistoryTab: React.FC<HistoryTabProps> = ({
  presentations,
  loading,
  onDelete,
}) => {
  return (
    <div className="history-tab">
      <h2 className="tab-info-h2">История генераций</h2>

      {loading && <p>Загрузка...</p>}

      {!loading && presentations.length === 0 && (
        <p className="no_generated">
          У вас пока нет сгенерированных презентаций
        </p>
      )}

      {!loading &&
        presentations.map((p) => (
          <HistoryItem key={p.id} presentation={p} onDelete={onDelete} />
        ))}
    </div>
  );
};

export default HistoryTab;
