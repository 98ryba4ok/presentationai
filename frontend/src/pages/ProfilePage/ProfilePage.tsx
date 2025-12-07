import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../store";
import { logout, changePassword } from "../../store/authSlice";
import { useToast } from "../../components/ToastProvider/ToastProvider";
import LogoutModal from "../../components/LogoutModal/LogoutModal";
import DeletePresentationModal from "../../components/DeletePresentationModal/DeletePresentationModal";
import "./ProfilePage.css";
import Header from "../../components/Header/Header";
import cardIcon from "../../assets/CustomeIcon/Card Icon.svg";
import pencilIcon from "../../assets/CustomeIcon/Pencil Icon.svg";
import noteIcon from "../../assets/CustomeIcon/Notebook.svg";
import doorIcon from "../../assets/CustomeIcon/Door open.svg";
import eyeIcon from "../../assets/eyeIcon.svg";
import eyeOffIcon from "../../assets/eyeOffIcon.svg";
import profile_starcount from "../../assets/profile_starcount.svg";
import iconFire from "../../assets/iconFire.png";
import { AxiosError } from "axios";
import Footer from "../../components/Footer/Footer";
import {
  fetchUserPresentations,
  deleteUserPresentation,
} from "../../api/presentations";
import type { UserPresentation } from "../../types/presentation";
const ProfilePage: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();
  const [presentations, setPresentations] = useState<UserPresentation[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [activeTab, setActiveTab] = useState<"info" | "payments" | "history">(
    "info"
  );
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [generationCount, setGenerationCount] = useState(10);

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    presentationId: number | null;
    presentationTitle: string;
  }>({
    isOpen: false,
    presentationId: null,
    presentationTitle: "",
  });

  useEffect(() => {
    const loadHistory = async () => {
      if (activeTab !== "history") return;

      setLoadingHistory(true);
      try {
        const data = await fetchUserPresentations();
        setPresentations(data);
      } catch {
        showToast("Ошибка загрузки истории", "error");
      }
      setLoadingHistory(false);
    };

    loadHistory();
  }, [activeTab, showToast]);

  if (!user) return <p>Загрузка профиля...</p>;

  const openDeleteModal = (id: number, title: string) => {
    setDeleteModalState({
      isOpen: true,
      presentationId: id,
      presentationTitle: title,
    });
  };

  const closeDeleteModal = () => {
    setDeleteModalState({
      isOpen: false,
      presentationId: null,
      presentationTitle: "",
    });
  };

  const handleDelete = async (): Promise<void> => {
    if (!deleteModalState.presentationId) return;

    try {
      await deleteUserPresentation(deleteModalState.presentationId);
      setPresentations((prev) =>
        prev.filter((p) => p.id !== deleteModalState.presentationId)
      );
      showToast("Презентация удалена", "success");
      closeDeleteModal();
    } catch {
      showToast("Ошибка при удалении", "error");
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    dispatch(logout());
    showToast("Вы вышли из аккаунта", "success");
    setShowLogoutModal(false);
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      showToast("Пароли не совпадают", "error");
      return;
    }

    try {
      const result = await dispatch(changePassword(newPassword)).unwrap();
      showToast(result || "Пароль успешно изменён", "success");
      setNewPassword("");
      setConfirmPassword("");
      setIsEditingPassword(false);
    } catch (err: unknown) {
      let message = "Ошибка при смене пароля";

      if (err instanceof AxiosError) {
        message = err.response?.data?.error || err.message || message;
      } else if (err instanceof Error) {
        message = err.message;
      }

      showToast(message, "error");
    }
  };

  return (
    <div className="profile-page">
      <Header />
      <div className="profile-container">
        <aside className="profile-sidebar">
          <ul>
            <li
              className={activeTab === "info" ? "active" : ""}
              onClick={() => setActiveTab("info")}
            >
              <img src={pencilIcon} alt="" />
              Личная информация
            </li>
            <li
              className={activeTab === "payments" ? "active" : ""}
              onClick={() => setActiveTab("payments")}
            >
              <img src={cardIcon} alt="" />
              Оплата генераций
            </li>
            <li
              className={activeTab === "history" ? "active" : ""}
              onClick={() => setActiveTab("history")}
            >
              <img src={noteIcon} alt="" />
              История генераций
            </li>
            <li onClick={handleLogoutClick}>
              <img src={doorIcon} alt="" />
              Выйти из аккаунта
            </li>
          </ul>
        </aside>

        <hr className="profile-vertical-hr" />

        <main className="profile-content">
          {activeTab === "info" && (
            <div className="tab-info">
              <h2 className="tab-info-h2">Личная информация</h2>
              <div className="form-group">
                <label>Имя</label>
                <input type="text" value={user.name} readOnly />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={user.email} readOnly />
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
                <form onSubmit={handleSavePassword} className="password-form">
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
                          showConfirmPassword
                            ? "Скрыть пароль"
                            : "Показать пароль"
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
              )}
            </div>
          )}
          {activeTab === "payments" && (
            <div className="tab-payments">
              <h2 className="tab-info-h2">Оплата генераций</h2>

              <div className="payments-info">
                <div className="slider-block">
                  <label htmlFor="generationRange">Количество генераций</label>
                  <div className="slider-row">
                    <input
                      id="generationRange"
                      type="range"
                      min="1"
                      max="100"
                      value={generationCount}
                      onChange={(e) =>
                        setGenerationCount(Number(e.target.value))
                      }
                      style={{
                        background: `linear-gradient(90deg, #9F2EFD ${
                          (generationCount / 100) * 100
                        }%, #3B3B3B ${(generationCount / 100) * 100}%)`,
                      }}
                    />
                    <div className="slider-input-wrapper">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={generationCount}
                        onChange={(e) => {
                          const val = Math.max(
                            1,
                            Math.min(100, Number(e.target.value))
                          );
                          setGenerationCount(val);
                        }}
                        className="slider-input"
                      />
                      <img
                        src={profile_starcount}
                        alt="звёздочка"
                        className="slider-star"
                      />
                    </div>
                  </div>
                </div>

                <div className="price-card">
                  <h3 className="price-title">Стоимость</h3>

                  {generationCount < 100 ? (
                    <div className="price-content">
                      <p className="price-generations">
                        За <span>{generationCount}</span> генераций
                      </p>
                      <p className="price-current">{generationCount * 25} ₽</p>
                    </div>
                  ) : null}

                  <div className="price-promo">
                    <img src={iconFire} alt="" className="price-fire" />
                    <h4 className="price-promo-ti">100 генераций</h4>
                    <p className="price-old">
                      2000 ₽ <span>2500 ₽</span>
                    </p>
                  </div>
                </div>
              </div>
              <a
                className="price-promo-button"
                href="https://t.me/prai_presentations"
                target="_blank"
                rel="noopener noreferrer"
                role="button"
              >
                Оплата генераций
              </a>
            </div>
          )}

          {activeTab === "history" && (
            <div className="history-tab">
              <h2 className="tab-info-h2">История генераций</h2>

              {loadingHistory && <p>Загрузка...</p>}

              {!loadingHistory && presentations.length === 0 && (
                <p className="no_generated">
                  У вас пока нет сгенерированных презентаций
                </p>
              )}

              {!loadingHistory &&
                presentations.map((p) => (
                  <div key={p.id} className="history-item">
                    <div className="history-info">
                      <h3>{p.title || "Без названия"}</h3>
                      <p className="history-date">
                        {new Date(p.created_at).toLocaleString()}
                      </p>
                    </div>

                    <div className="history-actions">
                      <a
                        href={p.pptx_file || ""}
                        download
                        className="history-download"
                      >
                        Скачать
                      </a>

                      <button
                        className="history-delete"
                        onClick={() => openDeleteModal(p.id, p.title)}
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </main>
      </div>
      <Footer />
      {showLogoutModal && (
        <LogoutModal
          onConfirm={handleConfirmLogout}
          onCancel={handleCancelLogout}
        />
      )}
      {deleteModalState.isOpen && (
        <DeletePresentationModal
          title={deleteModalState.presentationTitle}
          onConfirm={handleDelete}
          onCancel={closeDeleteModal}
        />
      )}
    </div>
  );
};

export default ProfilePage;
