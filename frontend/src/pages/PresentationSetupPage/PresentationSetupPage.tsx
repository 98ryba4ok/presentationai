import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./PresentationSetupPage.css";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import Loader from "../../components/Loader/Loader";
import StepIndicator from "../../components/StepIndicator/StepIndicator";
import TemplateSlider from "../../components/TemplateSlider/TemplateSlider";
import TemplateInfo from "../../components/TemplateInfo/TemplateInfo";
import PresentationForm from "../../components/PresentationForm/PresentationForm";
import SlidesEditor from "../../components/SlidesEditor/SlidesEditor";
import DownloadScreen from "../../components/DownloadScreen/DownloadScreen";
import ErrorScreen from "../../components/ErrorScreen/ErrorScreen";
import { useTemplateById } from "../../hooks/useTemplateById";
import { usePresentationGeneration } from "../../hooks/usePresentationGeneration";
import { useSlidesDragAndDrop } from "../../hooks/useSlidesDragAndDrop";

const PresentationSetupPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [theme, setTheme] = useState("");
  const [imagePrompt, setImagePrompt] = useState("");

  const { template, loading: templateLoading, error } = useTemplateById(id);
  const {
    slides,
    setSlides,
    pptxUrl,
    loading: generationLoading,
    handleGenerate,
    handleSave,
    handleDownload,
  } = usePresentationGeneration();

  const {
    draggingIndex,
    containerRef,
    handleDragStart,
    handleDragEnter,
    handleDragEnd,
  } = useSlidesDragAndDrop(slides, setSlides);

  const loading = templateLoading || generationLoading;

  const handleNext = async () => {
    if (!template) return;
    try {
      await handleGenerate(template.id, title, theme, imagePrompt);
    } catch (err) {
      // Error is already handled in the hook
    }
  };

  const handleDownloadClick = async () => {
    try {
      await handleDownload(title);
    } catch (err) {
      // Error is already handled in the hook
    }
  };

  const handleSaveSlides = async () => {
    try {
      await handleSave();
    } catch (err) {
      // Error is already handled in the hook
    }
  };

  const getStep = (): 1 | 2 | 3 => {
    if (pptxUrl) return 3;
    if (slides.length > 0) return 2;
    return 1;
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
            <ErrorScreen
              onRetry={() => {
                window.location.reload();
              }}
            />
          )}
          {!error && template && <StepIndicator currentStep={getStep()} />}
          <div className="setup-template-info">
            {!error &&
              (!template ? null : pptxUrl ? (
                <DownloadScreen
                  onDownload={handleDownloadClick}
                  onBack={() => navigate(-1)}
                />
              ) : slides.length > 0 ? (
                <SlidesEditor
                  slides={slides}
                  draggingIndex={draggingIndex}
                  containerRef={containerRef}
                  onDragStart={handleDragStart}
                  onDragEnter={handleDragEnter}
                  onDragEnd={handleDragEnd}
                  onSave={handleSaveSlides}
                  onBack={() => navigate(-1)}
                  loading={loading}
                />
              ) : (
                <>
                  <TemplateSlider template={template} />
                  <TemplateInfo template={template} />
                  <PresentationForm
                    title={title}
                    theme={theme}
                    imagePrompt={imagePrompt}
                    onTitleChange={setTitle}
                    onThemeChange={setTheme}
                    onImagePromptChange={setImagePrompt}
                    onSubmit={handleNext}
                    onBack={() => navigate(-1)}
                    loading={loading}
                  />
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
