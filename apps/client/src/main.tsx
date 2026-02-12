import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { createHead, UnheadProvider } from "@unhead/react/client";
import { BrowserRouter } from "react-router-dom";

const head = createHead();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <UnheadProvider head={head}>
        <App />
      </UnheadProvider>
    </BrowserRouter>
  </StrictMode>,
);
