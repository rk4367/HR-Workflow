import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root container missing");
}

const renderApp = () => createRoot(container).render(<App />);

(async () => {
  const enableMocks = import.meta.env.VITE_DISABLE_MSW !== "true";
  if (enableMocks) {
    try {
      const { setupMocks } = await import("./api/mocks");
      await setupMocks();
    } catch (err) {
      console.warn("MSW setup failed, continuing without mocks", err);
    }
  }
  renderApp();
})();
