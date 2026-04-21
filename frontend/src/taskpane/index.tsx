import * as React from "react";
import { createRoot } from "react-dom/client";
import App from "./components/App";

Office.onReady(() => {
  const container = document.getElementById("container");
  if (container) {
    const root = createRoot(container);
    root.render(<App title="My App" />);
  }
});