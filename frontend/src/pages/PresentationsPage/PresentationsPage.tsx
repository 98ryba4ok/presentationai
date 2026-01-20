import React from "react";
import "./PresentationsPage.css";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import TemplatesGrid from "../../components/TemplatesGrid/TemplatesGrid";
import Loader from "../../components/Loader/Loader";
import { useNavigate } from "react-router-dom";
import { useTemplates } from "../../hooks/useTemplates";

const PresentationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { templates, loading, error, retry } = useTemplates();

  return (
    <div className="page-wrapper">
      <Header />
      <main className="main presentations-grid">
        {loading && (
          <div className="presentations-loader">
            <Loader />
          </div>
        )}
        {error && !loading && (
          <div className="presentations-error">
            <p>{error}</p>
            <button onClick={retry}>Попробовать снова</button>
          </div>
        )}
        {!loading && !error && (
          <TemplatesGrid
            templates={templates}
            onSelect={(id) => navigate(`/presentations/${id}`)}
          />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default PresentationsPage;
