import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createTheme, MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import "./reset.css";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import App from "./App.jsx";

const theme = createTheme({
  autoContrast: true,
  luminanceThreshold: 0.3,
  colors: {
    tomatoe: [
      "#fff0e4",
      "#ffe0cf",
      "#fac0a1",
      "#f69e6e",
      "#f28043",
      "#f06e27",
      "#f06418",
      "#d6530c",
      "#bf4906",
      "#a73c00",
    ],
  },

  shadows: {
    md: "1px 1px 3px rgba(0, 0, 0, .25)",
    xl: "5px 5px 3px rgba(0, 0, 0, .25)",
  },

  fontFamily: "Montserrat Alternates, sans-serif",

  headings: {
    sizes: {
      h1: { fontSize: 80 },
    },
  },
  defaultRadius: "sm",
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <MantineProvider theme={theme}>
      <Notifications />
      <App />
    </MantineProvider>
  </StrictMode>
);
