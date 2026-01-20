import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./HeaderAuth.css";
import logo from "../../../assets/pr_ai_logo.svg";
import AuthDialog from "../../AuthDialog/AuthDialog";
import { useToast } from "../../../components/ToastProvider/ToastProvider";
const HeaderMainPage: React.FC = () => {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { showToast } = useToast();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="header">
        <div className="header-container">
          <div className="left-block">
            <Link to="/" className="logo">
              <img className="logo_img" src={logo} alt="logo_pr_ai" />
            </Link>

            <nav className="nav desktop-nav">
            <a href="#how-it-works" className="nav-link">
    Как работает
  </a>
  <Link to="/presentations" className="nav-link">
    Шаблоны
  </Link>
            </nav>
          </div>

          <div className="right-block desktop-actions">
              <button
                className="btn-secondary"
                onClick={() => setDialogOpen(true)}
              >
                Войти
              </button>
            <button className="btn-primary" onClick={() => showToast('Сначала нужно авторизироваться', 'error')}>Создать презентацию</button>
          </div>

          <button className="burger-btn" onClick={toggleMobileMenu} aria-label="Toggle menu">
            <span className={`burger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
            <span className={`burger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
            <span className={`burger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
          </button>
        </div>
      </header>

      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <nav className="mobile-nav">
          <a href="#how-it-works" className="mobile-nav-link" onClick={closeMobileMenu}>
            Как работает
          </a>
          <Link to="/presentations" className="mobile-nav-link" onClick={closeMobileMenu}>
            Шаблоны
          </Link>
        </nav>
        <div className="mobile-actions">
          <button
            className="btn-secondary mobile-btn"
            onClick={() => {
              closeMobileMenu();
              setDialogOpen(true);
            }}
          >
            Войти
          </button>
          <button
            className="btn-primary mobile-btn"
            onClick={() => {
              closeMobileMenu();
              showToast('Сначала нужно авторизироваться', 'error');
            }}
          >
            Создать презентацию
          </button>
        </div>
      </div>

      <AuthDialog isOpen={isDialogOpen} onClose={() => setDialogOpen(false)} />
    </>
  );
};

export default HeaderMainPage;
