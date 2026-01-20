import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Provider } from "react-redux";
import { store } from "./store";
import { BrowserRouter } from "react-router-dom";
import { ToastProvider } from "./components/ToastProvider/ToastProvider";
import AuthInitializer from "./components/AuthInitializer/AuthInitializer";
import PageLoader from "./components/PageLoader/PageLoader";
import AppRoutes from "./routes";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <AuthInitializer>
        <BrowserRouter>
          <ToastProvider>
            <Suspense fallback={<PageLoader />}>
              <AppRoutes />
            </Suspense>
          </ToastProvider>
        </BrowserRouter>
      </AuthInitializer>
    </Provider>
  </StrictMode>
);
