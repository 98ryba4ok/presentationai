import { useState, useEffect } from "react";
import { useToast } from "../components/ToastProvider/ToastProvider";
import {
  fetchUserPresentations,
  deleteUserPresentation,
} from "../api/presentations";
import type { UserPresentation } from "../types/presentation";

export const usePresentationsHistory = (activeTab: string) => {
  const [presentations, setPresentations] = useState<UserPresentation[]>([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const loadHistory = async () => {
      if (activeTab !== "history") return;

      setLoading(true);
      try {
        const data = await fetchUserPresentations();
        setPresentations(data);
      } catch {
        showToast("Ошибка загрузки истории", "error");
      }
      setLoading(false);
    };

    loadHistory();
  }, [activeTab, showToast]);

  const handleDelete = async (presentationId: number): Promise<void> => {
    try {
      await deleteUserPresentation(presentationId);
      setPresentations((prev) => prev.filter((p) => p.id !== presentationId));
      showToast("Презентация удалена", "success");
    } catch {
      showToast("Ошибка при удалении", "error");
      throw new Error("Failed to delete presentation");
    }
  };

  return {
    presentations,
    loading,
    handleDelete,
  };
};
