import { useState, useEffect } from "react";
import { fetchPresentationTemplates } from "../api/presentations";
import type { PresentationTemplate } from "../types/presentation";

export const useTemplates = () => {
  const [templates, setTemplates] = useState<PresentationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTemplates = () => {
    setLoading(true);
    setError(null);
    fetchPresentationTemplates()
      .then(setTemplates)
      .catch((err) => {
        setError(err?.message || "Не удалось загрузить шаблоны");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const retry = () => {
    loadTemplates();
  };

  return { templates, loading, error, retry };
};
