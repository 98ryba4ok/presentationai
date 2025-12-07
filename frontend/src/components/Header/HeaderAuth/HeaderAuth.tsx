import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./HeaderAuth.css";
import logo from "../../../assets/pr_ai_logo.svg";
import AuthDialog from "../../AuthDialog/AuthDialog";
import { useToast } from "../../../components/ToastProvider/ToastProvider";
const HeaderMainPage: React.FC = () => {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const { showToast } = useToast();

  return (
    <>
      <header className="header">
        <div className="header-container">
          <div className="left-block">
            <Link to="/" className="logo">
              <img className="logo_img" src={logo} alt="logo_pr_ai" />
            </Link>

            <nav className="nav">
            <a href="#how-it-works" className="nav-link">
    Как работает
  </a>
  <a href="#templates" className="nav-link">
    Шаблоны
  </a>
            </nav>
          </div>

          <div className="right-block">
              <button
                className="btn-secondary"
                onClick={() => setDialogOpen(true)}
              >
                Войти
              </button>
            <button className="btn-primary" onClick={() => showToast('Сначала нужно зарегестрироваться', 'error')}>Создать презентацию</button>
          </div>
        </div>
      </header>
      <AuthDialog isOpen={isDialogOpen} onClose={() => setDialogOpen(false)} />
    </>
  );
};

export default HeaderMainPage;
