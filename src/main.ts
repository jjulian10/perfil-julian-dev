import "./styles.scss";
import "./intro.scss";

import { initIntro } from "./intro";
import { initIntroScene } from "./intro-scene";
import { initScene } from "./scene";
import { initUi } from "./ui";

const start = (): void => {
  initIntroScene();
  initIntro();

  initUi();
  initScene();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start, {
    once: true
  });
} else {
  start();
}