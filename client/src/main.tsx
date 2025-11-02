// Import polyfill shims BEFORE anything else
import 'vite-plugin-node-polyfills/shims/buffer';
import 'vite-plugin-node-polyfills/shims/global';
import 'vite-plugin-node-polyfills/shims/process';

import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
