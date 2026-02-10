import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { AppcontextProvider } from "./context/Appcontext.jsx";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-c";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-java";
import "prismjs/components/prism-python";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AppcontextProvider>
      <App />
    </AppcontextProvider>
  </BrowserRouter>,
);
