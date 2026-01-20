import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store";
import "./HeaderUser.css";
import logo from "../../../assets/pr_ai_logo.svg";
import AuthDialog from "../../AuthDialog/AuthDialog";
import HeaderProfile from "../HeaderProfile/HeaderProfile";
import trialStar from "../../../assets/trialStar.svg";

const Header: React.FC = () => {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number } | null>(null);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);
  const trialRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showTooltip && trialRef.current) {
      const rect = trialRef.current.getBoundingClientRect();
      setTooltipPosition({
        top: rect.bottom + 21,
        left: rect.left + rect.width / 2,
      });
    } else {
      setTooltipPosition(null);
    }
  }, [showTooltip]);

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
              <Link to="/presentations" className="nav-link" onClick={closeMobileMenu}>
                Шаблоны
              </Link>
            </nav>
          </div>


          <div className="right-block desktop-actions">
            <div
              className="trial_container"
              ref={trialRef}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <p className="trial_count">{user?.trial_generations.toString()}</p>
              <img className="trial_img" src={trialStar} alt="" />
            </div>
            <HeaderProfile />
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
          <Link to="/presentations" className="mobile-nav-link" onClick={closeMobileMenu}>
            Шаблоны
          </Link>
        </nav>
        <div className="mobile-actions">
          <div className="trial_container mobile-trial">
            <p className="trial_count">{user?.trial_generations.toString()}</p>
            <img className="trial_img" src={trialStar} alt="" />
            <span className="trial_label">доступных генераций</span>
          </div>
          <HeaderProfile />
        </div>
      </div>

      <AuthDialog isOpen={isDialogOpen} onClose={() => setDialogOpen(false)} />

      {showTooltip && tooltipPosition && ReactDOM.createPortal(
        <div
          className="trial_tooltip"
          style={{
            position: 'fixed',
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            transform: 'translateX(-50%)',
          }}
        >
          Количество доступных генераций
        </div>,
        document.body
      )}
    </>
  );
};

export default Header;
