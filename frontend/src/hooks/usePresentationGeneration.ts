import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store";
import { fetchUserProfile } from "../store/authSlice";
import { useToast } from "../components/ToastProvider/ToastProvider";
import {
  createUserPresentation,
  generatePresentation,
  saveUserPresentationData,
  downloadUserPresentation,
} from "../api/presentations";
import type { Slide, UserPresentationData } from "../types/presentation";

type SlideExtended = Slide & { _id: string; number: number };

export const usePresentationGeneration = () => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const { showToast } = useToast();

  const [userPresentationId, setUserPresentationId] = useState<number | null>(null);
  const [slides, setSlides] = useState<SlideExtended[]>([]);
  const [pptxUrl, setPptxUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (
    templateId: number,
    title: string,
    theme: string,
    imagePrompt: string
  ): Promise<void> => {
    if (!user || user.trial_generations <= 0) {
      showToast("У вас закончились генерации. Пополните баланс.", "error");
      return;
    }

    if (!theme.trim()) return;

    setLoading(true);
    try {
      let presentation;

      if (userPresentationId) {
        presentation = await generatePresentation(
          userPresentationId,
          theme,
          imagePrompt
        );
      } else {
        const created = await createUserPresentation(templateId, title || theme);
        setUserPresentationId(created.id);

        presentation = await generatePresentation(created.id, theme, imagePrompt);
      }

      const extended: SlideExtended[] = presentation.data.slides.map(
        (s, i) => ({
          ...s,
          _id: crypto.randomUUID(),
          number: i + 1,
        })
      );

      setSlides(extended);
    } catch (err: any) {
      console.error("Error in handleGenerate:", err);

      showToast(
        err?.response?.data?.error ||
          err?.message ||
          "Ошибка генерации. Попробуйте ещё раз.",
        "error"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (): Promise<void> => {
    if (!userPresentationId) return;
    setLoading(true);
    try {
      const data: UserPresentationData = { slides };
      const res = await saveUserPresentationData(userPresentationId, data);
      setPptxUrl(res.pptx_file || null);
      if (res.pptx_file) {
        dispatch(fetchUserProfile());
      }
    } catch (err: any) {
      showToast(
        err?.message || "Ошибка сохранения презентации. Попробуйте ещё раз.",
        "error"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (title: string): Promise<void> => {
    if (!userPresentationId) return;
    try {
      const blob = await downloadUserPresentation(userPresentationId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title || "presentation"}.pptx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      showToast(
        err?.message || "Ошибка скачивания презентации. Попробуйте ещё раз.",
        "error"
      );
      throw err;
    }
  };

  return {
    slides,
    setSlides,
    pptxUrl,
    loading,
    handleGenerate,
    handleSave,
    handleDownload,
  };
};
