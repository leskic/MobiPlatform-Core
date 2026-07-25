import { App } from "./App";
import "./styles.css";

const root = document.getElementById("app");
if (!root) throw new Error("MOBI_GESTOR_ROOT_NOT_FOUND");

new App(root).mount();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js");
}
