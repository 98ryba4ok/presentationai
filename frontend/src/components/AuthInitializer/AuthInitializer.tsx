import "./AuthInitializer.css";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store";
import { fetchUserProfile } from "../../store/authSlice";

interface AuthInitializerProps {
  children: React.ReactNode;
}

const AuthInitializer: React.FC<AuthInitializerProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const access = localStorage.getItem("access");
    if (access) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch]);

  return <>{children}</>;
};

export default AuthInitializer;
