import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
); if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // 你的網站會在 /ivy/ 底下，所以用相對路徑最安全
    navigator.serviceWorker.register('./service-worker.js').catch(() => {});
  });
}
