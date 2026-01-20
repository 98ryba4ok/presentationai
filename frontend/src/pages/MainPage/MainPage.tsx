import React from "react";
import "./MainPage.css";
import Header from "../../components/Header/Header";
import Footer from "../../components/FooterMain/FooterMain";
import HeroSection from "../../components/HeroSection/HeroSection";
import HowItWorks from "../../components/HowItWorks/HowItWorks";
import SamplesSection from "../../components/SamplesSection/SamplesSection";
import { useToast } from "../../components/ToastProvider/ToastProvider";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import { useNavigate } from "react-router-dom";

const MainPage: React.FC = () => {
  const { showToast } = useToast();
  const user = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();

   const handleCreate = () => {
    if (user) {
      navigate("/presentations");
    } else {
      showToast("Сначала нужно авторизироваться", "error");
    }
  };

  return (
    <div className="page-wrapper ">
      <Header />
      <main className="main">
        <div className="main-container">
          <HeroSection />
          <HowItWorks />
          <SamplesSection />
          <div className="trial_card">
            <p className="trial_card-text">3 бесплатных попытки за регистрацию</p>
          </div>

          <h2 className="main-title3">
            Попробуй <span className="highlight">бесплатно</span>
            <br />
            уже сейчас
          </h2>
          <button className="btn btn-primary" onClick={handleCreate}>
            Создать презентацию
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MainPage;
