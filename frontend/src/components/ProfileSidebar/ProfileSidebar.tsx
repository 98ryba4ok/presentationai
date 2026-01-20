import React from "react";
import "./ProfileSidebar.css";
import cardIcon from "../../assets/CustomeIcon/Card Icon.svg";
import pencilIcon from "../../assets/CustomeIcon/Pencil Icon.svg";
import noteIcon from "../../assets/CustomeIcon/Notebook.svg";
import doorIcon from "../../assets/CustomeIcon/Door open.svg";
import type { TabType } from "../../utils/profileTypes";

interface ProfileSidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onLogoutClick: () => void;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
  activeTab,
  onTabChange,
  onLogoutClick,
}) => {
  return (
    <aside className="profile-sidebar">
      <ul>
        <li
          className={activeTab === "info" ? "active" : ""}
          onClick={() => onTabChange("info")}
        >
          <img src={pencilIcon} alt="" />
          Личная информация
        </li>
        <li
          className={activeTab === "payments" ? "active" : ""}
          onClick={() => onTabChange("payments")}
        >
          <img src={cardIcon} alt="" />
          Оплата генераций
        </li>
        <li
          className={activeTab === "history" ? "active" : ""}
          onClick={() => onTabChange("history")}
        >
          <img src={noteIcon} alt="" />
          История генераций
        </li>
        <li onClick={onLogoutClick}>
          <img src={doorIcon} alt="" />
          Выйти из аккаунта
        </li>
      </ul>
    </aside>
  );
};

export default ProfileSidebar;
