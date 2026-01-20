import React, { useState, useEffect } from "react";
import "./AuthDialog.css";
import check from "../../assets/check.svg";
import star from "../../assets/star.png";
import closeIcon from "../../assets/close-icon.svg";
import eyeIcon from "../../assets/eyeIcon.svg";
import eyeOffIcon from "../../assets/eyeOffIcon.svg";
import welcomeImg from "../../assets/welcome.png";

import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../store";
import {
  sendRegisterCode,
  verifyRegisterCode,
  sendLoginCode,
  verifyLoginCode,
} from "../../store/authSlice";

import { useToast } from "../../components/ToastProvider/ToastProvider";

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
}

const AuthDialog: React.FC<AuthDialogProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<"register" | "login" | "code" | "welcome">(
    "register"
  );
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState(["", "", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(true);
  const [isPrivacyChecked, setIsPrivacyChecked] = useState(false); 
  const [privacyError, setPrivacyError] = useState(""); 
  const [errors, setErrors] = useState<FieldErrors>({});
  const authState = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();

  useEffect(() => {
    if (step !== "code") return;

    const interval = window.setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [step]);

  // Сброс формы при открытии диалога
  useEffect(() => {
    if (isOpen) {
      setStep("register");
      setEmail("");
      setName("");
      setPassword("");
      setCode(["", "", "", "", ""]);
      setTimer(30);
      setShowPassword(false);
      setIsRegistering(true);
      setIsPrivacyChecked(false);
      setPrivacyError("");
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCodeChange = (index: number, value: string) => {
    if (/^\d?$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      if (value && index < 4) {
        const nextInput = document.getElementById(`code-${index + 1}`);
        nextInput?.focus();
      }

      if (newCode.every((digit) => digit !== "")) {
        setTimeout(() => handleVerifyCode(newCode.join("")), 300);
      }
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const newCode = [...code];

      if (code[index]) {
        // Если в текущем поле есть цифра — удаляем её
        newCode[index] = "";
        setCode(newCode);
      } else if (index > 0) {
        // Если поле пустое — переходим на предыдущее и удаляем там
        newCode[index - 1] = "";
        setCode(newCode);
        const prevInput = document.getElementById(`code-${index - 1}`);
        prevInput?.focus();
      }
    } else if (e.key === "Delete") {
      e.preventDefault();
      const newCode = [...code];
      newCode[index] = "";
      setCode(newCode);
    } else if (e.key === "ArrowLeft" && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    } else if (e.key === "ArrowRight" && index < 4) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    // Извлекаем только цифры
    const digits = pastedData.replace(/\D/g, "").slice(0, 5);

    if (digits.length > 0) {
      const newCode = [...code];
      for (let i = 0; i < 5; i++) {
        newCode[i] = digits[i] || "";
      }
      setCode(newCode);

      // Фокус на последнее заполненное поле или следующее пустое
      const focusIndex = Math.min(digits.length, 4);
      const targetInput = document.getElementById(`code-${focusIndex}`);
      targetInput?.focus();

      // Если вставили полный код — отправляем
      if (newCode.every((digit) => digit !== "")) {
        setTimeout(() => handleVerifyCode(newCode.join("")), 300);
      }
    }
  };

  const handleRegister = async () => {
    const registerErrors: FieldErrors = {};
    let privacyErrorMsg = "";

    if (!name.trim()) registerErrors.name = "Имя обязательно";
    else if (/\d/.test(name)) registerErrors.name = "Имя не должно содержать цифр";

    if (!email.trim()) registerErrors.email = "Email обязателен";
    else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email))
      registerErrors.email = "Неверный email";

    if (!password) registerErrors.password = "Пароль обязателен";
    else if (password.length < 8)
      registerErrors.password = "Пароль минимум 8 символов";

    if (!isPrivacyChecked) privacyErrorMsg = "Необходимо принять политику";
    
    setErrors(registerErrors);
    setPrivacyError(privacyErrorMsg);

    if (Object.keys(registerErrors).length > 0 || privacyErrorMsg) {
      return;
    }

    const res = await dispatch(sendRegisterCode({ email, name, password }));
    if (sendRegisterCode.fulfilled.match(res)) {
      showToast("Код отправлен на почту", "success");
      setStep("code");
      setTimer(30);
      setIsRegistering(true);
    } else {
      showToast(res.payload || "Ошибка регистрации", "error");
    }
  };

  const handleLogin = async () => {

    const loginErrors: FieldErrors = {};

    if (!email.trim()) loginErrors.email = "Email обязателен";
    else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email))
      loginErrors.email = "Неверный email";

    if (!password) loginErrors.password = "Пароль обязателен";
    else if (password.length < 8)
      loginErrors.password = "Пароль минимум 8 символов";
    
    setErrors(loginErrors);
    setPrivacyError("");

    if (Object.keys(loginErrors).length > 0) {
      return;
    }

    const res = await dispatch(sendLoginCode({ email, password }));
    if (sendLoginCode.fulfilled.match(res)) {
      showToast("Код отправлен на почту", "success");
      setStep("code");
      setTimer(30);
      setIsRegistering(false);
    } else {
      showToast(res.payload || "Ошибка входа", "error");
    }
  };

  const handleVerifyCode = async (codeStr?: string) => {
  const finalCode = codeStr || code.join("");
  let res;
  if (isRegistering) {
    res = await dispatch(verifyRegisterCode({ email, code: finalCode }));
    if (verifyRegisterCode.fulfilled.match(res)) {
      showToast("Регистрация успешна", "success");
      setStep("welcome");

      setTimeout(() => {
        onClose();
      }, 3000);
    } else {
      showToast(res.payload || "Неверный код", "error");
      setCode(["", "", "", "", ""]);

      const firstInput = document.getElementById("code-0") as HTMLInputElement;
      firstInput?.focus();
    }
  } else {
    res = await dispatch(verifyLoginCode({ email, code: finalCode }));
    if (verifyLoginCode.fulfilled.match(res)) {
      showToast("Вход успешен", "success");
      setStep("welcome");

      setTimeout(() => {
        onClose();
      }, 3000);
    } else {
      showToast(res.payload || "Неверный код", "error");
      setCode(["", "", "", "", ""]);

      const firstInput = document.getElementById("code-0") as HTMLInputElement;
      firstInput?.focus();
    }
  }
};


  const handleResendCode = async () => {
    if (isRegistering) {
      const res = await dispatch(sendRegisterCode({ email, name, password }));
      if (sendRegisterCode.fulfilled.match(res)) {
        showToast("Код отправлен повторно", "success");
        setTimer(30);
      } else {
        showToast(res.payload || "Ошибка при отправке кода", "error");
      }
    } else {
      const res = await dispatch(sendLoginCode({ email, password }));
      if (sendLoginCode.fulfilled.match(res)) {
        showToast("Код отправлен повторно", "success");
        setTimer(30);
      } else {
        showToast(res.payload || "Ошибка при отправке кода", "error");
      }
    }
  };

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <img
          src={closeIcon}
          alt="Закрыть"
          className="dialog-close"
          onClick={onClose}
        />
        {step !== "code" && step !== "welcome" && (
          <img
            src={star}
            alt="star"
            className={`dialog-star ${
              step === "login" ? "dialog-star--login" : ""
            }`}
          />
        )}

        {step === "register" && (
          <div className="register-step">
            <div className="register-step-upper-gap">
              <h2>Создание аккаунта</h2>
              <div className="register-step-inputs">
                <label htmlFor="name">Имя</label>
                <input
                  id="name"
                  type="text"
                  placeholder="Ваше имя"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    const newErrors = { ...errors };
                    delete newErrors.name;
                    setErrors(newErrors);
                  }}
                  className={errors.name ? "input-error" : ""}
                />
                {errors.name && (
                  <span className="field-error">{errors.name}</span>
                )}
              </div>

              <div className="register-step-inputs">
                <label htmlFor="email">Почта</label>
                <input
                  id="email"
                  type="email"
                  placeholder="Ваша почта"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    const newErrors = { ...errors };
                    delete newErrors.email;
                    setErrors(newErrors);
                  }}
                  className={errors.email ? "input-error" : ""}
                />
                {errors.email && (
                  <span className="field-error">{errors.email}</span>
                )}
              </div>

              <div className="register-step-inputs">
                <label htmlFor="password">Пароль</label>
                <div className="password-input-container">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Минимум 8 символов"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      const newErrors = { ...errors };
                      delete newErrors.password;
                      setErrors(newErrors);
                    }}
                    className={errors.password ? "input-error" : ""}
                  />
                  <img
                    src={showPassword ? eyeOffIcon : eyeIcon}
                    alt={showPassword ? "Скрыть пароль" : "Показать пароль"}
                    className="password-toggle"
                    onClick={() => setShowPassword((prev) => !prev)}
                  />
                </div>
                {errors.password && (
                  <span className="field-error">{errors.password}</span>
                )}
              </div>
            </div>

            <label className="check_privacy">
              <input
                type="checkbox"
                checked={isPrivacyChecked}
                onChange={(e) => {
                  setIsPrivacyChecked(e.target.checked);
                  if (privacyError) setPrivacyError("");
                }}
              />
              <span
                className={`custom_checkbox ${
                  privacyError ? "input-error" : ""
                }`}
              >
                <img src={check} alt="✓" className="check_icon" />
              </span>
              Я принимаю условия политики конфиденциальности
            </label>
            {privacyError && (
              <span className="field-error">{privacyError}</span>
            )}

            <button
              className="register_button"
              onClick={handleRegister}
              disabled={
                authState.isLoading ||
                !isPrivacyChecked ||
                Object.keys(errors).length > 0
              }
            >
              Создать аккаунт
            </button>

            <p className="switch-step-text">
              Уже есть аккаунт?{" "}
              <span className="link" onClick={() => setStep("login")}>
                Войти
              </span>
            </p>
          </div>
        )}

        {step === "login" && (
          <div className="login-step">
            <div className="register-step-upper-gap">
              <h2>Вход</h2>

              <div className="register-step-inputs">
                <label>Почта</label>
                <input
                  type="email"
                  placeholder="Почта"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    const newErrors = { ...errors };
                    delete newErrors.email;
                    setErrors(newErrors);
                  }}
                  className={errors.email ? "input-error" : ""}
                />
                {errors.email && (
                  <span className="field-error">{errors.email}</span>
                )}
              </div>

              <div className="register-step-inputs">
                <label>Пароль</label>
                <div className="password-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Минимум 8 символов"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      const newErrors = { ...errors };
                      delete newErrors.password;
                      setErrors(newErrors);
                    }}
                    className={errors.password ? "input-error" : ""}
                  />
                  <img
                    src={showPassword ? eyeOffIcon : eyeIcon}
                    alt={showPassword ? "Скрыть пароль" : "Показать пароль"}
                    className="password-toggle"
                    onClick={() => setShowPassword((prev) => !prev)}
                  />
                </div>
                {errors.password && (
                  <span className="field-error">{errors.password}</span>
                )}
              </div>
            </div>

            <button onClick={handleLogin} disabled={authState.isLoading}>
              Войти
            </button>

            <p className="switch-step-text">
              Нет аккаунта?{" "}
              <span className="link" onClick={() => setStep("register")}>
                Регистрация
              </span>
            </p>
          </div>
        )}

        {step === "code" && (
          <div className="code-step">
            <h2>Введите код</h2>
            <p className="code-step-email">Отправили код на почту {email}</p>
            <div className="code-inputs">
              {code.map((digit, idx) => {
                const filledCount = code.filter((c) => c !== "").length;
                const isActive = idx === 0 || idx < filledCount;
                return (
                  <span
                    key={idx}
                    className={`code-input-wrapper ${isActive ? "active" : ""}`}
                  >
                    <input
                      id={`code-${idx}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      className="code-input"
                      onChange={(e) => handleCodeChange(idx, e.target.value)}
                      onKeyDown={(e) => handleCodeKeyDown(idx, e)}
                      onPaste={handleCodePaste}
                    />
                  </span>
                );
              })}
            </div>
            <button
              disabled={timer > 0}
              onClick={handleResendCode}
              style={{ marginTop: "20px" }}
            >
              Повторный код {timer > 0 ? `00:${timer}` : ""}
            </button>
          </div>
        )}

        {step === "welcome" && (
          <div className="welcome-step">
            <img src={welcomeImg} alt="Welcome" className="welcome-img" />
            <h2>Добро пожаловать{name ? `, ${name}` : ""}!</h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthDialog;
