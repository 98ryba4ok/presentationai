import React, { useState } from "react";
import "./PasswordChangeForm.css";
import eyeIcon from "../../assets/eyeIcon.svg";
import eyeOffIcon from "../../assets/eyeOffIcon.svg";

interface PasswordChangeFormProps {
  onSubmit: (newPassword: string, confirmPassword: string) => Promise<void>;
}

const PasswordChangeForm: React.FC<PasswordChangeFormProps> = ({
  onSubmit,
}) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(newPassword, confirmPassword);
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <form onSubmit={handleSubmit} className="password-form">
      <div className="form-group">
        <label>Введите новый пароль</label>
        <div className="password-input-container11">
          <input
            type={showPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <img
            src={showPassword ? eyeOffIcon : eyeIcon}
            alt={showPassword ? "Скрыть пароль" : "Показать пароль"}
            className="password-toggle11"
            onClick={() => setShowPassword((prev) => !prev)}
          />
        </div>
      </div>

      <div className="form-group">
        <label>Повторите новый пароль</label>
        <div className="password-input-container11">
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <img
            src={showConfirmPassword ? eyeOffIcon : eyeIcon}
            alt={
              showConfirmPassword ? "Скрыть пароль" : "Показать пароль"
            }
            className="password-toggle11"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
          />
        </div>
      </div>

      <button type="submit" className="profile-save">
        Сохранить
      </button>
    </form>
  );
};

export default PasswordChangeForm;
