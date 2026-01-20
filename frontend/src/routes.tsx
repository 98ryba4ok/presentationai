import { lazy } from "react";
import { Routes, Route } from "react-router-dom";

const MainPage = lazy(() => import("./pages/MainPage/MainPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage/ProfilePage"));
const PresentationsPage = lazy(() => import("./pages/PresentationsPage/PresentationsPage"));
const PresentationSetupPage = lazy(() => import("./pages/PresentationSetupPage/PresentationSetupPage"));

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/presentations" element={<PresentationsPage />} />
      <Route path="/presentations/:id" element={<PresentationSetupPage />} />
    </Routes>
  );
};

export default AppRoutes;
