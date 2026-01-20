import { useState, useEffect } from "react";
import { fetchPresentationTemplates } from "../api/presentations";
import type { PresentationTemplate } from "../types/presentation";

export const useTemplateById = (id: string | undefined) => {
  const [template, setTemplate] = useState<PresentationTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setError(null);
    fetchPresentationTemplates()
      .then((templates) => {
        const found = templates.find((t) => t.id === Number(id));
        setTemplate(found || null);
      })
      .catch((err) => {
        console.error(err);
        setError(err?.message || "Ошибка загрузки шаблона");
      })
      .finally(() => setLoading(false));
  }, [id]);

  return { template, loading, error };
};
