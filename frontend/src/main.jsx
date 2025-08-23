import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App"; // We’ll create this next
import "../index.css"; // Tailwind styles

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
