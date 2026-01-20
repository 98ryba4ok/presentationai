import { useDispatch } from "react-redux";
import type { AppDispatch } from "../store";
import { changePassword } from "../store/authSlice";
import { useToast } from "../components/ToastProvider/ToastProvider";
import { AxiosError } from "axios";

export const usePasswordChange = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();

  const handlePasswordChange = async (
    newPassword: string,
    confirmPassword: string
  ): Promise<void> => {
    if (newPassword !== confirmPassword) {
      showToast("Пароли не совпадают", "error");
      throw new Error("Passwords do not match");
    }

    try {
      const result = await dispatch(changePassword(newPassword)).unwrap();
      showToast(result || "Пароль успешно изменён", "success");
    } catch (err: unknown) {
      let message = "Ошибка при смене пароля";

      if (err instanceof AxiosError) {
        message = err.response?.data?.error || err.message || message;
      } else if (err instanceof Error) {
        message = err.message;
      }

      showToast(message, "error");
      throw err;
    }
  };

  return { handlePasswordChange };
};
