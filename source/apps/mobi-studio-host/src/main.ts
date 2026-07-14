import { App } from "./App";
import "./styles.css";

const root = document.getElementById("app");
if (!root) throw new Error("MOBI_STUDIO_HOST_ROOT_NOT_FOUND");

new App(root).mount();

