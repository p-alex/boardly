import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { createHead, UnheadProvider } from "@unhead/react/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthContextProvider } from "./context/AuthContext/AuthContextProvider.tsx";
const queryClient = new QueryClient();

const head = createHead();

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <UnheadProvider head={head}>
        <AuthContextProvider>
          <App />
        </AuthContextProvider>
      </UnheadProvider>
      <ReactQueryDevtools />
    </QueryClientProvider>
  </BrowserRouter>,
);
