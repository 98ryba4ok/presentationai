import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState } from "../../../store";
import { logout } from "../../../store/authSlice";
import LogoutModal from "../../LogoutModal/LogoutModal";
import lk_logo from "../../../assets/lk_logo.png";
import profileHeaderArrow from "../../../assets/profileHeaderArrow.svg";
import "./HeaderProfile.css";

const HeaderProfile: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; right: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isOutsideWrapper = ref.current && !ref.current.contains(target);
      const isOutsideDropdown = dropdownRef.current && !dropdownRef.current.contains(target);

      if (isOutsideWrapper && isOutsideDropdown) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 12,
        right: window.innerWidth - rect.right,
      });
    } else {
      setDropdownPosition(null);
    }
  }, [isOpen]);

  if (!user) return null;

  const handleToggle = () => setIsOpen((prev) => !prev);
  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    navigate("/profile");
  };

  const handleLogoutClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    dispatch(logout());
    setShowLogoutModal(false);
    navigate("/");
  };

  const handleCancelLogout = () => setShowLogoutModal(false);

  return (
    <div className="header-profile-wrapper" ref={ref}>
      <div className="header-profile" onClick={handleToggle} ref={buttonRef}>
        <img className="header-profile-circle" src={lk_logo} alt="" />
        <div>
          <div className="header-profile-name">{user.name}</div>
          <div className="header-profile-email">{user.email}</div>
        </div>
        <img className="profileHeaderArrow" src={profileHeaderArrow} alt="" />
      </div>

      {isOpen && dropdownPosition && ReactDOM.createPortal(
        <div
          ref={dropdownRef}
          className="header-profile-dropdown"
          style={{
            position: 'fixed',
            top: dropdownPosition.top,
            right: dropdownPosition.right,
          }}
        >
          <div className="dropdown-item" onClick={handleProfileClick}>
            Личный кабинет
          </div>
          <div className="header-profile-hr"></div>
          <div className="dropdown-item logout" onClick={handleLogoutClick}>
            Выйти
          </div>
        </div>,
        document.body
      )}

      {showLogoutModal && (
        <LogoutModal
          onConfirm={handleConfirmLogout}
          onCancel={handleCancelLogout}
        />
      )}
    </div>
  );
};

export default HeaderProfile;
