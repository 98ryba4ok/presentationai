import React, { useState } from "react";
import "./PersonalInfoTab.css";
import pencilIcon from "../../assets/CustomeIcon/Pencil Icon.svg";
import PasswordChangeForm from "../PasswordChangeForm/PasswordChangeForm";

interface PersonalInfoTabProps {
  userName: string;
  userEmail: string;
  onPasswordChange: (newPassword: string, confirmPassword: string) => Promise<void>;
}

const PersonalInfoTab: React.FC<PersonalInfoTabProps> = ({
  userName,
  userEmail,
  onPasswordChange,
}) => {
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  const handlePasswordSubmit = async (
    newPassword: string,
    confirmPassword: string
  ) => {
    await onPasswordChange(newPassword, confirmPassword);
    setIsEditingPassword(false);
  };

  return (
    <div className="tab-info">
      <h2 className="tab-info-h2">Личная информация</h2>
      <div className="form-group">
        <label>Имя</label>
        <input type="text" value={userName} readOnly />
      </div>
      <div className="form-group">
        <label>Email</label>
        <input type="email" value={userEmail} readOnly />
      </div>

      <h3 className="tab-info-h3">Безопасность</h3>
      {!isEditingPassword ? (
        <div className="password-section">
          <input
            type="password"
            value="********"
            readOnly
            className="password-placeholder"
          />
          <button
            type="button"
            className="profile-change"
            onClick={() => setIsEditingPassword(true)}
          >
            <img src={pencilIcon} alt="" />
          </button>
        </div>
      ) : (
        <PasswordChangeForm onSubmit={handlePasswordSubmit} />
      )}
    </div>
  );
};

export default PersonalInfoTab;
