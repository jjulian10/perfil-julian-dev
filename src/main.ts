import "./styles.scss";
import "./intro.scss";
import "./hero.scss";
import "./projects.scss";
import "./services.scss";
import "./contact.scss";

import { initIntro } from "./intro";
import { initIntroScene } from "./intro-scene";
import { initScene } from "./scene";
import { initUi } from "./ui";
import { initAnalytics } from "./analytics";

const start = (): void => {
  initAnalytics();
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