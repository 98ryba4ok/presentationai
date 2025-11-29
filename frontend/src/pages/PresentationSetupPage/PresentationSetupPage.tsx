import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./PresentationSetupPage.css";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import Loader from "../../components/Loader/Loader";
import PresentationHelper from "../../components/PresentationHelper/PresentationHelper";
import error_generation from "../../assets/error_generation.png";
import setupArrow from "../../assets/setupArrow.png";

import generatedpptx from "../../assets/generatedpptx.png";
import {
  fetchPresentationTemplates,
  createUserPresentation,
  generatePresentation,
  saveUserPresentationData,
  downloadUserPresentation,
} from "../../api/presentations";
import type { PresentationTemplate, Slide, UserPresentationData } from "../../types/presentation";

type SlideExtended = Slide & { _id: string };

const PresentationSetupPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [template, setTemplate] = useState<PresentationTemplate | null>(null);
  const [title, setTitle] = useState("");
  const [theme, setTheme] = useState("");
  const [imagePrompt, setImagePrompt] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [slides, setSlides] = useState<SlideExtended[]>([]);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [userPresentationId, setUserPresentationId] = useState<number | null>(null);
  const [pptxUrl, setPptxUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const nextSlide = () => template?.images?.length && setCurrentIndex((p) => (p + 1) % template.images.length);
  const prevSlide = () => template?.images?.length && setCurrentIndex((p) => (p === 0 ? template.images.length - 1 : p - 1));

  useEffect(() => {
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

  const handleNext = async () => {
    if (!template || !theme.trim()) return;
    setLoading(true);
    try {
      let presentation;
      if (userPresentationId) {
        presentation = await generatePresentation(userPresentationId, theme, imagePrompt);
      } else {
        const created = await createUserPresentation(template.id, title || theme);
        setUserPresentationId(created.id);
        presentation = await generatePresentation(created.id, theme, imagePrompt);
      }

      const extended: SlideExtended[] = presentation.data.slides.map((s, i) => ({
        ...s,
        _id: crypto.randomUUID(),
        number: i + 1,
      }));

      setSlides(extended);
      setError(null);
    } catch (err: any) {
      console.error("Error in handleNext:", err);
      setError(err?.response?.data?.error || err?.message || "Ошибка генерации презентации. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  };
  const handleDownload = async () => {
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
      setError(null);
    } catch (err: any) {
      setError(err?.message || "Ошибка скачивания презентации. Попробуйте ещё раз.");
    }
  };

  const handleDragStart = (index: number) => index !== 0 && setDraggingIndex(index);

  const handleDragEnter = (targetIndex: number) => {
    if (draggingIndex === null || targetIndex === 0) return;

    setSlides((prev) => {
      const reordered = [...prev];
      const dragged = reordered[draggingIndex];
      reordered.splice(draggingIndex, 1);
      reordered.splice(targetIndex, 0, dragged);
      return reordered.map((s, i) => ({ ...s, number: i + 1 }));
    });

    setDraggingIndex(targetIndex);
  };

  const handleDragEnd = () => {
    setSlides((prev) => prev.map((s, i) => ({ ...s, number: i + 1 })));
    setDraggingIndex(null);
  };


  const handleSaveSlides = async () => {
    if (!userPresentationId) return;
    setLoading(true);
    try {
      const data: UserPresentationData = { slides };
      const res = await saveUserPresentationData(userPresentationId, data);
      setPptxUrl(res.pptx_file || null); 
      setError(null);
    } catch (err: any) {
      setError(err?.message || "Ошибка сохранения презентации. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="page-wrapper">
      <Header />
      <main className="setup-main">
        <div className="setup-main-section">
          {loading && (
            <div className="loader-overlay">
              <Loader />
            </div>
          )}
          {error && (
            <div className="error-screen">
              <img src={error_generation} alt="" />
              <h3 >Не получилось создать содержание</h3>
              <h4>Измените тему презентации и попробуйте ещё раз</h4>
              <button className="back-btn-err" onClick={() => { setError(null); window.location.reload(); }}>
                К настройкам презентации
              </button>
            </div>
          )}
          {!error && template && (
            <div>
              <div className="setup-steps">
                <div className="setup-step">
                  <div className={slides.length === 0 ? "step_number-active" : "step_number"}><p>1</p></div>
                <span className={slides.length === 0 ? "active-step" : ""}>Выбор шаблона</span>
                </div>
                <img src={setupArrow} alt="" />
                <div className="setup-step">
                  <div className={slides.length > 0 && pptxUrl == null  ? "step_number-active" : "step_number"}><p>2</p></div>
                <span className={slides.length > 0 ? "active-step" : ""}>Просмотр слайдов</span>
                </div>
                         <img src={setupArrow} alt="" />
                <div className="setup-step">
                  <div className={pptxUrl != null ? "step_number-active" : "step_number"}><p>3</p></div>
                <span className={pptxUrl != null ? "active-step" : ""}>Результат</span>
                </div>
              </div>
              <hr className="setup-steps-hr" />
            </div>
          )}
          <div className="setup-template-info">
            {!error && (!template ? null : pptxUrl ? (
              <div className="download-screen">
                <h2>Презентация готова!</h2>
                <img src={generatedpptx} alt="" />
                <button className="download-btn" onClick={handleDownload}>
                  Скачать презентацию
                </button>
                <button className="back-btn-download" onClick={() => navigate(-1)}>К списку презентаций</button>
              </div>
            ) : slides.length > 0 ? (
              <>
                 <h4 className="dragh4">Перетягивайте слайды местами, если хотите поменять их последовательность</h4>
                <div className="generated-slides">
                  {slides.map((slide, index) => (
                    <div
                      key={slide._id}
                      className={`slide-card ${draggingIndex === index ? "dragging" : ""}`}
                      draggable={index !== 0}
                      onDragStart={() => handleDragStart(index)}
                      onDragEnter={() => handleDragEnter(index)}
                      onDragEnd={handleDragEnd}
                    >
                      <h3 className="slide-card-h3">Слайд {slide.number}</h3>
                      <h4 className="slide-card-h4">{slide.title}</h4>
                      <p>{slide.text}</p>
                    </div>
                  ))}
                </div>

                <div className="setup-buttons">
                  <button onClick={() => navigate(-1)} className="back-btn">Назад</button>
                  <button
                    className="next-btn"
                    disabled={loading}
                    onClick={handleSaveSlides}
                  >
                    Сохранить
                  </button>
                </div>
              </>
            ) : (
  
              <>
           
                <div className="slider">
                  {template.images.map((img, index) => (
                    <div
                      key={index}
                      className={`slide ${index === currentIndex ? "active" : ""}`}
                    >
                      <img src={img.image} alt={template.title} />
                    </div>
                  ))}
                  <button className="slider-btn prev" onClick={prevSlide}>‹</button>
                  <button className="slider-btn next" onClick={nextSlide}>›</button>
                </div>

                <div className="SETUP-template-info">
                  <h2>{template.title}</h2>
                  <p>{template.description}</p>
                </div>

                <div className="setup-textarea">
                  <div className="setup-input">
                    <label>Название презентации</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Например: Моя презентация про ИИ"
                    />
                  </div>
                
                  <label>Введите тему презентации или описание слайдов</label>
                  <div className="ph-wrapper">
                    <PresentationHelper />
                  <textarea
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    placeholder="Например: Искусственный интеллект в образовании"
                  />
</div>
                  <div className="setup-input">
                    <label className="img_search-label" >Поиск изображений</label>
                    <p className="img_search">Если поле останется пустым, презентация будет без изображений</p>
                    <input
                      type="text"
                      value={imagePrompt}
                      onChange={(e) => setImagePrompt(e.target.value)}
                      placeholder="Например: космос"
                    />
                  </div>
                </div>

                <div className="setup-buttons">
                  <button onClick={() => navigate(-1)} className="back-btn">Назад</button>
                  <button
                    className="next-btn"
                    disabled={!theme.trim() || loading}
                    onClick={handleNext}
                  >
                    Далее
                  </button>
                </div>
              </>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PresentationSetupPage;
