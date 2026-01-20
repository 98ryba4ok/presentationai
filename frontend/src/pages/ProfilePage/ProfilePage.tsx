import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../store";
import { logout } from "../../store/authSlice";
import { useToast } from "../../components/ToastProvider/ToastProvider";
import LogoutModal from "../../components/LogoutModal/LogoutModal";
import DeletePresentationModal from "../../components/DeletePresentationModal/DeletePresentationModal";
import "./ProfilePage.css";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import ProfileSidebar from "../../components/ProfileSidebar/ProfileSidebar";
import PersonalInfoTab from "../../components/PersonalInfoTab/PersonalInfoTab";
import PaymentsTab from "../../components/PaymentsTab/PaymentsTab";
import HistoryTab from "../../components/HistoryTab/HistoryTab";
import { usePasswordChange } from "../../hooks/usePasswordChange";
import { usePresentationsHistory } from "../../hooks/usePresentationsHistory";
import type { TabType, DeleteModalState } from "../../utils/profileTypes";
const ProfilePage: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<TabType>("info");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [deleteModalState, setDeleteModalState] = useState<DeleteModalState>({
    isOpen: false,
    presentationId: null,
    presentationTitle: "",
  });

  const { handlePasswordChange } = usePasswordChange();
  const { presentations, loading: loadingHistory, handleDelete: deletePresentationById } = usePresentationsHistory(activeTab);

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
      await deletePresentationById(deleteModalState.presentationId);
      closeDeleteModal();
    } catch {
      // Error is already handled in the hook
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

  return (
    <div className="profile-page">
      <Header />
      <div className="profile-container">
        <ProfileSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogoutClick={handleLogoutClick}
        />

        <hr className="profile-vertical-hr" />

        <main className="profile-content">
          {activeTab === "info" && (
            <PersonalInfoTab
              userName={user.name}
              userEmail={user.email}
              onPasswordChange={handlePasswordChange}
            />
          )}

          {activeTab === "payments" && <PaymentsTab />}

          {activeTab === "history" && (
            <HistoryTab
              presentations={presentations}
              loading={loadingHistory}
              onDelete={openDeleteModal}
            />
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
