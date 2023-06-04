import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { CatchErrors } from "./components/CatchErrors/CatchErrors.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <CatchErrors>
      <App />
    </CatchErrors>
  </React.StrictMode>
);
